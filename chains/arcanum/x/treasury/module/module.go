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
	// IMPORTANT: v1 gateway import (no /v2)
	"github.com/grpc-ecosystem/grpc-gateway/runtime"

	treasurykeeper "arcanum/x/treasury/keeper"
	treasurytypes "arcanum/x/treasury/types"
)

// --- Basic module ---

type basicModule struct{}

var _ sdkmodule.AppModuleBasic = (*basicModule)(nil)

func (basicModule) Name() string { return treasurytypes.ModuleName }
func (basicModule) RegisterLegacyAminoCodec(_ *codec.LegacyAmino) {}
func (basicModule) RegisterInterfaces(_ cdctypes.InterfaceRegistry) {}
func (basicModule) RegisterGRPCGatewayRoutes(_ client.Context, _ *runtime.ServeMux) {}

// --- Full module ---

type Module struct {
	basicModule
	cdc    codec.Codec
	keeper treasurykeeper.Keeper
}

var _ appmodule.AppModule = (*Module)(nil)

func (Module) IsAppModule()        {}
func (Module) IsOnePerModuleType() {}

type Inputs struct {
	Codec  codec.Codec
	Keeper treasurykeeper.Keeper
}
type Outputs struct {
	Module Module
}

func ProvideModule(i Inputs) Outputs {
	return Outputs{Module: Module{cdc: i.Codec, keeper: i.Keeper}}
}

// No services yet.
// func (m Module) RegisterServices(cfg sdkmodule.Configurator) {}

func (m Module) DefaultGenesis(_ codec.JSONCodec) json.RawMessage {
	return json.RawMessage(`{}`)
}
func (m Module) ValidateGenesis(_ codec.JSONCodec, _ client.TxEncodingConfig, _ json.RawMessage) error {
	return nil
}
func (m Module) InitGenesis(_ context.Context, _ codec.JSONCodec, _ json.RawMessage) []abci.ValidatorUpdate {
	return nil
}
func (m Module) ExportGenesis(_ context.Context, _ codec.JSONCodec) json.RawMessage {
	return json.RawMessage(`{}`)
}
