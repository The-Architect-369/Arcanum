package types

import "cosmossdk.io/core/address"

type Params struct {
	Admin            string // bech32 authority for Mint/Burn if you want one
	TransferEnabled  bool
}

func DefaultParams() Params {
	return Params{
		TransferEnabled: true,
	}
}

func (p Params) Validate(ac address.Codec) error {
	// optional: validate Admin bech32 if non-empty
	return nil
}
