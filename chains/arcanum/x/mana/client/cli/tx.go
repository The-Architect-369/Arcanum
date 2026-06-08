package cli

import (
	"strconv"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"
	"github.com/spf13/cobra"

	"arcanum/x/mana/types"
)

func CmdSpend() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "spend [creator] [address] [purpose] [amount]",
		Short: "Spend MANA for a declared purpose",
		Args:  cobra.ExactArgs(4),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			amount, err := strconv.ParseUint(args[3], 10, 64)
			if err != nil {
				return err
			}

			msg := &types.MsgSpend{
				Creator: args[0],
				Address: args[1],
				Purpose: args[2],
				Amount:  amount,
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func GetTxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        "mana",
		Short:                      "MANA transactions",
		DisableFlagParsing:         false,
		SuggestionsMinimumDistance: 2,
	}

	cmd.AddCommand(
		CmdSpend(),
		CmdTransfer(),
		CmdDepositEnable(),
		CmdDepositDisable(),
	)

	return cmd
}

func CmdTransfer() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "transfer [creator] [to] [amount]",
		Short: "Transfer MANA to another address",
		Args:  cobra.ExactArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			amount, err := strconv.ParseUint(args[2], 10, 64)
			if err != nil {
				return err
			}

			msg := &types.MsgTransfer{
				Creator: args[0],
				To:      args[1],
				Amount:  amount,
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func CmdDepositEnable() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deposit-enable [creator] [feature-id]",
		Short: "Enable a MANA deposit-gated feature",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			msg := &types.MsgDepositEnable{
				Creator:   args[0],
				FeatureId: args[1],
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func CmdDepositDisable() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "deposit-disable [creator] [feature-id]",
		Short: "Disable a MANA deposit-gated feature",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			msg := &types.MsgDepositDisable{
				Creator:   args[0],
				FeatureId: args[1],
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}
