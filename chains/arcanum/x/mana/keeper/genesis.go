package keeper

import (
    "context"
    "encoding/json"

    abci "github.com/cometbft/cometbft/abci/types"
    "github.com/cosmos/cosmos-sdk/codec"
    sdk "github.com/cosmos/cosmos-sdk/types"

    "arcanum/x/mana/types"
)

// InitGenesis sets initial params and (optionally) balances/supply.
// For now we'll just set Params.
func (k Keeper) InitGenesis(ctx context.Context, cdc codec.JSONCodec, data json.RawMessage) []abci.ValidatorUpdate {
    if len(data) == 0 {
        // default params
        sdkCtx := sdk.UnwrapSDKContext(ctx)
        if err := k.SetParams(sdkCtx, types.DefaultParams()); err != nil {
            panic(err)
        }
        return nil
    }

    var genState types.GenesisState
    if err := cdc.UnmarshalJSON(data, &genState); err != nil {
        panic(err)
    }

    sdkCtx := sdk.UnwrapSDKContext(ctx)
    if err := k.SetParams(sdkCtx, genState.Params); err != nil {
        panic(err)
    }

    // TODO: if you later want to preload balances/supply, do it here.

    return nil
}

func (k Keeper) ExportGenesis(ctx context.Context, cdc codec.JSONCodec) json.RawMessage {
    sdkCtx := sdk.UnwrapSDKContext(ctx)

    params, err := k.GetParams(sdkCtx)
    if err != nil {
        panic(err)
    }

    genState := types.GenesisState{
        Params: params,
        // TODO: add balances/supply if you store them in GenesisState
    }

    bz, err := cdc.MarshalJSON(&genState)
    if err != nil {
        panic(err)
    }

    return bz
}
