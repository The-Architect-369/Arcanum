package chaincode

import (
	"context"
	"fmt"

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

	creatorAddr, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return nil, fmt.Errorf("invalid creator address: %w", err)
	}
	toAddr, err := sdk.AccAddressFromBech32(msg.To)
	if err != nil {
		return nil, fmt.Errorf("invalid target address: %w", err)
	}

	params, err := s.k.GetParams(ctx)
	if err != nil {
		return nil, fmt.Errorf("load chaincode params: %w", err)
	}
	if !creatorAddr.Equals(toAddr) && (params.Admin == "" || params.Admin != msg.Creator) {
		return nil, fmt.Errorf("chaincode mint requires self-mint or admin authority")
	}

	tokenID := keeper.DefaultTokenID(toAddr)
	if err := s.k.MintAnchor(ctx, toAddr, tokenID, ""); err != nil {
		return nil, err
	}

	ctx.EventManager().EmitEvent(
		sdk.NewEvent("chaincode_mint_sbi",
			sdk.NewAttribute("creator", msg.Creator),
			sdk.NewAttribute("to", msg.To),
			sdk.NewAttribute("token_id", tokenID),
		),
	)

	return &types.MsgMintSbiResponse{}, nil
}

func (s *MsgServer) RecoverSbi(goCtx context.Context, msg *types.MsgRecoverSbi) (*types.MsgRecoverSbiResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	creatorAddr, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return nil, fmt.Errorf("invalid creator address: %w", err)
	}
	toAddr, err := sdk.AccAddressFromBech32(msg.To)
	if err != nil {
		return nil, fmt.Errorf("invalid target address: %w", err)
	}

	tokenID, err := s.k.RecoverAnchor(ctx, creatorAddr, toAddr, msg.Proof)
	if err != nil {
		return nil, err
	}

	ctx.EventManager().EmitEvent(
		sdk.NewEvent("chaincode_recover_sbi",
			sdk.NewAttribute("creator", msg.Creator),
			sdk.NewAttribute("to", msg.To),
			sdk.NewAttribute("token_id", tokenID),
		),
	)

	return &types.MsgRecoverSbiResponse{}, nil
}
