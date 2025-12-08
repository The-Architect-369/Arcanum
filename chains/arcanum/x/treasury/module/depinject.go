package module

import "github.com/cosmos/cosmos-sdk/types/module"

// Provide a BasicManager if older helpers want it; harmless to keep.
func ProvideBasics() module.BasicManager {
	return module.NewBasicManager()
}
