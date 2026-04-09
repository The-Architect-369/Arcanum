package app

import "github.com/cosmos/cosmos-sdk/types/module"

// ModuleBasics defines the module BasicManager for the app.
var ModuleBasics = module.NewBasicManager()

func ModuleBasicsRef() module.BasicManager { return ModuleBasics }
func AppName() string                      { return Name }
func DefaultHome() string                  { return DefaultNodeHome }
