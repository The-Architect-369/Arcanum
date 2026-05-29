package app

import (
	"io"

	"cosmossdk.io/depinject"
	"cosmossdk.io/log"
	dbm "github.com/cosmos/cosmos-db"
	"github.com/cosmos/cosmos-sdk/baseapp"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/cosmos/cosmos-sdk/runtime"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
)

type App struct {
	*runtime.App
	appCodec          codec.Codec
	txConfig          client.TxConfig
	interfaceRegistry codectypes.InterfaceRegistry
	legacyAmino       *codec.LegacyAmino
}

func New(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	loadLatest bool,
	appOpts servertypes.AppOptions,
	baseAppOptions ...func(*baseapp.BaseApp),
) *App {
	instance := &App{}

	var (
		appBuilder        *runtime.AppBuilder
		appCodec          codec.Codec
		txConfig          client.TxConfig
		interfaceRegistry codectypes.InterfaceRegistry
		legacyAmino       *codec.LegacyAmino
	)

	if err := depinject.Inject(
		depinject.Configs(
			appConfig,
			depinject.Supply(
				logger,
				appOpts,
			),
		),
		&appBuilder,
		&appCodec,
		&txConfig,
		&interfaceRegistry,
		&legacyAmino,
	); err != nil {
		panic(err)
	}

	instance.App = appBuilder.Build(db, traceStore, baseAppOptions...)
	instance.appCodec = appCodec
	instance.txConfig = txConfig
	instance.interfaceRegistry = interfaceRegistry
	instance.legacyAmino = legacyAmino

	if loadLatest {
		if err := instance.LoadLatestVersion(); err != nil {
			panic(err)
		}
	}

	return instance
}

func (a *App) AppCodec() codec.Codec { return a.appCodec }

func (a *App) TxConfig() client.TxConfig { return a.txConfig }

func (a *App) InterfaceRegistry() codectypes.InterfaceRegistry { return a.interfaceRegistry }

func (a *App) LegacyAmino() *codec.LegacyAmino { return a.legacyAmino }
