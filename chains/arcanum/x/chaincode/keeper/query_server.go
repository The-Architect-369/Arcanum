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
}

var _ types.QueryServer = QueryServer{}

func (q QueryServer) Params(ctx context.Context, _ *types.QueryParamsRequest) (*types.QueryParamsResponse, error) {
	sdkCtx := sdk.UnwrapSDKContext(ctx)
	p := q.Keeper.GetParams(sdkCtx)
	return &types.QueryParamsResponse{Params: &p}, nil
}

func (q QueryServer) Sbi(ctx context.Context, req *types.QuerySbiRequest) (*types.QuerySbiResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}
	if req.Address == "" {
		return nil, status.Error(codes.InvalidArgument, "address is required")
	}

	_ = sdk.UnwrapSDKContext(ctx)

	// TODO: Wire to real SBI storage model once finalized.
	return &types.QuerySbiResponse{}, nil
}
