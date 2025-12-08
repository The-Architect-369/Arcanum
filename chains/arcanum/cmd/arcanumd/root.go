package main

import (
	"os"

	"cosmossdk.io/log"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/config"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/pruning"
	"github.com/cosmos/cosmos-sdk/server"
	srvconfig "github.com/cosmos/cosmos-sdk/server/config"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
	"github.com/cosmos/cosmos-sdk/version"
	"github.com/cosmos/cosmos-sdk/x/genutil"
	genutilcli "github.com/cosmos/cosmos-sdk/x/genutil/client/cli"
	genutiltypes "github.com/cosmos/cosmos-sdk/x/genutil/types"

	"github.com/spf13/cobra"

	"arcanum/app"
)

func NewRootCmd() *cobra.Command {
	initClientCtx := client.Context{}.
		WithViper("ARCA").
		WithCodec(app.MakeEncodingConfig().Codec).
		WithInterfaceRegistry(app.MakeEncodingConfig().InterfaceRegistry).
		WithTxConfig(app.MakeEncodingConfig().TxConfig).
		WithLegacyAmino(app.MakeEncodingConfig().Amino)

	rootCmd := &cobra.Command{
		Use:   "arcanumd",
		Short: "Arcanum daemon",
		PersistentPreRunE: func(cmd *cobra.Command, _ []string) error {
			initClientCtx, _ = client.ReadPersistentCommandFlags(initClientCtx, cmd.Flags())
			if err := config.ReadFromClientConfig(initClientCtx); err != nil {
				return err
			}
			return client.SetCmdClientContextHandler(initClientCtx, cmd)
		},
	}

	// SDK server setup
	cfg := srvconfig.DefaultConfig()
	cfg.API.Enable = true
	cfg.API.Swagger = false

	ac := app.AppConfig() // your app’s depinject config if you have one, otherwise ignore

	initCmd := genutilcli.InitCmd(app.ModuleBasics, app.DefaultNodeHome)
	addGenesisAccountCmd := genutilcli.AddGenesisAccountCmd(app.ModuleBasics, app.DefaultNodeHome, genutiltypes.DefaultMessageValidator)
	genTxCmd := genutilcli.GenTxCmd(app.ModuleBasics, app.DefaultNodeHome, &genutiltypes.ModuleCdc)
	collectGenTxsCmd := genutilcli.CollectGenTxsCmd(genutiltypes.DefaultMessageValidator)
	validateGenesisCmd := genutilcli.ValidateGenesisCmd(app.ModuleBasics)

	// root subcommands
	rootCmd.AddCommand(
		initCmd,
		addGenesisAccountCmd,
		collectGenTxsCmd,
		validateGenesisCmd,
		genTxCmd,
		pruning.Cmd(app.DefaultNodeHome),
		server.StartCmd(func(logger log.Logger, cfg servertypes.AppOptions) servertypes.Application {
			return app.New(logger, cfg) // your constructor returning servertypes.Application
		}, app.DefaultNodeHome),
		server.ExportCmd(func(logger log.Logger, cfg servertypes.AppOptions, height int64, forZeroHeight bool, jailAllowedAddrs []string) (servertypes.ExportedApp, error) {
			return app.ExportApp(logger, cfg, height, forZeroHeight, jailAllowedAddrs)
		}, app.DefaultNodeHome),
		version.NewVersionCommand(),
	)

	// global flags
	flags.AddQueryFlagsToCmd(rootCmd)
	return rootCmd
}

func Execute() {
	if err := NewRootCmd().Execute(); err != nil {
		_, _ = os.Stderr.WriteString(err.Error())
		os.Exit(1)
	}
}
