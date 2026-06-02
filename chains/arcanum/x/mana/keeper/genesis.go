package keeper

import (
	sdkmath "cosmossdk.io/math"
	"github.com/cosmos/cosmos-sdk/types"

	manaTypes "arcanum/x/mana/types"
)

func (k Keeper) InitGenesis(ctx types.Context, genState *manaTypes.GenesisState) {
	if genState == nil {
		genState = manaTypes.DefaultGenesis()
	}
	if genState.Params == nil {
		p := manaTypes.DefaultParams()
		genState.Params = &p
	}
	k.SetParams(ctx, *genState.Params)

	total := sdkmath.ZeroInt()
	for _, balance := range genState.Balances {
		if err := k.ImportBalance(ctx, balance); err != nil {
			panic(err)
		}
		amount, ok := sdkmath.NewIntFromString(balance.Amount)
		if !ok {
			panic("invalid mana balance amount in genesis")
		}
		total = total.Add(amount)
	}

	if genState.Supply != "" {
		supply, ok := sdkmath.NewIntFromString(genState.Supply)
		if !ok {
			panic("invalid mana supply in genesis")
		}
		if !supply.Equal(total) {
			panic("mana genesis supply does not match imported balances")
		}
		k.SetSupply(ctx, supply)
		return
	}

	k.SetSupply(ctx, total)
}

func (k Keeper) ExportGenesis(ctx types.Context) *manaTypes.GenesisState {
	p, err := k.GetParams(ctx)
	if err != nil {
		dp := manaTypes.DefaultParams()
		p = dp
	}
	return &manaTypes.GenesisState{
		Params:   &p,
		Balances: k.GetAllBalances(ctx),
		Supply:   k.GetSupply(ctx).String(),
	}
}
