package app

import (
    "github.com/cosmos/cosmos-sdk/types/module"

    chaincodemodule "arcanum/x/chaincode/module"
    manamodule      "arcanum/x/mana/module"
    treasurymodule  "arcanum/x/treasury/module"
)

// ModuleBasics lets CLI / genesis helpers work.
var ModuleBasics = module.NewBasicManager(
    chaincodemodule.ProvideBasics(),
    manamodule.ProvideBasics(),
    treasurymodule.ProvideBasics(),
)

// Name helpers
func AppName() string                       { return Name }
func DefaultHome() string                   { return DefaultNodeHome }
func ModuleBasicsRef() module.BasicManager  { return ModuleBasics }
