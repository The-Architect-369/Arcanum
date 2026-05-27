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
