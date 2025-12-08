package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"

	"arcanum/x/chaincode/types"
)

type QueryServer struct {
	Keeper
}

var _ types.QueryServer = QueryServer{}

func (q QueryServer) ChaincodeByOwner(ctx context.Context, req *types.QueryByOwnerRequest) (*types.QueryByOwnerResponse, error) {
	sdkCtx := sdk.UnwrapSDKContext(ctx)

	owner, err := sdk.AccAddressFromBech32(req.Owner)
	if err != nil {
		return nil, err
	}
	tokenId, ok := q.GetTokenByOwner(sdkCtx, owner)
	if !ok {
		return &types.QueryByOwnerResponse{}, nil
	}

	meta, _ := q.GetMetadata(sdkCtx, []byte(tokenId))

	return &types.QueryByOwnerResponse{
		Owner:       req.Owner,
		TokenId:     tokenId,
		MetadataCid: meta,
	}, nil
}

func (q QueryServer) ChaincodeByToken(ctx context.Context, req *types.QueryByTokenRequest) (*types.QueryByTokenResponse, error) {
	sdkCtx := sdk.UnwrapSDKContext(ctx)

	tokenId := []byte(req.TokenId)
	owner, ok := q.GetOwner(sdkCtx, tokenId)
	if !ok {
		return &types.QueryByTokenResponse{}, nil
	}
	meta, _ := q.GetMetadata(sdkCtx, tokenId)

	return &types.QueryByTokenResponse{
		Owner:       owner.String(),
		TokenId:     req.TokenId,
		MetadataCid: meta,
	}, nil
}

func (q QueryServer) Params(ctx context.Context, _ *types.QueryParamsRequest) (*types.QueryParamsResponse, error) {
	p, err := q.GetParams(ctx)
	if err != nil {
		return nil, err
	}
	return &types.QueryParamsResponse{Params: &p}, nil
}
