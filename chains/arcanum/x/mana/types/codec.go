package types

import cdctypes "github.com/cosmos/cosmos-sdk/codec/types"

// RegisterInterfaces registers x/mana interfaces and concrete types.
//
// For now, x/mana does not expose custom interfaces, so this is a no-op.
// It exists to satisfy the module wiring in x/mana/module.
func RegisterInterfaces(registry cdctypes.InterfaceRegistry) {
	// no-op for now
}
