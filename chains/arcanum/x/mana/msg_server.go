package mana

import (
	"context"
	"strconv"

	"arcanum/x/mana/keeper"
	"arcanum/x/mana/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

type MsgServer struct {
	k keeper.Keeper
	types.UnimplementedMsgServer
}

func NewMsgServerImpl(k keeper.Keeper) *MsgServer {
	return &MsgServer{k: k}
}

func (s *MsgServer) Spend(goCtx context.Context, msg *types.MsgSpend) (*types.MsgSpendResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	ctx.EventManager().EmitEvent(
		sdk.NewEvent("mana_spend",
			sdk.NewAttribute("creator", msg.Creator),
			sdk.NewAttribute("address", msg.Address),
			sdk.NewAttribute("purpose", msg.Purpose),
			sdk.NewAttribute("amount", strconv.FormatUint(msg.Amount, 10)),
		),
	)

	return &types.MsgSpendResponse{}, nil
}

func (s *MsgServer) DepositEnable(goCtx context.Context, msg *types.MsgDepositEnable) (*types.MsgDepositEnableResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	ctx.EventManager().EmitEvent(
		sdk.NewEvent("mana_deposit_enable",
			sdk.NewAttribute("creator", msg.Creator),
			sdk.NewAttribute("feature_id", msg.FeatureId),
		),
	)

	return &types.MsgDepositEnableResponse{}, nil
}

func (s *MsgServer) DepositDisable(goCtx context.Context, msg *types.MsgDepositDisable) (*types.MsgDepositDisableResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	ctx.EventManager().EmitEvent(
		sdk.NewEvent("mana_deposit_disable",
			sdk.NewAttribute("creator", msg.Creator),
			sdk.NewAttribute("feature_id", msg.FeatureId),
		),
	)

	return &types.MsgDepositDisableResponse{}, nil
}
