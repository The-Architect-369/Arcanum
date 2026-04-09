package main

import (
	"os"

	"github.com/spf13/cobra"
)

func NewRootCmd() *cobra.Command {
	return &cobra.Command{
		Use:           "arcanumd",
		Short:         "Arcanum daemon",
		SilenceUsage:  true,
		SilenceErrors: true,
	}
}

func Execute() {
	if err := NewRootCmd().Execute(); err != nil {
		_, _ = os.Stderr.WriteString(err.Error())
		os.Exit(1)
	}
}
