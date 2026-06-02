package keeper

import (
	"context"
	"encoding/json"
	"fmt"

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

func (k Keeper) SetOwner(ctx sdk.Context, tokenID []byte, owner sdk.AccAddress) {
	k.ownerByTokenStore(ctx).Set(tokenID, owner)
	k.tokenByOwnerStore(ctx).Set(owner.Bytes(), tokenID)
}

func (k Keeper) ClearOwner(ctx sdk.Context, tokenID []byte, owner sdk.AccAddress) {
	k.ownerByTokenStore(ctx).Delete(tokenID)
	k.tokenByOwnerStore(ctx).Delete(owner.Bytes())
}

func (k Keeper) GetOwner(ctx sdk.Context, tokenID []byte) (sdk.AccAddress, bool) {
	bz := k.ownerByTokenStore(ctx).Get(tokenID)
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

func (k Keeper) HasToken(ctx sdk.Context, tokenID string) bool {
	_, found := k.GetOwner(ctx, []byte(tokenID))
	return found
}

func DefaultTokenID(owner sdk.AccAddress) string {
	return fmt.Sprintf("sbi:%s", owner.String())
}

func (k Keeper) MintAnchor(ctx sdk.Context, owner sdk.AccAddress, tokenID, metadata string) error {
	if owner.Empty() {
		return fmt.Errorf("owner is required")
	}
	if tokenID == "" {
		return fmt.Errorf("token id is required")
	}
	if _, found := k.GetTokenByOwner(ctx, owner); found {
		return fmt.Errorf("owner already has a chaincode anchor")
	}
	if k.HasToken(ctx, tokenID) {
		return fmt.Errorf("token already exists")
	}

	k.SetOwner(ctx, []byte(tokenID), owner)
	if metadata != "" {
		k.SetMetadata(ctx, []byte(tokenID), []byte(metadata))
	}
	return nil
}

func (k Keeper) RecoverAnchor(ctx sdk.Context, currentOwner, nextOwner sdk.AccAddress, proof string) (string, error) {
	if currentOwner.Empty() {
		return "", fmt.Errorf("current owner is required")
	}
	if nextOwner.Empty() {
		return "", fmt.Errorf("next owner is required")
	}
	if proof == "" {
		return "", fmt.Errorf("proof is required")
	}

	tokenID, found := k.GetTokenByOwner(ctx, currentOwner)
	if !found {
		return "", fmt.Errorf("no chaincode anchor found for current owner")
	}
	if currentOwner.Equals(nextOwner) {
		return tokenID, nil
	}
	if _, exists := k.GetTokenByOwner(ctx, nextOwner); exists {
		return "", fmt.Errorf("next owner already has a chaincode anchor")
	}

	k.tokenByOwnerStore(ctx).Delete(currentOwner.Bytes())
	k.SetOwner(ctx, []byte(tokenID), nextOwner)
	return tokenID, nil
}

func (k Keeper) GetAnchorByOwner(ctx sdk.Context, owner sdk.AccAddress) (tokenID, metadata string, found bool) {
	tokenID, found = k.GetTokenByOwner(ctx, owner)
	if !found {
		return "", "", false
	}
	metadata, _ = k.GetMetadata(ctx, []byte(tokenID))
	return tokenID, metadata, true
}

func (k Keeper) GetAllAnchors(ctx sdk.Context) []*types.ChaincodeAnchor {
	store := k.ownerByTokenStore(ctx)
	iterator := store.Iterator(nil, nil)
	defer iterator.Close()

	anchors := make([]*types.ChaincodeAnchor, 0)
	for ; iterator.Valid(); iterator.Next() {
		tokenID := string(iterator.Key())
		owner := sdk.AccAddress(iterator.Value())
		metadata, _ := k.GetMetadata(ctx, iterator.Key())
		anchors = append(anchors, &types.ChaincodeAnchor{
			TokenId:  tokenID,
			Owner:    owner.String(),
			Metadata: metadata,
		})
	}
	return anchors
}

func (k Keeper) ImportAnchor(ctx sdk.Context, anchor *types.ChaincodeAnchor) error {
	if anchor == nil {
		return fmt.Errorf("anchor is required")
	}
	if anchor.Owner == "" {
		return fmt.Errorf("anchor owner is required")
	}
	if anchor.TokenId == "" {
		return fmt.Errorf("anchor token id is required")
	}
	owner, err := sdk.AccAddressFromBech32(anchor.Owner)
	if err != nil {
		return fmt.Errorf("invalid anchor owner: %w", err)
	}
	return k.MintAnchor(ctx, owner, anchor.TokenId, anchor.Metadata)
}

// --- metadata ---

func (k Keeper) SetMetadata(ctx sdk.Context, tokenID, meta []byte) {
	k.metadataStore(ctx).Set(tokenID, meta)
}

func (k Keeper) GetMetadata(ctx sdk.Context, tokenID []byte) (string, bool) {
	bz := k.metadataStore(ctx).Get(tokenID)
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
