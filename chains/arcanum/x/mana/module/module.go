package module

import (
	"context"
	"encoding/json"

	"cosmossdk.io/core/appmodule"
	abci "github.com/cometbft/cometbft/abci/types"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkmodule "github.com/cosmos/cosmos-sdk/types/module"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"

	"arcanum/x/mana/keeper"
	"arcanum/x/mana/types"
)

type basicModule struct{}

var _ sdkmodule.AppModuleBasic = (*basicModule)(nil)

func (basicModule) Name() string                                  { return types.ModuleName }
func (basicModule) RegisterLegacyAminoCodec(_ *codec.LegacyAmino) {}
func (basicModule) RegisterInterfaces(ir cdctypes.InterfaceRegistry) {
	types.RegisterInterfaces(ir)
}
func (basicModule) RegisterGRPCGatewayRoutes(_ client.Context, _ *runtime.ServeMux) {}

type Module struct {
	basicModule
	cdc    codec.Codec
	keeper keeper.Keeper
}

var _ appmodule.AppModule = (*Module)(nil)

func (Module) IsAppModule()        {}
func (Module) IsOnePerModuleType() {}

type Inputs struct {
	Codec  codec.Codec
	Keeper keeper.Keeper
}
type Outputs struct {
	Module Module
}

func ProvideModule(i Inputs) Outputs {
	return Outputs{Module: Module{cdc: i.Codec, keeper: i.Keeper}}
}

func (m Module) DefaultGenesis(cdc codec.JSONCodec) json.RawMessage {
	p := types.DefaultParams()
	state := types.GenesisState{
		Params: &p,
	}
	bz, _ := json.Marshal(state)
	return bz
}

func (m Module) ValidateGenesis(_ codec.JSONCodec, _ client.TxEncodingConfig, _ json.RawMessage) error {
	// basic validation only
	return nil
}

func (m Module) InitGenesis(ctx context.Context, _ codec.JSONCodec, data json.RawMessage) []abci.ValidatorUpdate {
	var state types.GenesisState
	if len(data) == 0 || string(data) == "null" {
		state = *types.DefaultGenesis()
	} else if err := json.Unmarshal(data, &state); err != nil {
		panic(err)
	}
	sdkCtx := sdk.UnwrapSDKContext(ctx)
	m.keeper.InitGenesis(sdkCtx, &state)
	return nil
}

func (m Module) ExportGenesis(ctx context.Context, _ codec.JSONCodec) json.RawMessage {
	sdkCtx := sdk.UnwrapSDKContext(ctx)
	state := m.keeper.ExportGenesis(sdkCtx)
	bz, err := json.Marshal(state)
	if err != nil {
		panic(err)
	}
	return bz
}
