package types

const (
	ModuleName   = "chaincode"
	StoreKey     = ModuleName
	RouterKey    = ModuleName
	MemStoreKey  = "mem_chaincode"
)

var (
	KeyPrefixOwnerByToken = []byte{0x01}
	KeyPrefixTokenByOwner = []byte{0x02}
	KeyPrefixMetadata     = []byte{0x03}

	KeyParams = []byte{0x10}
)

