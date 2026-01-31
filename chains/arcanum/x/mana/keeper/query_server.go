package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"arcanum/x/mana/types"
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

func (q QueryServer) Sinks(ctx context.Context, req *types.QuerySinksRequest) (*types.QuerySinksResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	_ = sdk.UnwrapSDKContext(ctx)

	// TODO: Wire to keeper state once sink model is finalized.
	return &types.QuerySinksResponse{}, nil
}
