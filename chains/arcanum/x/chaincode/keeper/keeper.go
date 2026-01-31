package keeper

import (
	"context"

	"encoding/json"

	"cosmossdk.io/store/prefix"
	storetypes "cosmossdk.io/store/types"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"arcanum/x/chaincode/types"
)

type Keeper struct {
	cdc      codec.Codec
	storeKey storetypes.StoreKey
}

func NewKeeper(cdc codec.Codec, key storetypes.StoreKey) Keeper {
	return Keeper{cdc: cdc, storeKey: key}
}

// --- internal stores ---

func (k Keeper) ownerByTokenStore(ctx sdk.Context) prefix.Store {
	return prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefixOwnerByToken)
}

func (k Keeper) tokenByOwnerStore(ctx sdk.Context) prefix.Store {
	return prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefixTokenByOwner)
}

func (k Keeper) metadataStore(ctx sdk.Context) prefix.Store {
	return prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefixMetadata)
}

// --- ownership ---

func (k Keeper) SetOwner(ctx sdk.Context, tokenId []byte, owner sdk.AccAddress) {
	k.ownerByTokenStore(ctx).Set(tokenId, owner)
	k.tokenByOwnerStore(ctx).Set(owner.Bytes(), tokenId)
}

func (k Keeper) GetOwner(ctx sdk.Context, tokenId []byte) (sdk.AccAddress, bool) {
	bz := k.ownerByTokenStore(ctx).Get(tokenId)
	if bz == nil {
		return nil, false
	}
	return sdk.AccAddress(bz), true
}

func (k Keeper) GetTokenByOwner(ctx sdk.Context, owner sdk.AccAddress) (string, bool) {
	bz := k.tokenByOwnerStore(ctx).Get(owner.Bytes())
	if bz == nil {
		return "", false
	}
	return string(bz), true
}

// --- metadata ---

func (k Keeper) SetMetadata(ctx sdk.Context, tokenId, meta []byte) {
	k.metadataStore(ctx).Set(tokenId, meta)
}

func (k Keeper) GetMetadata(ctx sdk.Context, tokenId []byte) (string, bool) {
	bz := k.metadataStore(ctx).Get(tokenId)
	if bz == nil {
		return "", false
	}
	return string(bz), true
}

// --- params (simple JSON blob under KeyParams) ---

func (k Keeper) GetParams(goCtx context.Context) (types.Params, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	store := ctx.KVStore(k.storeKey)
	bz := store.Get(types.KeyParams)
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
	store.Set(types.KeyParams, bz)
	return nil
}
