// Phase 3 (D-04): Non-persisted session budget slice.
// Carrito writes on sessionBudget change and clears on unmount.
// InicioClient reads to override the profile budget for the duration of the session.
// No persist middleware — purely in-memory, clears on full page reload.
import { create } from "zustand";

export const useSessionBudgetStore = create<{ budget: number | null }>(() => ({
  budget: null,
}));
