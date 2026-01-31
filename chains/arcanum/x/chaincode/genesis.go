package chaincode

import (
	"context"
	"encoding/json"

	abci "github.com/cometbft/cometbft/abci/types"
	"github.com/cosmos/cosmos-sdk/codec"

	"arcanum/x/chaincode/types"
)

func (k Keeper) InitGenesis(ctx context.Context, cdc codec.JSONCodec, bz json.RawMessage) []abci.ValidatorUpdate {
	if len(bz) == 0 {
		// set default params
		_ = k.SetParams(ctx, types.DefaultParams())
		return nil
	}

	var genState types.GenesisState
	if err := cdc.UnmarshalJSON(bz, &genState); err != nil {
		panic(err)
	}

	_ = k.SetParams(ctx, genState.Params)
	// SBTs can be optionally restored from genesis if you want

	return nil
}

func (k Keeper) ExportGenesis(ctx context.Context, cdc codec.JSONCodec) json.RawMessage {
	params, _ := k.GetParams(ctx)
	genState := types.GenesisState{
		Params: params,
	}
	bz, err := cdc.MarshalJSON(&genState)
	if err != nil {
		panic(err)
	}
	return bz
}
