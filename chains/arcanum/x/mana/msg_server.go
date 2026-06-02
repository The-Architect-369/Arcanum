package mana

import (
	"context"
	"fmt"
	"strconv"

	sdkmath "cosmossdk.io/math"

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

	creatorAddr, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return nil, fmt.Errorf("invalid creator address: %w", err)
	}
	spendAddr, err := sdk.AccAddressFromBech32(msg.Address)
	if err != nil {
		return nil, fmt.Errorf("invalid spend address: %w", err)
	}
	if !creatorAddr.Equals(spendAddr) {
		return nil, fmt.Errorf("mana spend requires creator to match spend address")
	}
	if msg.Amount == 0 {
		return nil, fmt.Errorf("mana spend amount must be greater than zero")
	}
	if msg.Purpose == "" {
		return nil, fmt.Errorf("mana spend purpose is required")
	}

	if err := s.k.Spend(ctx, spendAddr, sdkmath.NewIntFromUint64(msg.Amount)); err != nil {
		return nil, err
	}

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

func (s *MsgServer) Transfer(goCtx context.Context, msg *types.MsgTransfer) (*types.MsgTransferResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	params, err := s.k.GetParams(ctx)
	if err != nil {
		return nil, fmt.Errorf("load mana params: %w", err)
	}
	if !params.TransferEnabled {
		return nil, fmt.Errorf("mana transfer is disabled")
	}

	fromAddr, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return nil, fmt.Errorf("invalid creator address: %w", err)
	}
	toAddr, err := sdk.AccAddressFromBech32(msg.To)
	if err != nil {
		return nil, fmt.Errorf("invalid recipient address: %w", err)
	}
	if msg.Amount == 0 {
		return nil, fmt.Errorf("mana transfer amount must be greater than zero")
	}
	if fromAddr.Equals(toAddr) {
		return nil, fmt.Errorf("mana transfer requires distinct addresses")
	}

	if err := s.k.Transfer(ctx, fromAddr, toAddr, sdkmath.NewIntFromUint64(msg.Amount)); err != nil {
		return nil, err
	}

	ctx.EventManager().EmitEvent(
		sdk.NewEvent("mana_transfer",
			sdk.NewAttribute("creator", msg.Creator),
			sdk.NewAttribute("to", msg.To),
			sdk.NewAttribute("amount", strconv.FormatUint(msg.Amount, 10)),
		),
	)

	return &types.MsgTransferResponse{}, nil
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
