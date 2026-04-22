// Tests for src/stores/cart-store.ts
// FIX-01: Cart TTL via onRehydrateStorage; purchaseDays field
// VALIDATION.md: tasks 1-W0-01, 1-W0-02, 1-W0-03

describe("useCartStore", () => {
  describe("clear()", () => {
    it.todo("resets items to [] but does NOT reset purchaseDays (D-11)");
    it.todo("resets totals to zero values");
  });

  describe("setPurchaseDays()", () => {
    it.todo("stores valid values: 1, 2, 3, 5, 7");
    it.todo("rejects values not in allowlist [1,2,3,5,7] — T-1-01 security control");
  });

  describe("onRehydrateStorage — TTL (FIX-01)", () => {
    it.todo("fires clear() when lastUpdated is a past date");
    it.todo("does NOT fire clear() when lastUpdated is today");
    it.todo("purchaseDays is preserved after TTL clear");
  });
});
