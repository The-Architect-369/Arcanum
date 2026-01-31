package types

func DefaultParams() Params {
	return Params{
		Admin:           "",
		NonTransferable: false,
	}
}

func DefaultGenesis() *GenesisState {
	p := DefaultParams()
	return &GenesisState{
		Params: &p,
	}
}
