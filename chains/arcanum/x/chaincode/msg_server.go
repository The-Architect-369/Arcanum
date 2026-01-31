package chaincode

import (
	"context"

	"cosmossdk.io/errors"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"arcanum/x/chaincode/types"
)

type MsgServer struct{ k Keeper }

func NewMsgServerImpl(k Keeper) *MsgServer { return &MsgServer{k: k} }

func (s *MsgServer) Mint(goCtx context.Context, msg *types.MsgMint) (*types.MsgMintResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	owner, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		return nil, err
	}

	tokenId := []byte(msg.TokenId)

	// enforce 1 SBT per owner
	if _, exists := s.k.GetTokenByOwner(ctx, owner); exists {
		return nil, errors.Wrap(errors.ErrUnauthorized, "owner already has SBT")
	}
	if _, exists := s.k.GetOwner(ctx, tokenId); exists {
		return nil, errors.Wrap(errors.ErrUnauthorized, "tokenId already exists")
	}

	s.k.SetOwner(ctx, tokenId, owner)
	s.k.SetMetadata(ctx, tokenId, []byte(msg.MetadataCid))

	ctx.EventManager().EmitEvent(
		sdk.NewEvent("chaincode_mint",
			sdk.NewAttribute("owner", msg.Owner),
			sdk.NewAttribute("token_id", msg.TokenId),
			sdk.NewAttribute("metadata_cid", msg.MetadataCid),
		),
	)

	return &types.MsgMintResponse{}, nil
}
