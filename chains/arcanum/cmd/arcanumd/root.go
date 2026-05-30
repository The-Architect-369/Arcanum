package main

import (
	"errors"
	"io"
	"os"

	cmtcfg "github.com/cometbft/cometbft/config"
	addresscodec "github.com/cosmos/cosmos-sdk/codec/address"
	"cosmossdk.io/log"
	confixcmd "cosmossdk.io/tools/confix/cmd"
	dbm "github.com/cosmos/cosmos-db"
	"github.com/cosmos/cosmos-sdk/client"
	clientconfig "github.com/cosmos/cosmos-sdk/client/config"
	"github.com/cosmos/cosmos-sdk/client/debug"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/keys"
	"github.com/cosmos/cosmos-sdk/client/pruning"
	"github.com/cosmos/cosmos-sdk/client/rpc"
	"github.com/cosmos/cosmos-sdk/client/snapshot"
	"github.com/cosmos/cosmos-sdk/server"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
	sdkmodule "github.com/cosmos/cosmos-sdk/types/module"
	authcmd "github.com/cosmos/cosmos-sdk/x/auth/client/cli"
	genutilcli "github.com/cosmos/cosmos-sdk/x/genutil/client/cli"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"arcanum/app"
)

func NewRootCmd() *cobra.Command {
	encodingConfig := app.MakeEncodingConfig()
	accountAddressCodec := addresscodec.NewBech32Codec(app.AccountAddressPrefix)
	validatorAddressCodec := addresscodec.NewBech32Codec(app.AccountAddressPrefix + "valoper")
	consensusAddressCodec := addresscodec.NewBech32Codec(app.AccountAddressPrefix + "valcons")

	initClientCtx := client.Context{}.
		WithCodec(encodingConfig.Codec).
		WithInterfaceRegistry(encodingConfig.InterfaceRegistry).
		WithTxConfig(encodingConfig.TxConfig).
		WithLegacyAmino(encodingConfig.Amino).
		WithInput(os.Stdin).
		WithHomeDir(app.DefaultHome()).
		WithViper("")
	initClientCtx.AddressCodec = accountAddressCodec
	initClientCtx.ValidatorAddressCodec = validatorAddressCodec
	initClientCtx.ConsensusAddressCodec = consensusAddressCodec

	rootCmd := &cobra.Command{
		Use:           "arcanumd",
		Short:         "Arcanum daemon",
		SilenceUsage:  true,
		SilenceErrors: true,
		PersistentPreRunE: func(cmd *cobra.Command, _ []string) error {
			clientCtx := initClientCtx.WithCmdContext(cmd.Context())
			clientCtx, err := client.ReadPersistentCommandFlags(clientCtx, cmd.Flags())
			if err != nil {
				return err
			}
			clientCtx, err = clientconfig.ReadFromClientConfig(clientCtx)
			if err != nil {
				return err
			}
			if err := client.SetCmdClientContextHandler(clientCtx, cmd); err != nil {
				return err
			}
			return server.InterceptConfigsPreRunHandler(cmd, "", nil, cmtcfg.DefaultConfig())
		},
	}

	rootCmd.PersistentFlags().String(flags.FlagHome, app.DefaultHome(), "directory for config and data")
	rootCmd.PersistentFlags().String(flags.FlagChainID, "", "The network chain ID")

	initRootCmd(rootCmd, encodingConfig.TxConfig, app.ModuleBasicsRef())
	return rootCmd
}

func Execute() {
	if err := NewRootCmd().Execute(); err != nil {
		_, _ = os.Stderr.WriteString(err.Error())
		os.Exit(1)
	}
}

func initRootCmd(rootCmd *cobra.Command, txConfig client.TxConfig, basicManager sdkmodule.BasicManager) {
	rootCmd.AddCommand(
		versionCmd(),
		genutilcli.InitCmd(basicManager, app.DefaultHome()),
		debug.Cmd(),
		confixcmd.ConfigCommand(),
		pruning.Cmd(newApp, app.DefaultHome()),
		snapshot.Cmd(newApp),
	)

	server.AddCommandsWithStartCmdOptions(rootCmd, app.DefaultHome(), newApp, appExport, server.StartCmdOptions{})

	rootCmd.AddCommand(
		server.StatusCommand(),
		genutilcli.Commands(txConfig, basicManager, app.DefaultHome()),
		queryCommand(),
		txCommand(),
		keys.Commands(),
	)
}

func versionCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "Print daemon version information",
		RunE: func(cmd *cobra.Command, args []string) error {
			_, err := cmd.OutOrStdout().Write([]byte(app.AppName() + "\n"))
			return err
		},
	}
}

func queryCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        "query",
		Aliases:                    []string{"q"},
		Short:                      "Querying subcommands",
		DisableFlagParsing:         false,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	cmd.AddCommand(
		rpc.WaitTxCmd(),
		rpc.ValidatorCommand(),
		server.QueryBlockCmd(),
		authcmd.QueryTxsByEventsCmd(),
		server.QueryBlocksCmd(),
		authcmd.QueryTxCmd(),
		server.QueryBlockResultsCmd(),
	)

	return cmd
}

func txCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        "tx",
		Short:                      "Transactions subcommands",
		DisableFlagParsing:         false,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	cmd.AddCommand(
		authcmd.GetSignCommand(),
		authcmd.GetSignBatchCommand(),
		authcmd.GetMultiSignCommand(),
		authcmd.GetMultiSignBatchCmd(),
		authcmd.GetValidateSignaturesCommand(),
		flags.LineBreak,
		authcmd.GetBroadcastCommand(),
		authcmd.GetEncodeCommand(),
		authcmd.GetDecodeCommand(),
		authcmd.GetSimulateCmd(),
	)

	return cmd
}

func newApp(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	appOpts servertypes.AppOptions,
) servertypes.Application {
	baseappOptions := server.DefaultBaseappOptions(appOpts)
	return app.New(logger, db, traceStore, true, appOpts, baseappOptions...)
}

func appExport(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	height int64,
	forZeroHeight bool,
	jailAllowedAddrs []string,
	appOpts servertypes.AppOptions,
	modulesToExport []string,
) (servertypes.ExportedApp, error) {
	_ = logger
	_ = db
	_ = traceStore
	_ = height
	_ = forZeroHeight
	_ = jailAllowedAddrs
	_ = modulesToExport

	homePath, ok := appOpts.Get(flags.FlagHome).(string)
	if !ok || homePath == "" {
		return servertypes.ExportedApp{}, errors.New("application home not set")
	}
	if _, ok := appOpts.(*viper.Viper); !ok {
		return servertypes.ExportedApp{}, errors.New("app export is not restored for the current runtime surface yet")
	}

	return servertypes.ExportedApp{}, errors.New("app export is not restored for the current runtime surface yet")
}
