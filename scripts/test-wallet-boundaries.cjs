#!/usr/bin/env node
// Run the real TypeScript modules with inert persistence and network dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function fixture() {
  const receipts = [];
  const cache = new Map();
  const persistence = {
    addReceipt: async value => { receipts.push(value); },
    getPersistentValue: async () => null,
    removePersistentValue: async () => {},
    setPersistentValue: async () => {},
  };
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative).exports;
    const module = { exports: {} };
    cache.set(relative, module);
    const source = fs.readFileSync(path.join(root, 'apps/web/src', relative + '.ts'), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const requireModule = name => {
      if (name === 'react') return {};
      if (name === '@/lib/mobile/persistence') return persistence;
      if (name === '@/lib/cosmos/queries') return new Proxy({}, { get() { return () => { throw Error('Unexpected network query'); }; } });
      if (name.startsWith('@/')) return load(name.slice(2));
      throw Error('Unexpected dependency: ' + name);
    };
    vm.runInNewContext(code, { module, exports: module.exports, require: requireModule, console, crypto: { randomUUID: () => 'fixture-operation' } }, { filename: relative });
    return module.exports;
  }
  return { wallet: load('lib/wallet/context'), account: load('state/useAccount'), economy: load('lib/economy/economy'), receipts };
}
function intent(f, amount = 3, denom = 'umana') {
  return f.wallet.createWalletSpendIntent({ amount, denom, purpose: 'Public synthetic preview', category: 'optional_utility' }).intent;
}
function context(f, balance = '10', denom = 'umana') {
  const c = f.wallet.createWalletContext(f.account.getState());
  c.balances = [{ amount: balance, denom, source: 'local_scaffold' }];
  return c;
}
test('an unrelated denomination cannot pay the requested amount', () => {
  const f = fixture();
  assert.equal(f.wallet.validateSpendIntentAgainstWallet(context(f, '100', 'other'), intent(f)).ok, false);
});
test('account spending cannot relabel the local balance to match another currency', () => {
  const f = fixture();
  f.account.setManaBalance(10);
  assert.equal(f.account.spendMana(3, { denom: 'other' }), false);
  assert.equal(f.account.getManaBalance(), 10);
  assert.equal(f.receipts.length, 0);
});
test('malformed and unsafe balances cannot bypass insufficiency', () => {
  const f = fixture();
  for (const value of ['NaN', 'Infinity', '-1', '1.5', '', '9007199254740992']) {
    assert.equal(f.wallet.validateSpendIntentAgainstWallet(context(f, value), intent(f)).ok, false, value);
  }
});
test('creation and validation reject fractional, invalid and unsafe amounts', () => {
  const f = fixture();
  for (const value of [NaN, Infinity, -1, 0, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(f.wallet.createWalletSpendIntent({ amount: value, purpose: 'Preview', category: 'optional_utility' }).ok, false);
  }
  for (const value of ['1.5', 'NaN', '1e2', '9007199254740992']) {
    assert.equal(f.wallet.validateSpendIntentAgainstWallet(context(f), { ...intent(f), amount: value }).ok, false);
  }
});
test('exact funds and confirmation requirements remain enforced', () => {
  const f = fixture();
  assert.equal(f.wallet.validateSpendIntentAgainstWallet(context(f, '3'), intent(f)).ok, true);
  assert.equal(f.wallet.validateSpendIntentAgainstWallet(context(f, '2'), intent(f)).ok, false);
  assert.equal(f.wallet.validateSpendIntentAgainstWallet(context(f), { ...intent(f), requiresConfirmation: false }).ok, false);
});
test('chain-associated accounts cannot be changed by local debit or credit', () => {
  for (const patch of [{ chainAddress: 'public-fixture', settlementStatus: 'bound' }, { lastSyncedAt: '2026-10-07T00:00:00Z' }, { settlementStatus: 'syncing' }, { settlementStatus: 'error' }]) {
    const f = fixture();
    f.account.setAccountSession({ mana: 10, ...patch });
    assert.equal(f.account.canUseLocalSpendPreview(), false);
    assert.equal(f.economy.trySpendMana(3), false);
    assert.equal(f.account.creditMana(5), 10);
    assert.equal(f.account.getManaBalance(), 10);
    assert.equal(f.receipts.length, 0);
  }
});
test('one informational preview receipt preserves purpose without settlement', () => {
  const f = fixture();
  f.account.setManaBalance(10);
  assert.equal(f.economy.trySpendMana(3, 'Nexus post preview'), true);
  assert.equal(f.account.getManaBalance(), 7);
  assert.equal(f.receipts.length, 1);
  assert.equal(f.receipts[0].status, 'info');
  assert.equal(f.receipts[0].metadata.intent.purpose, 'Nexus post preview');
  assert.equal(f.receipts[0].metadata.source, 'local_scaffold');
  assert.equal(f.receipts[0].metadata.settlement, 'not_submitted');
});
test('invalid wrapper requests fail; zero-cost actions do not fabricate receipts', () => {
  const f = fixture();
  f.account.setManaBalance(10);
  for (const value of [-1, NaN, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1]) assert.equal(f.economy.trySpendMana(value), false);
  assert.equal(f.economy.trySpendMana(0), true);
  assert.equal(f.account.getManaBalance(), 10);
  assert.equal(f.receipts.length, 0);
});
