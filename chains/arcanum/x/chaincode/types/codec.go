package types

import cdctypes "github.com/cosmos/cosmos-sdk/codec/types"

// RegisterInterfaces registers concrete types with the interface registry.
//
// For now, x/chaincode does not expose any custom interfaces, so this is a no-op.
// It exists purely to satisfy module wiring in module.go.
func RegisterInterfaces(registry cdctypes.InterfaceRegistry) {
	// no-op for now
}
