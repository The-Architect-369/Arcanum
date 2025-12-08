package keeper

import (
	"cosmossdk.io/store/prefix"
	"github.com/cosmos/cosmos-sdk/runtime"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"cosmossdk.io/errors"

	"arcanum/x/mana/types"
)

type Keeper struct{ storeKey runtime.StoreKey }

var (
	balancesPrefix = []byte{0x01}
	supplyKey      = []byte{0x02}
)

// --- balances ---

func (k Keeper) balanceStore(ctx sdk.Context) prefix.Store {
	return prefix.NewStore(ctx.KVStore(k.storeKey), balancesPrefix)
}

func (k Keeper) GetBalance(ctx sdk.Context, addr sdk.AccAddress) sdk.Int {
	bz := k.balanceStore(ctx).Get(addr)
	if bz == nil {
		return sdk.ZeroInt()
	}
	var i sdk.Int
	if err := i.Unmarshal(bz); err != nil {
		panic(err)
	}
	return i
}

func (k Keeper) setBalance(ctx sdk.Context, addr sdk.AccAddress, v sdk.Int) {
	bz, err := v.Marshal()
	if err != nil {
		panic(err)
	}
	k.balanceStore(ctx).Set(addr, bz)
}

// --- supply ---

func (k Keeper) getSupply(ctx sdk.Context) sdk.Int {
	store := ctx.KVStore(k.storeKey)
	bz := store.Get(supplyKey)
	if bz == nil {
		return sdk.ZeroInt()
	}
	var i sdk.Int
	if err := i.Unmarshal(bz); err != nil {
		panic(err)
	}
	return i
}

func (k Keeper) setSupply(ctx sdk.Context, v sdk.Int) {
	store := ctx.KVStore(k.storeKey)
	bz, err := v.Marshal()
	if err != nil {
		panic(err)
	}
	store.Set(supplyKey, bz)
}

// --- public ops ---

func (k Keeper) Mint(ctx sdk.Context, addr sdk.AccAddress, amt sdk.Int) {
	k.setBalance(ctx, addr, k.GetBalance(ctx, addr).Add(amt))
	k.setSupply(ctx, k.getSupply(ctx).Add(amt))
}

func (k Keeper) Burn(ctx sdk.Context, addr sdk.AccAddress, amt sdk.Int) error {
	bal := k.GetBalance(ctx, addr)
	if bal.LT(amt) {
		return errors.Wrap(errors.ErrInsufficientFunds, "burn mana")
	}
	k.setBalance(ctx, addr, bal.Sub(amt))
	k.setSupply(ctx, k.getSupply(ctx).Sub(amt))
	return nil
}

func (k Keeper) Spend(ctx sdk.Context, addr sdk.AccAddress, amt sdk.Int) error {
	bal := k.GetBalance(ctx, addr)
	if bal.LT(amt) {
		return errors.Wrap(errors.ErrInsufficientFunds, "spend mana")
	}
	k.setBalance(ctx, addr, bal.Sub(amt))
	// supply unchanged
	return nil
}

func (k Keeper) Transfer(ctx sdk.Context, from, to sdk.AccAddress, amt sdk.Int) error {
	balFrom := k.GetBalance(ctx, from)
	if balFrom.LT(amt) {
		return errors.Wrap(errors.ErrInsufficientFunds, "transfer mana")
	}
	k.setBalance(ctx, from, balFrom.Sub(amt))
	k.setBalance(ctx, to, k.GetBalance(ctx, to).Add(amt))
	// supply unchanged
	return nil
}
