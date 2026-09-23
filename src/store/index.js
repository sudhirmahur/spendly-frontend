import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, token: null, isAuthenticated: false,
      setAuth    : (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser : (data)        => set((s) => ({ user: { ...s.user, ...data } })),
      logout     : ()            => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'spendly-auth' }
  )
)

export const useWorkspaceStore = create(
  persist(
    (set) => ({
      currentWorkspace : null,
      workspaces       : [],
      members          : [],
      setCurrentWorkspace : (ws)   => set({ currentWorkspace: ws }),
      setWorkspaces       : (list) => set({ workspaces: list }),
      setMembers          : (m)    => set({ members: m }),
      addWorkspace        : (ws)   => set((s) => ({ workspaces: [...s.workspaces, ws] })),
    }),
    { name: 'spendly-workspace', partialize: (s) => ({ currentWorkspace: s.currentWorkspace }) }
  )
)

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark : false,
      toggle : () => { const n = !get().isDark; document.documentElement.classList.toggle('dark', n); set({ isDark: n }) },
      init   : () => { document.documentElement.classList.toggle('dark', get().isDark) },
    }),
    { name: 'spendly-theme' }
  )
)

export const useAppStore = create((set) => ({
  transactions      : [],
  categories        : [],
  setTransactions   : (t)     => set({ transactions: t }),
  addTransaction    : (tx)    => set((s) => ({ transactions: [tx, ...s.transactions] })),
  updateTransaction : (id, d) => set((s) => ({ transactions: s.transactions.map((t) => t._id === id ? { ...t, ...d } : t) })),
  deleteTransaction : (id)    => set((s) => ({ transactions: s.transactions.filter((t) => t._id !== id) })),
  setCategories     : (c)     => set({ categories: c }),
  addCategory       : (c)     => set((s) => ({ categories: [...s.categories, c] })),
  updateCategory    : (id, d) => set((s) => ({ categories: s.categories.map((c) => c._id === id ? { ...c, ...d } : c) })),
  deleteCategory    : (id)    => set((s) => ({ categories: s.categories.filter((c) => c._id !== id) })),
}))
