package cmd

import (
	"fmt"

	"github.com/spf13/cobra"

	"arcanum/app"
)

// NewRootCmd returns the root command for the Arcanum daemon.
//
// This minimal command surface is intentionally compile-safe while the full
// Cosmos SDK daemon scaffold is rebuilt against the active app constructor
// surface. Historical scaffold code is archived under:
// docs/archive/chain/arcanum/cmd-scaffold/
func NewRootCmd() *cobra.Command {
	rootCmd := &cobra.Command{
		Use:           "arcanumd",
		Short:         "Arcanum App Daemon",
		SilenceUsage:  true,
		SilenceErrors: true,
	}

	rootCmd.AddCommand(
		versionCmd(),
	)

	return rootCmd
}

func versionCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "Print daemon version information",
		RunE: func(cmd *cobra.Command, args []string) error {
			_, err := fmt.Fprintf(cmd.OutOrStdout(), "%s\n", app.AppName())
			return err
		},
	}
}
