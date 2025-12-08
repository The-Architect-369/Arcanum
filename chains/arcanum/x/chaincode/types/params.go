package types

import "cosmossdk.io/core/address"

type Params struct {
	Admin       string // optional module admin
	NonTransferable bool
}

func DefaultParams() Params { return Params{NonTransferable: true} }
func (p Params) Validate(ac address.Codec) error { return nil }
