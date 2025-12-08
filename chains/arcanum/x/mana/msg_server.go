package mana

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"cosmossdk.io/errors"

	"arcanum/x/mana/keeper"
	"arcanum/x/mana/types"
)

type MsgServer struct{ k keeper.Keeper }

func NewMsgServerImpl(k keeper.Keeper) *MsgServer { return &MsgServer{k: k} }

func (s *MsgServer) Mint(goCtx context.Context, msg *types.MsgMint) (*types.MsgMintResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	to, err := sdk.AccAddressFromBech32(msg.ToAddress)
	if err != nil {
		return nil, err
	}

	amt, ok := sdk.NewIntFromString(msg.Amount)
	if !ok || !amt.IsPositive() {
		return nil, errors.Wrap(errors.ErrInvalidRequest, "invalid amount")
	}

	s.k.Mint(ctx, to, amt)

	ctx.EventManager().EmitEvent(
		sdk.NewEvent("mana_mint",
			sdk.NewAttribute("to", msg.ToAddress),
			sdk.NewAttribute("amount", msg.Amount),
		),
	)

	return &types.MsgMintResponse{}, nil
}
