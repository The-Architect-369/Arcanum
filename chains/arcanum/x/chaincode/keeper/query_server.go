package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"arcanum/x/chaincode/types"
)

type QueryServer struct {
	Keeper
	types.UnimplementedQueryServer
}

var _ types.QueryServer = QueryServer{}

func (q QueryServer) Params(ctx context.Context, _ *types.QueryParamsRequest) (*types.QueryParamsResponse, error) {
	sdkCtx := sdk.UnwrapSDKContext(ctx)
	p, err := q.Keeper.GetParams(sdkCtx)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	return &types.QueryParamsResponse{Params: &p}, nil
}

func (q QueryServer) Sbi(ctx context.Context, req *types.QuerySbiRequest) (*types.QuerySbiResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}
	if req.Address == "" {
		return nil, status.Error(codes.InvalidArgument, "address is required")
	}

	sdkCtx := sdk.UnwrapSDKContext(ctx)
	owner, err := sdk.AccAddressFromBech32(req.Address)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid address")
	}
	tokenID, metadata, found := q.Keeper.GetAnchorByOwner(sdkCtx, owner)
	if !found {
		return nil, status.Error(codes.NotFound, "chaincode anchor not found")
	}

	return &types.QuerySbiResponse{
		Anchor: types.ChaincodeAnchor{
			TokenId:  tokenID,
			Owner:    owner.String(),
			Metadata: metadata,
		},
	}, nil
}
