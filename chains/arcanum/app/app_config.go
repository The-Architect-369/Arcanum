package app

import (
	"cosmossdk.io/x/circuit"
	"cosmossdk.io/x/evidence"
	"cosmossdk.io/x/feegrant"
	"cosmossdk.io/x/nft"
	"cosmossdk.io/x/upgrade"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	moduletestutil "github.com/cosmos/cosmos-sdk/types/module/testutil"
	auth "github.com/cosmos/cosmos-sdk/x/auth"
	vesting "github.com/cosmos/cosmos-sdk/x/auth/vesting"
	authz "github.com/cosmos/cosmos-sdk/x/authz"
	bank "github.com/cosmos/cosmos-sdk/x/bank"
	consensus "github.com/cosmos/cosmos-sdk/x/consensus"
	distribution "github.com/cosmos/cosmos-sdk/x/distribution"
	epochs "github.com/cosmos/cosmos-sdk/x/epochs"
	genutil "github.com/cosmos/cosmos-sdk/x/genutil"
	gov "github.com/cosmos/cosmos-sdk/x/gov"
	govclient "github.com/cosmos/cosmos-sdk/x/gov/client"
	group "github.com/cosmos/cosmos-sdk/x/group"
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

// ModuleBasics defines the module BasicManager for the app.
var ModuleBasics = module.NewBasicManager(
	auth.AppModuleBasic{},
	vesting.AppModuleBasic{},
	authz.AppModuleBasic{},
	bank.AppModuleBasic{},
	consensus.AppModuleBasic{},
	distribution.AppModuleBasic{},
	epochs.AppModuleBasic{},
	genutil.AppModuleBasic{},
	gov.NewAppModuleBasic([]govclient.ProposalHandler{}),
	group.AppModuleBasic{},
	mint.AppModuleBasic{},
	params.AppModuleBasic{},
	slashing.AppModuleBasic{},
	staking.AppModuleBasic{},
	feegrant.AppModuleBasic{},
	nft.AppModuleBasic{},
	circuit.AppModuleBasic{},
	evidence.AppModuleBasic{},
	upgrade.AppModuleBasic{},
	chaincodemodule.NewBasicModule(),
	manamodule.NewBasicModule(),
	treasurymodule.NewBasicModule(),
)

func MakeEncodingConfig() EncodingConfig {
	cfg := moduletestutil.MakeTestEncodingConfig(
		auth.AppModuleBasic{},
		vesting.AppModuleBasic{},
		authz.AppModuleBasic{},
		bank.AppModuleBasic{},
		consensus.AppModuleBasic{},
		distribution.AppModuleBasic{},
		epochs.AppModuleBasic{},
		genutil.AppModuleBasic{},
		gov.NewAppModuleBasic([]govclient.ProposalHandler{}),
		group.AppModuleBasic{},
		mint.AppModuleBasic{},
		params.AppModuleBasic{},
		slashing.AppModuleBasic{},
		staking.AppModuleBasic{},
		feegrant.AppModuleBasic{},
		nft.AppModuleBasic{},
		circuit.AppModuleBasic{},
		evidence.AppModuleBasic{},
		upgrade.AppModuleBasic{},
		chaincodemodule.NewBasicModule(),
		manamodule.NewBasicModule(),
		treasurymodule.NewBasicModule(),
	)

	return EncodingConfig{
		InterfaceRegistry: cfg.InterfaceRegistry,
		Codec:             cfg.Codec,
		TxConfig:          cfg.TxConfig,
		Amino:             cfg.Amino,
	}
}

func ModuleBasicsRef() module.BasicManager { return ModuleBasics }
func AppName() string                      { return Name }
func DefaultHome() string                  { return DefaultNodeHome }
