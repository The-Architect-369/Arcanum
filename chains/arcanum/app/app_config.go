package app

import (
	"cosmossdk.io/depinject"
	"cosmossdk.io/log"
	"cosmossdk.io/x/circuit"
	"cosmossdk.io/x/evidence"
	feegrantmodule "cosmossdk.io/x/feegrant/module"
	nftmodule "cosmossdk.io/x/nft/module"
	"cosmossdk.io/x/upgrade"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	auth "github.com/cosmos/cosmos-sdk/x/auth"
	vesting "github.com/cosmos/cosmos-sdk/x/auth/vesting"
	authzmodule "github.com/cosmos/cosmos-sdk/x/authz/module"
	bank "github.com/cosmos/cosmos-sdk/x/bank"
	consensus "github.com/cosmos/cosmos-sdk/x/consensus"
	distribution "github.com/cosmos/cosmos-sdk/x/distribution"
	genutil "github.com/cosmos/cosmos-sdk/x/genutil"
	genutiltypes "github.com/cosmos/cosmos-sdk/x/genutil/types"
	gov "github.com/cosmos/cosmos-sdk/x/gov"
	govclient "github.com/cosmos/cosmos-sdk/x/gov/client"
	groupmodule "github.com/cosmos/cosmos-sdk/x/group/module"
	mint "github.com/cosmos/cosmos-sdk/x/mint"
	params "github.com/cosmos/cosmos-sdk/x/params"
	slashing "github.com/cosmos/cosmos-sdk/x/slashing"
	staking "github.com/cosmos/cosmos-sdk/x/staking"

	chaincodemodule "arcanum/x/chaincode/module"
	manamodule "arcanum/x/mana/module"
	treasurymodule "arcanum/x/treasury/module"
)

type EncodingConfig struct {
	InterfaceRegistry cdctypes.InterfaceRegistry
	Codec             codec.Codec
	TxConfig          client.TxConfig
	Amino             *codec.LegacyAmino
}

type emptyAppOptions struct{}

func (emptyAppOptions) Get(string) interface{} { return nil }

// ModuleBasics defines the module BasicManager for the app.
var ModuleBasics = module.NewBasicManager(
	auth.AppModuleBasic{},
	vesting.AppModuleBasic{},
	authzmodule.AppModuleBasic{},
	bank.AppModuleBasic{},
	consensus.AppModuleBasic{},
	distribution.AppModuleBasic{},
	genutil.NewAppModuleBasic(genutiltypes.DefaultMessageValidator),
	gov.NewAppModuleBasic([]govclient.ProposalHandler{}),
	groupmodule.AppModuleBasic{},
	mint.AppModuleBasic{},
	params.AppModuleBasic{},
	slashing.AppModuleBasic{},
	staking.AppModuleBasic{},
	feegrantmodule.AppModuleBasic{},
	nftmodule.AppModuleBasic{},
	circuit.AppModuleBasic{},
	evidence.AppModuleBasic{},
	upgrade.AppModuleBasic{},
	chaincodemodule.NewBasicModule(),
	manamodule.NewBasicModule(),
	treasurymodule.NewBasicModule(),
)

func MakeEncodingConfig() EncodingConfig {
	var (
		appCodec          codec.Codec
		txConfig          client.TxConfig
		interfaceRegistry cdctypes.InterfaceRegistry
		legacyAmino       *codec.LegacyAmino
	)

	if err := depinject.Inject(
		depinject.Configs(
			appConfig,
			depinject.Supply(
				log.NewNopLogger(),
				servertypes.AppOptions(emptyAppOptions{}),
			),
		),
		&appCodec,
		&txConfig,
		&interfaceRegistry,
		&legacyAmino,
	); err != nil {
		panic(err)
	}

	return EncodingConfig{
		InterfaceRegistry: interfaceRegistry,
		Codec:             appCodec,
		TxConfig:          txConfig,
		Amino:             legacyAmino,
	}
}

func ModuleBasicsRef() module.BasicManager { return ModuleBasics }
func AppName() string                      { return Name }
func DefaultHome() string                  { return DefaultNodeHome }
