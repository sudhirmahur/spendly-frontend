import { create } from 'zustand'
import { persist } from 'zustand/middleware'


// =====================================================
// AUTH STORE
// =====================================================

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) =>
        set({
          token,
          isAuthenticated: !!token,
        }),

      // Used by useAuth -> updateProfile
      updateUser: (data) =>
        set((state) => ({
          user: {
            ...state.user,
            ...data,
          },
        })),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'spendly-auth',
    }
  )
)


// =====================================================
// APP STORE
// =====================================================

export const useAppStore = create((set) => ({
  // -------------------------
  // Transactions
  // -------------------------

  transactions: [],

  setTransactions: (transactions) =>
    set({
      transactions: Array.isArray(transactions)
        ? transactions
        : [],
    }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [
        transaction,
        ...state.transactions,
      ],
    })),

  updateTransaction: (id, transaction) =>
    set((state) => ({
      transactions: state.transactions.map((item) =>
        item._id === id
          ? {
              ...item,
              ...transaction,
            }
          : item
      ),
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter(
        (item) => item._id !== id
      ),
    })),


  // -------------------------
  // Categories
  // -------------------------

  categories: [],

  setCategories: (categories) =>
    set({
      categories: Array.isArray(categories)
        ? categories
        : [],
    }),

  addCategory: (category) =>
    set((state) => ({
      categories: [
        ...state.categories,
        category,
      ],
    })),

  updateCategory: (id, category) =>
    set((state) => ({
      categories: state.categories.map((item) =>
        item._id === id
          ? {
              ...item,
              ...category,
            }
          : item
      ),
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter(
        (item) => item._id !== id
      ),
    })),
}))


// =====================================================
// WORKSPACE STORE
// =====================================================

export const useWorkspaceStore = create(
  persist(
    (set) => ({
      currentWorkspace: null,
      workspaces: [],
      members: [],

      // -------------------------
      // Current Workspace
      // -------------------------

      setCurrentWorkspace: (ws) =>
        set((state) => {
          if (!ws?._id) {
            return {
              currentWorkspace: null,
            }
          }

          const exists =
            state.workspaces.some(
              (workspace) =>
                workspace._id === ws._id
            )

          return {
            currentWorkspace: ws,

            workspaces: exists
              ? state.workspaces.map(
                  (workspace) =>
                    workspace._id === ws._id
                      ? {
                          ...workspace,
                          ...ws,
                        }
                      : workspace
                )
              : [
                  ...state.workspaces,
                  ws,
                ],
          }
        }),

      // -------------------------
      // Workspace List
      // -------------------------

      setWorkspaces: (list) =>
        set((state) => {
          const safeList =
            Array.isArray(list)
              ? list
              : []

          const current =
            state.currentWorkspace

          const freshCurrent =
            current?._id
              ? safeList.find(
                  (ws) =>
                    ws._id ===
                    current._id
                ) || current
              : safeList[0] || null

          return {
            workspaces: safeList,
            currentWorkspace:
              freshCurrent,
          }
        }),

      // -------------------------
      // Members
      // -------------------------

      setMembers: (members) =>
        set({
          members: Array.isArray(
            members
          )
            ? members
            : [],
        }),

      // -------------------------
      // Add Workspace
      // -------------------------

      addWorkspace: (ws) =>
        set((state) => {
          if (!ws?._id) {
            return state
          }

          const exists =
            state.workspaces.some(
              (workspace) =>
                workspace._id === ws._id
            )

          return {
            workspaces: exists
              ? state.workspaces.map(
                  (workspace) =>
                    workspace._id ===
                    ws._id
                      ? {
                          ...workspace,
                          ...ws,
                        }
                      : workspace
                )
              : [
                  ...state.workspaces,
                  ws,
                ],
          }
        }),

      // -------------------------
      // Remove Workspace
      // -------------------------

      removeWorkspace: (workspaceId) =>
        set((state) => {
          const updated =
            state.workspaces.filter(
              (ws) =>
                ws._id !== workspaceId
            )

          const currentWasRemoved =
            state.currentWorkspace?._id ===
            workspaceId

          return {
            workspaces: updated,

            currentWorkspace:
              currentWasRemoved
                ? updated[0] || null
                : state.currentWorkspace,
          }
        }),

      // -------------------------
      // Clear Workspace
      // -------------------------

      clearWorkspaces: () =>
        set({
          currentWorkspace: null,
          workspaces: [],
          members: [],
        }),
    }),

    {
      name: 'spendly-workspace',

      partialize: (state) => ({
        currentWorkspace:
          state.currentWorkspace,

        workspaces:
          state.workspaces,
      }),
    }
  )
)

// =====================================================
// THEME STORE
// =====================================================

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',

      setTheme: (theme) =>
        set({
          theme,
        }),

      toggleTheme: () =>
        set((state) => ({
          theme:
            state.theme === 'dark'
              ? 'light'
              : 'dark',
        })),
    }),
    {
      name: 'spendly-theme',
    }
  )
)