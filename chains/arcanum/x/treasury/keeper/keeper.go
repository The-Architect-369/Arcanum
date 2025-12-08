package keeper

import (
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Keeper struct {
	cdc      codec.Codec
	storeKey storetypes.StoreKey
	// add dependencies later, e.g. BankKeeper
}

func NewKeeper(cdc codec.Codec, key storetypes.StoreKey) Keeper {
	return Keeper{cdc: cdc, storeKey: key}
}

func (k Keeper) BeginBlock(ctx sdk.Context) {}
func (k Keeper) EndBlock(ctx sdk.Context)   {}
