package module

import (
	"context"
	"encoding/json"

	abci "github.com/cometbft/cometbft/abci/types"
	"cosmossdk.io/core/appmodule"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdkmodule "github.com/cosmos/cosmos-sdk/types/module"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"

	"arcanum/x/chaincode/keeper"
	"arcanum/x/chaincode/types"
)

type basicModule struct{}

var _ sdkmodule.AppModuleBasic = (*basicModule)(nil)

func (basicModule) Name() string                                 { return types.ModuleName }
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
	state := types.GenesisState{
		Params: types.DefaultParams(),
	}
	bz, _ := cdc.MarshalJSON(&state)
	return bz
}

func (m Module) ValidateGenesis(_ codec.JSONCodec, _ client.TxEncodingConfig, _ json.RawMessage) error {
	// basic validation only
	return nil
}

func (m Module) InitGenesis(ctx context.Context, cdc codec.JSONCodec, data json.RawMessage) []abci.ValidatorUpdate {
	return m.keeper.InitGenesis(ctx, cdc, data)
}

func (m Module) ExportGenesis(ctx context.Context, cdc codec.JSONCodec) json.RawMessage {
	return m.keeper.ExportGenesis(ctx, cdc)
}
