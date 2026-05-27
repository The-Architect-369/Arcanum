package chaincode

import (
	"context"
	"encoding/json"

	abci "github.com/cometbft/cometbft/abci/types"
	"github.com/cosmos/cosmos-sdk/codec"

	"arcanum/x/chaincode/keeper"
	"arcanum/x/chaincode/types"
)

func InitGenesis(ctx context.Context, k keeper.Keeper, cdc codec.JSONCodec, bz json.RawMessage) []abci.ValidatorUpdate {
	if len(bz) == 0 {
		_ = k.SetParams(ctx, types.DefaultParams())
		return nil
	}

	var genState types.GenesisState
	if err := cdc.UnmarshalJSON(bz, &genState); err != nil {
		panic(err)
	}

	if genState.Params == nil {
		params := types.DefaultParams()
		genState.Params = &params
	}

	_ = k.SetParams(ctx, *genState.Params)

	return nil
}

func ExportGenesis(ctx context.Context, k keeper.Keeper, cdc codec.JSONCodec) json.RawMessage {
	params, err := k.GetParams(ctx)
	if err != nil {
		params = types.DefaultParams()
	}

	genState := types.GenesisState{
		Params: &params,
	}

	bz, err := cdc.MarshalJSON(&genState)
	if err != nil {
		panic(err)
	}

	return bz
}
