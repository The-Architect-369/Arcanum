package chaincode

import (
	"context"

	"arcanum/x/chaincode/keeper"
	"arcanum/x/chaincode/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

type MsgServer struct {
	k keeper.Keeper
	types.UnimplementedMsgServer
}

func NewMsgServerImpl(k keeper.Keeper) *MsgServer {
	return &MsgServer{k: k}
}

func (s *MsgServer) MintSbi(goCtx context.Context, msg *types.MsgMintSbi) (*types.MsgMintSbiResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	ctx.EventManager().EmitEvent(
		sdk.NewEvent("chaincode_mint_sbi",
			sdk.NewAttribute("creator", msg.Creator),
			sdk.NewAttribute("to", msg.To),
		),
	)

	return &types.MsgMintSbiResponse{}, nil
}

func (s *MsgServer) RecoverSbi(goCtx context.Context, msg *types.MsgRecoverSbi) (*types.MsgRecoverSbiResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	ctx.EventManager().EmitEvent(
		sdk.NewEvent("chaincode_recover_sbi",
			sdk.NewAttribute("creator", msg.Creator),
			sdk.NewAttribute("to", msg.To),
		),
	)

	return &types.MsgRecoverSbiResponse{}, nil
}
