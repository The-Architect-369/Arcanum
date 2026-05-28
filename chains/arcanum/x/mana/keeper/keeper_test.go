package keeper_test

import (
	"bytes"
	"testing"

	"cosmossdk.io/log"
	"cosmossdk.io/store"
	storemetrics "cosmossdk.io/store/metrics"
	storetypes "cosmossdk.io/store/types"
	sdkmath "cosmossdk.io/math"
	dbm "github.com/cosmos/cosmos-db"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	tmproto "github.com/cometbft/cometbft/proto/tendermint/types"

	"arcanum/x/mana/keeper"
	"arcanum/x/mana/types"
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

func testAddr(fill byte) sdk.AccAddress {
	return sdk.AccAddress(bytes.Repeat([]byte{fill}, 20))
}

func TestMintAndSpendMutateBalance(t *testing.T) {
	k, ctx := setupKeeper(t)
	owner := testAddr(0x01)

	k.Mint(ctx, owner, sdkmath.NewInt(100))
	if got := k.GetBalance(ctx, owner); !got.Equal(sdkmath.NewInt(100)) {
		t.Fatalf("unexpected minted balance: got %s want 100", got.String())
	}

	if err := k.Spend(ctx, owner, sdkmath.NewInt(25)); err != nil {
		t.Fatalf("spend mana: %v", err)
	}
	if got := k.GetBalance(ctx, owner); !got.Equal(sdkmath.NewInt(75)) {
		t.Fatalf("unexpected balance after spend: got %s want 75", got.String())
	}
}

func TestSpendRejectsInsufficientFunds(t *testing.T) {
	k, ctx := setupKeeper(t)
	owner := testAddr(0x01)
	k.Mint(ctx, owner, sdkmath.NewInt(10))

	if err := k.Spend(ctx, owner, sdkmath.NewInt(11)); err == nil {
		t.Fatalf("expected insufficient funds spend to fail")
	}
}

func TestTransferMovesBalanceBetweenAccounts(t *testing.T) {
	k, ctx := setupKeeper(t)
	from := testAddr(0x01)
	to := testAddr(0x02)

	k.Mint(ctx, from, sdkmath.NewInt(50))
	if err := k.Transfer(ctx, from, to, sdkmath.NewInt(20)); err != nil {
		t.Fatalf("transfer mana: %v", err)
	}

	if got := k.GetBalance(ctx, from); !got.Equal(sdkmath.NewInt(30)) {
		t.Fatalf("unexpected sender balance: got %s want 30", got.String())
	}
	if got := k.GetBalance(ctx, to); !got.Equal(sdkmath.NewInt(20)) {
		t.Fatalf("unexpected receiver balance: got %s want 20", got.String())
	}
}
