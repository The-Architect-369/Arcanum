package keeper

import (
	"context"

	"encoding/json"

	errors "cosmossdk.io/errors"
	sdkmath "cosmossdk.io/math"
	"cosmossdk.io/store/prefix"
	storetypes "cosmossdk.io/store/types"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"arcanum/x/mana/types"
)

type Keeper struct {
	cdc      codec.Codec
	storeKey storetypes.StoreKey
}

var (
	balancesPrefix = []byte{0x01}
	supplyKey      = []byte{0x02}
	paramsKey      = []byte{0x10}
)

func NewKeeper(cdc codec.Codec, key storetypes.StoreKey) Keeper {
	return Keeper{cdc: cdc, storeKey: key}
}

// --- balances ---

func (k Keeper) balanceStore(ctx sdk.Context) prefix.Store {
	return prefix.NewStore(ctx.KVStore(k.storeKey), balancesPrefix)
}

func (k Keeper) GetBalance(ctx sdk.Context, addr sdk.AccAddress) sdkmath.Int {
	bz := k.balanceStore(ctx).Get(addr)
	if bz == nil {
		return sdkmath.ZeroInt()
	}
	var i sdkmath.Int
	if err := i.Unmarshal(bz); err != nil {
		panic(err)
	}
	return i
}

func (k Keeper) setBalance(ctx sdk.Context, addr sdk.AccAddress, v sdkmath.Int) {
	bz, err := v.Marshal()
	if err != nil {
		panic(err)
	}
	k.balanceStore(ctx).Set(addr, bz)
}

// --- supply ---

func (k Keeper) getSupply(ctx sdk.Context) sdkmath.Int {
	store := ctx.KVStore(k.storeKey)
	bz := store.Get(supplyKey)
	if bz == nil {
		return sdkmath.ZeroInt()
	}
	var i sdkmath.Int
	if err := i.Unmarshal(bz); err != nil {
		panic(err)
	}
	return i
}

func (k Keeper) setSupply(ctx sdk.Context, v sdkmath.Int) {
	store := ctx.KVStore(k.storeKey)
	bz, err := v.Marshal()
	if err != nil {
		panic(err)
	}
	store.Set(supplyKey, bz)
}

// --- public ops ---

func (k Keeper) Mint(ctx sdk.Context, addr sdk.AccAddress, amt sdkmath.Int) {
	k.setBalance(ctx, addr, k.GetBalance(ctx, addr).Add(amt))
	k.setSupply(ctx, k.getSupply(ctx).Add(amt))
}

func (k Keeper) Burn(ctx sdk.Context, addr sdk.AccAddress, amt sdkmath.Int) error {
	bal := k.GetBalance(ctx, addr)
	if bal.LT(amt) {
		return errors.Wrap(errors.New("mana", 1, "insufficient funds"), "burn mana")
	}
	k.setBalance(ctx, addr, bal.Sub(amt))
	k.setSupply(ctx, k.getSupply(ctx).Sub(amt))
	return nil
}

func (k Keeper) Spend(ctx sdk.Context, addr sdk.AccAddress, amt sdkmath.Int) error {
	bal := k.GetBalance(ctx, addr)
	if bal.LT(amt) {
		return errors.Wrap(errors.New("mana", 1, "insufficient funds"), "spend mana")
	}
	k.setBalance(ctx, addr, bal.Sub(amt))
	return nil
}

func (k Keeper) Transfer(ctx sdk.Context, from, to sdk.AccAddress, amt sdkmath.Int) error {
	balFrom := k.GetBalance(ctx, from)
	if balFrom.LT(amt) {
		return errors.Wrap(errors.New("mana", 1, "insufficient funds"), "transfer mana")
	}
	k.setBalance(ctx, from, balFrom.Sub(amt))
	k.setBalance(ctx, to, k.GetBalance(ctx, to).Add(amt))
	return nil
}

// --- params (simple JSON blob) ---

func (k Keeper) GetParams(goCtx context.Context) (types.Params, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	store := ctx.KVStore(k.storeKey)
	bz := store.Get(paramsKey)
	if bz == nil {
		return types.DefaultParams(), nil
	}
	var p types.Params
	if err := json.Unmarshal(bz, &p); err != nil {
		return types.Params{}, err
	}
	return p, nil
}

func (k Keeper) SetParams(goCtx context.Context, p types.Params) error {
	ctx := sdk.UnwrapSDKContext(goCtx)
	store := ctx.KVStore(k.storeKey)
	bz, err := json.Marshal(&p)
	if err != nil {
		return err
	}
	store.Set(paramsKey, bz)
	return nil
}
