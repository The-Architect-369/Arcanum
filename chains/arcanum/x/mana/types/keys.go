package types

const (
	// ModuleName defines the module name for x/mana.
	ModuleName = "mana"

	// StoreKey is the primary KVStore key for x/mana.
	StoreKey = ModuleName

	// RouterKey is the message route for the mana module.
	RouterKey = ModuleName

	// MemStoreKey is the in-memory KVStore key.
	MemStoreKey = "mem_mana"
)

var (
	// KeyBalance prefix for address->balance mappings (if you add them).
	KeyBalance = []byte{0x01}

	// KeySupply prefix for tracking total mana supply.
	KeySupply = []byte{0x02}

	// KeyParams is the single key under which module Params are stored.
	KeyParams = []byte{0x10}
)
