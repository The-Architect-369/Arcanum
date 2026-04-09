package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"

	"arcanum/x/mana/types"
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

	// TODO: init any additional mana state
}

func (k Keeper) ExportGenesis(ctx sdk.Context) *types.GenesisState {
	p, err := k.GetParams(ctx)
	if err != nil {
		dp := types.DefaultParams()
		p = dp
	}
	return &types.GenesisState{
		Params: &p,
	}
}
