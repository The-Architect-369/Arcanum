package keeper
func (q QueryServer) Balance(ctx context.Context, req *types.QueryBalanceRequest) (*types.QueryBalanceResponse, error) {
	sdkCtx := sdk.UnwrapSDKContext(ctx)
	addr, err := sdk.AccAddressFromBech32(req.Address)
	if err != nil {
		return nil, err
	}
	bal := q.GetBalance(sdkCtx, addr)
	return &types.QueryBalanceResponse{Balance: bal.String()}, nil
}

func (q QueryServer) Supply(ctx context.Context, _ *types.QuerySupplyRequest) (*types.QuerySupplyResponse, error) {
	sdkCtx := sdk.UnwrapSDKContext(ctx)
	s := q.getSupply(sdkCtx)
	return &types.QuerySupplyResponse{Supply: s.String()}, nil
}
