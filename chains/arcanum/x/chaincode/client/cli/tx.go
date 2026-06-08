package cli

import (
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"
	"github.com/spf13/cobra"

	"arcanum/x/chaincode/types"
)

func CmdMintSbi() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "mint-sbi [creator] [to]",
		Short: "Mint a chaincode identity anchor for an address",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			msg := &types.MsgMintSbi{
				Creator: args[0],
				To:      args[1],
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func GetTxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        "chaincode",
		Short:                      "ChainCode / ACC identity witness transactions",
		DisableFlagParsing:         false,
		SuggestionsMinimumDistance: 2,
	}

	cmd.AddCommand(
		CmdMintSbi(),
		CmdRecoverSbi(),
	)

	return cmd
}

func CmdRecoverSbi() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "recover-sbi [creator] [to] [proof]",
		Short: "Recover a chaincode identity anchor to a new address",
		Args:  cobra.ExactArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			msg := &types.MsgRecoverSbi{
				Creator: args[0],
				To:      args[1],
				Proof:   args[2],
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}
