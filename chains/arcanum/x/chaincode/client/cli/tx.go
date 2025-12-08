func CmdMint() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "mint [owner] [token-id] [metadata-cid]",
		Short: "Mint an SBT chaincode for an address",
		Args:  cobra.ExactArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			msg := &types.MsgMint{
				Owner:       args[0],
				TokenId:     args[1],
				MetadataCid: args[2],
			}
			if err := msg.ValidateBasic(); err != nil {
				return err
			}

			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}
