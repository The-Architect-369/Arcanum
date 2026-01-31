package app

import (
	"github.com/cosmos/cosmos-sdk/types/module"

	chaincodemodule "arcanum/x/chaincode/module"
	manamodule "arcanum/x/mana/module"
	treasurymodule "arcanum/x/treasury/module"
)

// ModuleBasics defines the module BasicManager for the app.
var ModuleBasics = module.NewBasicManager(
	chaincodemodule.ProvideBasics(),
	manamodule.ProvideBasics(),
	treasurymodule.ProvideBasics(),
)

func ModuleBasicsRef() module.BasicManager { return ModuleBasics }
func AppName() string                      { return Name }
func DefaultHome() string                  { return DefaultNodeHome }
