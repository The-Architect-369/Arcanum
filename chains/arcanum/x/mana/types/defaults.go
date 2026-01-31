package types

func DefaultParams() Params {
	return Params{
		Admin:           "",
		TransferEnabled: true,
	}
}

func DefaultGenesis() *GenesisState {
	p := DefaultParams()
	return &GenesisState{
		Params: &p,
	}
}
