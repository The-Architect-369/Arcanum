package app

import (
	"github.com/cosmos/cosmos-sdk/types/module"
        chaincodemodulev1 "arcanum/proto/arcanum/chaincode/module/v1"
        chaincodetypes "arcanum/x/chaincode/types"
        manamodulev1 "arcanum/proto/arcanum/mana/module/v1"
        manatypes "arcanum/x/mana/types"

)

var (
	// ModuleBasics lets the CLI add genesis helpers, encoders, and client wiring.
	ModuleBasics = module.NewBasicManager()
        { Name: treasurytypes.ModuleName, Config: appconfig.WrapAny(&treasurymodulev1.Module{}) },
        { Name: manatypes.ModuleName,     Config: appconfig.WrapAny(&manamodulev1.Module{}) },
        { Name: chaincodetypes.ModuleName,Config: appconfig.WrapAny(&chaincodemodulev1.Module{}) },


)

treasurymodulev1 "arcanum/proto/arcanum/treasury/module/v1"
treasurymodule   "arcanum/x/treasury/module"
treasurytypes    "arcanum/x/treasury/types"

manamodulev1 "arcanum/proto/arcanum/mana/module/v1"
manatypes    "arcanum/x/mana/types"

chaincodemodulev1 "arcanum/proto/arcanum/chaincode/module/v1"
chaincodetypes    "arcanum/x/chaincode/types"

// Name helpers (used by cmd/root.go)
func AppName() string       { return Name }
func DefaultHome() string   { return DefaultNodeHome }
func ModuleBasicsRef() module.BasicManager { return ModuleBasics }
