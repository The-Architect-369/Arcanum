package keeper_test

import (
	"testing"

	"cosmossdk.io/log"
	storemetrics "cosmossdk.io/store/metrics"
	"cosmossdk.io/store"
	storetypes "cosmossdk.io/store/types"
	dbm "github.com/cosmos/cosmos-db"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	tmproto "github.com/cometbft/cometbft/proto/tendermint/types"

	"arcanum/x/chaincode/keeper"
	"arcanum/x/chaincode/types"
)

func setupKeeper(t *testing.T) (keeper.Keeper, sdk.Context) {
	t.Helper()

	db := dbm.NewMemDB()
	stateStore := store.NewCommitMultiStore(db, log.NewNopLogger(), storemetrics.NewNoOpMetrics())
	key := storetypes.NewKVStoreKey(types.StoreKey)
	stateStore.MountStoreWithDB(key, storetypes.StoreTypeIAVL, db)
	if err := stateStore.LoadLatestVersion(); err != nil {
		t.Fatalf("load latest version: %v", err)
	}

	ctx := sdk.NewContext(stateStore, tmproto.Header{}, false, log.NewNopLogger())
	cdc := codec.NewProtoCodec(codectypes.NewInterfaceRegistry())
	k := keeper.NewKeeper(cdc, key)
	return k, ctx
}

func mustAddr(t *testing.T, value string) sdk.AccAddress {
	t.Helper()
	addr, err := sdk.AccAddressFromBech32(value)
	if err != nil {
		t.Fatalf("decode address: %v", err)
	}
	return addr
}

func TestMintAnchorSetsOwnerAndToken(t *testing.T) {
	k, ctx := setupKeeper(t)
	owner := mustAddr(t, "arca1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq0j6r7n")
	tokenID := keeper.DefaultTokenID(owner)

	if err := k.MintAnchor(ctx, owner, tokenID, "cid:alpha"); err != nil {
		t.Fatalf("mint anchor: %v", err)
	}

	gotOwner, found := k.GetOwner(ctx, []byte(tokenID))
	if !found {
		t.Fatalf("expected owner to be stored")
	}
	if !gotOwner.Equals(owner) {
		t.Fatalf("unexpected owner: got %s want %s", gotOwner.String(), owner.String())
	}

	gotToken, found := k.GetTokenByOwner(ctx, owner)
	if !found {
		t.Fatalf("expected token by owner to be stored")
	}
	if gotToken != tokenID {
		t.Fatalf("unexpected token: got %s want %s", gotToken, tokenID)
	}

	metadata, found := k.GetMetadata(ctx, []byte(tokenID))
	if !found || metadata != "cid:alpha" {
		t.Fatalf("unexpected metadata: got %q found=%v", metadata, found)
	}
}

func TestMintAnchorRejectsDuplicateOwner(t *testing.T) {
	k, ctx := setupKeeper(t)
	owner := mustAddr(t, "arca1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq0j6r7n")

	if err := k.MintAnchor(ctx, owner, keeper.DefaultTokenID(owner), ""); err != nil {
		t.Fatalf("initial mint anchor: %v", err)
	}

	if err := k.MintAnchor(ctx, owner, "sbi:another", ""); err == nil {
		t.Fatalf("expected duplicate owner mint to fail")
	}
}

func TestRecoverAnchorRebindsContinuity(t *testing.T) {
	k, ctx := setupKeeper(t)
	currentOwner := mustAddr(t, "arca1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq0j6r7n")
	nextOwner := mustAddr(t, "arca1qyqszqgpqyqszqgpqyqszqgpqyqszqgp5z4w9m")
	tokenID := keeper.DefaultTokenID(currentOwner)

	if err := k.MintAnchor(ctx, currentOwner, tokenID, "cid:alpha"); err != nil {
		t.Fatalf("mint anchor: %v", err)
	}

	recoveredToken, err := k.RecoverAnchor(ctx, currentOwner, nextOwner, "proof:continuity")
	if err != nil {
		t.Fatalf("recover anchor: %v", err)
	}
	if recoveredToken != tokenID {
		t.Fatalf("unexpected recovered token: got %s want %s", recoveredToken, tokenID)
	}

	if _, found := k.GetTokenByOwner(ctx, currentOwner); found {
		t.Fatalf("expected old owner mapping to be cleared")
	}
	gotToken, found := k.GetTokenByOwner(ctx, nextOwner)
	if !found || gotToken != tokenID {
		t.Fatalf("expected new owner mapping to exist, got token=%q found=%v", gotToken, found)
	}
	gotOwner, found := k.GetOwner(ctx, []byte(tokenID))
	if !found || !gotOwner.Equals(nextOwner) {
		t.Fatalf("expected token owner to be rebound to new owner")
	}
}
