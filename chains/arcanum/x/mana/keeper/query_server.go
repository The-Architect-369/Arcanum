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

func (q QueryServer) Balance(ctx context.Context, req *types.QueryBalanceRequest) (*types.QueryBalanceResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}
	if req.Address == "" {
		return nil, status.Error(codes.InvalidArgument, "address is required")
	}

	sdkCtx := sdk.UnwrapSDKContext(ctx)
	addr, err := sdk.AccAddressFromBech32(req.Address)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid address")
	}
	balance := q.Keeper.GetBalance(sdkCtx, addr)

	return &types.QueryBalanceResponse{
		Balance: &types.ManaBalance{
			Address: addr.String(),
			Amount:  balance.String(),
		},
	}, nil
}

func (q QueryServer) Supply(ctx context.Context, _ *types.QuerySupplyRequest) (*types.QuerySupplyResponse, error) {
	sdkCtx := sdk.UnwrapSDKContext(ctx)
	return &types.QuerySupplyResponse{Amount: q.Keeper.GetSupply(sdkCtx).String()}, nil
}

func (q QueryServer) Sinks(ctx context.Context, req *types.QuerySinksRequest) (*types.QuerySinksResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "empty request")
	}

	_ = sdk.UnwrapSDKContext(ctx)

	// TODO: Wire to keeper state once sink model is finalized.
	return &types.QuerySinksResponse{}, nil
}
