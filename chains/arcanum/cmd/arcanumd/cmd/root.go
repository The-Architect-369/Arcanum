// cmd/arcanumd/cmd/root.go

package cmd

import (
    "context"

    "github.com/spf13/cobra"

    // server commands (start, unsafe-reset-all, etc.)
    server "github.com/cosmos/cosmos-sdk/server"
    serverconfig "github.com/cosmos/cosmos-sdk/server/types"

    // encoding/tx config from your app
    "arcanum/app"

    // genutil helpers
    genutilcli "github.com/cosmos/cosmos-sdk/x/genutil/client/cli"
    banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
)

func NewRootCmd() *cobra.Command {
    // Use your app’s encoding config (whatever you have today; this helper exists in every Cosmos app)
    encCfg := app.MakeEncodingConfig()

    rootCmd := &cobra.Command{
        Use:   "arcanumd",
        Short: "Arcanum App Daemon",
        PersistentPreRunE: func(cmd *cobra.Command, _ []string) error {
            // default server setup (logging, config, etc.)
            return server.InterceptConfigsPreRunHandler(cmd, "", nil)
        },
        SilenceUsage:  true,
        SilenceErrors: true,
    }

    // standard server subcommands (start, etc.)
    server.AddCommands(
        rootCmd,
        app.DefaultNodeHome,
        // app creator (if you use it in your codebase, keep it; otherwise nil is fine)
        func(ctx *server.Context) serverconfig.AppCreator {
            return func(_ *server.Context, _ serverconfig.Config, _ []string) serverconfig.Application {
                // You likely already have your app constructor elsewhere (in main.go).
                // Returning nil is acceptable because we don’t use this path for start here.
                return nil
            }
        }(nil),
        // export (not used by our flow right now)
        nil,
    )

    // --- genutil wiring ---
    rootCmd.AddCommand(
        genutilcli.InitCmd(app.ModuleBasics, app.DefaultNodeHome),
        genutilcli.CollectGenTxsCmd(banktypes.GenesisBalancesIterator{}, app.DefaultNodeHome),
        genutilcli.GenTxCmd(app.ModuleBasics, encCfg.TxConfig, banktypes.GenesisBalancesIterator{}, app.DefaultNodeHome),
        genutilcli.AddGenesisAccountCmd(app.DefaultNodeHome),
        manaCli.GetQueryCmd(),
        chaincodeCli.GetQueryCmd(),
    )

    return rootCmd
}
