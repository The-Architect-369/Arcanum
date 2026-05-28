package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"

	"arcanum/x/chaincode/types"
)

func (k Keeper) InitGenesis(ctx sdk.Context, genState *types.GenesisState) {
	if genState == nil {
		genState = types.DefaultGenesis()
	}
	if genState.Params == nil {
		p := types.DefaultParams()
		genState.Params = &p
	}
	k.SetParams(ctx, *genState.Params)

	for _, anchor := range genState.Anchors {
		if err := k.ImportAnchor(ctx, anchor); err != nil {
			panic(err)
		}
	}
}

func (k Keeper) ExportGenesis(ctx sdk.Context) *types.GenesisState {
	p, err := k.GetParams(ctx)
	if err != nil {
		dp := types.DefaultParams()
		p = dp
	}
	return &types.GenesisState{
		Params:  &p,
		Anchors: k.GetAllAnchors(ctx),
	}
}
