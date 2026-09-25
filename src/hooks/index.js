import { useState, useEffect, useCallback } from 'react'

import {
  authAPI,
  transactionAPI,
  categoryAPI,
  statsAPI,
  workspaceAPI,
  referralAPI,
} from '../services/api'

import {
  useAppStore,
  useAuthStore,
  useWorkspaceStore,
} from '../store'

import toast from 'react-hot-toast'


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function extractList(d) {
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.transactions)) return d.transactions
  if (Array.isArray(d?.categories)) return d.categories
  if (Array.isArray(d?.data?.transactions)) {
    return d.data.transactions
  }
  // ✅ FIX
  if (Array.isArray(d?.data?.categories)) {
    return d.data.categories
  }
  if (Array.isArray(d?.members)) return d.members
  if (Array.isArray(d?.users)) return d.users
  if (Array.isArray(d?.docs)) return d.docs

  return []
}


function extractPagination(d, len) {
  const p =
    d?.pagination ||
    d?.meta ||
    d?.data?.pagination

  if (p) return p

  return {
    page: 1,
    total: d?.total ?? len,
    pages: d?.pages ?? 1,
  }
}


function extractSingle(d) {
  return (
    d?.data?.transaction ||
    d?.transaction ||
    d?.data?.category ||
    d?.category ||
    d?.data ||
    d
  )
}


// Extract user + token from any auth response shape
function extractAuth(d) {
  if (d?.user && d?.token) {
    return {
      user: d.user,
      token: d.token,
    }
  }

  if (d?.data?.user && d?.data?.token) {
    return {
      user: d.data.user,
      token: d.data.token,
    }
  }

  if (d?.token && d?.data?._id) {
    return {
      user: d.data,
      token: d.token,
    }
  }

  if (d?.token && d?._id) {
    const { token, ...u } = d

    return {
      user: u,
      token,
    }
  }

  return {
    user: null,
    token: null,
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Category metadata
// ─────────────────────────────────────────────────────────────────────────────

const SLUG_META = {
  food: {
    icon: '🍔',
    color: '#f97316',
  },

  travel: {
    icon: '✈️',
    color: '#3b82f6',
  },

  shopping: {
    icon: '🛍️',
    color: '#a855f7',
  },

  entertainment: {
    icon: '🎬',
    color: '#ec4899',
  },

  healthcare: {
    icon: '💊',
    color: '#ef4444',
  },

  education: {
    icon: '📚',
    color: '#06b6d4',
  },

  utilities: {
    icon: '⚡',
    color: '#eab308',
  },

  rent: {
    icon: '🏠',
    color: '#64748b',
  },

  salary: {
    icon: '💼',
    color: '#10b981',
  },

  freelance: {
    icon: '💻',
    color: '#0ea5e9',
  },

  investment: {
    icon: '📈',
    color: '#8b5cf6',
  },

  gift: {
    icon: '🎁',
    color: '#f43f5e',
  },

  other: {
    icon: '📦',
    color: '#94a3b8',
  },
}


function enrichCat(c) {
  if (!c) return c

  const slug = (c.slug || c.name || '')
    .toLowerCase()
    .replace(/[\s&]/g, '')

  const key =
    Object.keys(SLUG_META).find((k) =>
      slug.startsWith(k)
    ) || 'other'

  const meta = SLUG_META[key]

  return {
    ...c,
    icon: c.icon || meta.icon,
    color: c.color || meta.color,
  }
}


// Given the raw category field on a transaction and the loaded category list,
// return a full enriched category object for display purposes.
//
// DISPLAY ONLY.
// API always receives the plain category _id.

function resolveCatDisplay(raw, catList) {
  if (!raw) {
    return enrichCat({
      _id: 'other',
      name: 'Other',
      type: 'expense',
    })
  }

  // Already populated object
  if (
    typeof raw === 'object' &&
    raw._id
  ) {
    return enrichCat(raw)
  }

  // String — find by ObjectId, slug or name
  const found = catList.find(
    (c) =>
      c._id === raw ||
      c.slug === raw ||
      c.name?.toLowerCase() ===
        raw?.toLowerCase()
  )

  if (found) {
    return enrichCat(found)
  }

  return {
    _id: raw,
    name: raw,
    icon: '📦',
    color: '#94a3b8',
    type: 'expense',
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// useCategories
// ─────────────────────────────────────────────────────────────────────────────

export function useCategories() {
  const {
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useAppStore()

  const {
    currentWorkspace,
  } = useWorkspaceStore()

  const [loading, setLoading] = useState(false)


  const fetch = useCallback(
    async (force = false) => {
      if (
        categories.length > 0 &&
        !force
      ) {
        return categories
      }

      setLoading(true)

      try {
        const res =
          await categoryAPI.getAll()

        const list =
          extractList(res.data)
            .map(enrichCat)

        setCategories(list)

        return list
      } catch (e) {
        if (
          import.meta.env.VITE_DEBUG ===
          'true'
        ) {
          console.error(
            '[categories fetch]',
            e
          )
        }

        toast.error(
          e.friendlyMessage ||
            'Failed to load categories'
        )

        return categories
      } finally {
        setLoading(false)
      }
    },
    [
      categories,
      setCategories,
    ]
  )


  // Fetch categories whenever workspace changes
  useEffect(() => {
    if (!currentWorkspace?._id) return

    // Important:
    // Remove old workspace categories first.
    setCategories([])

    fetch(true)
  }, [
    currentWorkspace?._id,
  ]) // eslint-disable-line react-hooks/exhaustive-deps


  const create = async (data) => {
    try {
      const res =
        await categoryAPI.create(data)

      const cat =
        enrichCat(
          extractSingle(res.data)
        )

      addCategory(cat)

      toast.success(
        'Category created!'
      )

      return cat
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          'Failed to create category'
      )

      throw e
    }
  }


  const update = async (id, data) => {
    try {
      const res =
        await categoryAPI.update(
          id,
          data
        )

      updateCategory(
        id,
        enrichCat(
          extractSingle(res.data)
        )
      )

      toast.success(
        'Category updated!'
      )
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          'Failed to update category'
      )

      throw e
    }
  }


  const remove = async (id) => {
    try {
      await categoryAPI.delete(id)

      deleteCategory(id)

      toast.success(
        'Category deleted'
      )
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          'Failed to delete category'
      )

      throw e
    }
  }


  return {
    categories,
    loading,
    create,
    update,
    remove,

    refetch: () => fetch(true),
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// useTransactions
// ─────────────────────────────────────────────────────────────────────────────

export function useTransactions(
  initialFilters = {}
) {
  const {
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
  } = useAppStore()

  const {
    currentWorkspace,
  } = useWorkspaceStore()

  const [loading, setLoading] =
    useState(false)

  const [summary, setSummary] =
    useState({
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    })

  const [monthlyData, setMonthlyData] =
    useState([])

  const [categoryData, setCategoryData] =
    useState([])

  const [pagination, setPagination] =
    useState({
      page: 1,
      total: 0,
      pages: 1,
    })


  // Normalize transaction category
  const normTx = useCallback(
    (t) => ({
      ...t,
      category:
        resolveCatDisplay(
          t.category,
          categories
        ),
    }),
    [categories]
  )


  const fetch = useCallback(
    async (params = {}) => {
      if (!currentWorkspace?._id) {
        setTransactions([])
        setSummary({
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
        })

        setMonthlyData([])
        setCategoryData([])

        return
      }

      setLoading(true)

      try {
        const [
          txRes,
          sumRes,
          monRes,
          catRes,
        ] = await Promise.allSettled([
          transactionAPI.getAll(params),
          statsAPI.summary(),
          statsAPI.monthly(),
          statsAPI.category(),
        ])


        // Transactions
        if (
          txRes.status ===
          'fulfilled'
        ) {
          const raw =
            extractList(
              txRes.value.data
            )

          const list =
            raw.map(normTx)

          setTransactions(list)

          setPagination(
            extractPagination(
              txRes.value.data,
              list.length
            )
          )
        } else {
          toast.error(
            txRes.reason
              ?.friendlyMessage ||
              'Failed to load transactions'
          )

          setTransactions([])
        }


        // Summary
        if (
          sumRes.status ===
          'fulfilled'
        ) {
          const d =
            sumRes.value.data
              ?.data ||
            sumRes.value.data ||
            {}

          setSummary({
            totalIncome:
              d.totalIncome ??
              d.income ??
              0,

            totalExpense:
              d.totalExpense ??
              d.expense ??
              0,

            balance:
              d.balance ??
              (
                (d.totalIncome ??
                  d.income ??
                  0) -
                (d.totalExpense ??
                  d.expense ??
                  0)
              ),
          })
        } else {
          setSummary({
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
          })
        }


        // Monthly
        if (
          monRes.status ===
          'fulfilled'
        ) {
          const d =
            monRes.value.data

          setMonthlyData(
            Array.isArray(d)
              ? d
              : d?.data || []
          )
        } else {
          setMonthlyData([])
        }


        // Category
        if (
          catRes.status ===
          'fulfilled'
        ) {
          const d =
            catRes.value.data

          setCategoryData(
            Array.isArray(d)
              ? d
              : d?.data || []
          )
        } else {
          setCategoryData([])
        }

      } finally {
        setLoading(false)
      }
    },
    [
      currentWorkspace?._id,
      normTx,
      setTransactions,
    ]
  )


  // IMPORTANT:
  // Re-fetch everything when workspace changes.

  useEffect(() => {
    if (!currentWorkspace?._id) return

    fetch(initialFilters)
  }, [
    currentWorkspace?._id,
  ]) // eslint-disable-line react-hooks/exhaustive-deps


  // ───────────────────────────────────────────────────────────────────────────
  // Refresh stats
  // ───────────────────────────────────────────────────────────────────────────

  const refreshStats = async () => {
    if (!currentWorkspace?._id) {
      return
    }

    try {
      const [
        s,
        m,
        c,
      ] = await Promise.allSettled([
        statsAPI.summary(),
        statsAPI.monthly(),
        statsAPI.category(),
      ])


      if (
        s.status ===
        'fulfilled'
      ) {
        const d =
          s.value.data
            ?.data ||
          s.value.data ||
          {}

        setSummary({
          totalIncome:
            d.totalIncome ??
            d.income ??
            0,

          totalExpense:
            d.totalExpense ??
            d.expense ??
            0,

          balance:
            d.balance ??
            0,
        })
      }


      if (
        m.status ===
        'fulfilled'
      ) {
        const d =
          m.value.data

        setMonthlyData(
          Array.isArray(d)
            ? d
            : d?.data || []
        )
      }


      if (
        c.status ===
        'fulfilled'
      ) {
        const d =
          c.value.data

        setCategoryData(
          Array.isArray(d)
            ? d
            : d?.data || []
        )
      }

    } catch (_) {}
  }


  // ───────────────────────────────────────────────────────────────────────────
  // Create transaction
  // ───────────────────────────────────────────────────────────────────────────

  const create = async (data) => {
    const categoryId =
      typeof data.category ===
      'object'
        ? data.category?._id
        : data.category


    if (!categoryId) {
      toast.error(
        'Please select a category'
      )

      throw new Error(
        'Category required'
      )
    }


    const payload = {
      type: data.type,
      amount: Number(
        data.amount
      ),
      category: categoryId,
      note: data.note || '',
      date: data.date,
    }


    if (
      import.meta.env.VITE_DEBUG ===
      'true'
    ) {
      console.log(
        '[create transaction payload]',
        payload
      )
    }


    try {
      const res =
        await transactionAPI.create(
          payload
        )

      const newTx =
        normTx(
          extractSingle(res.data)
        )

      addTransaction(newTx)

      toast.success(
        'Transaction added! 🎉'
      )

      await refreshStats()

      return newTx

    } catch (e) {
      const errs =
        e.response?.data?.errors

      const msg =
        errs?.length
          ? errs
              .map(
                (err) =>
                  `${err.field}: ${err.message}`
              )
              .join(' · ')
          : e.response?.data
              ?.message ||
            'Failed to add transaction'

      toast.error(msg)

      throw e
    }
  }


  // ───────────────────────────────────────────────────────────────────────────
  // Update transaction
  // ───────────────────────────────────────────────────────────────────────────

  const update = async (
    id,
    data
  ) => {
    const categoryId =
      typeof data.category ===
      'object'
        ? data.category?._id
        : data.category


    const payload = {
      type: data.type,
      amount: Number(
        data.amount
      ),
      category: categoryId,
      note: data.note || '',
      date: data.date,
    }


    try {
      const res =
        await transactionAPI.update(
          id,
          payload
        )

      const upd =
        normTx(
          extractSingle(res.data)
        )

      updateTransaction(
        id,
        upd
      )

      toast.success(
        'Transaction updated!'
      )

      await refreshStats()

    } catch (e) {
      const errs =
        e.response?.data?.errors

      const msg =
        errs?.length
          ? errs
              .map(
                (err) =>
                  `${err.field}: ${err.message}`
              )
              .join(' · ')
          : e.response?.data
              ?.message ||
            'Failed to update'

      toast.error(msg)

      throw e
    }
  }


  // ───────────────────────────────────────────────────────────────────────────
  // Delete transaction
  // ───────────────────────────────────────────────────────────────────────────

  const remove = async (id) => {
    try {
      await transactionAPI.delete(
        id
      )

      deleteTransaction(id)

      toast.success(
        'Transaction deleted'
      )

      await refreshStats()

    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          'Failed to delete'
      )

      throw e
    }
  }


  return {
    transactions,
    loading,

    summary,
    monthlyData,
    categoryData,
    pagination,

    create,
    update,
    remove,

    refetch: fetch,
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// useWorkspace
// ─────────────────────────────────────────────────────────────────────────────

export function useWorkspace() {
  const {
    currentWorkspace,
    workspaces,
    members,

    setCurrentWorkspace,
    setWorkspaces,
    addWorkspace,
    setMembers,
  } = useWorkspaceStore()

  const [loading, setLoading] =
    useState(false)


  // ───────────────────────────────────────────────────────────────────────────
  // Fetch workspaces
  // ───────────────────────────────────────────────────────────────────────────
const fetchWorkspaces = useCallback(
  async () => {
    setLoading(true)

    try {
      const res = await workspaceAPI.getAll()

      const response = res.data

      // Backend response:
      // {
      //   data: {
      //     workspaces: [
      //       {
      //         workspace: {...},
      //         role: "owner"
      //       }
      //     ]
      //   }
      // }

      const rawWorkspaces =
        response?.data?.workspaces ||
        response?.workspaces ||
        []

      // Convert WorkspaceMember objects
      // into actual workspace objects
      const list = rawWorkspaces
        .map((item) => {
          const workspace = item?.workspace

          if (!workspace?._id) {
            return null
          }

          return {
            ...workspace,
            role: item.role,
          }
        })
        .filter(Boolean)

      console.log(
        'Workspace API response:',
        response
      )

      console.log(
        'Normalized workspaces:',
        list
      )

      setWorkspaces(list)

      // -----------------------------------------
      // Keep current workspace if available
      // -----------------------------------------

      const currentId =
        currentWorkspace?._id

      if (currentId) {
        const selected = list.find(
          (ws) => ws._id === currentId
        )

        if (selected) {
          setCurrentWorkspace(selected)
        } else if (list.length > 0) {
          setCurrentWorkspace(list[0])
        }
      } else if (list.length > 0) {
        setCurrentWorkspace(list[0])
      }

    } catch (e) {
      console.error(
        '[workspace fetch]',
        e
      )

      toast.error(
        e.friendlyMessage ||
          e.response?.data?.message ||
          'Failed to load workspaces'
      )
    } finally {
      setLoading(false)
    }
  },
  [
    currentWorkspace?._id,
    setCurrentWorkspace,
    setWorkspaces,
  ]
)

  // ───────────────────────────────────────────────────────────────────────────
  // Create workspace
  // ───────────────────────────────────────────────────────────────────────────

  const createWorkspace =
    async (data) => {
      try {
        const res =
          await workspaceAPI.create(
            data
          )

        const ws =
          extractSingle(
            res.data
          )


        if (!ws?._id) {
          throw new Error(
            'Workspace was created but no workspace ID was returned'
          )
        }


        // Add to dropdown immediately
        addWorkspace(ws)

        // Automatically select it
        setCurrentWorkspace(ws)


        toast.success(
          `Workspace "${
            ws.name || data.name
          }" created!`
        )


        return ws

      } catch (e) {
        toast.error(
          e.response?.data
            ?.message ||
            e.friendlyMessage ||
            'Failed to create workspace'
        )

        throw e
      }
    }


  // ───────────────────────────────────────────────────────────────────────────
  // Switch workspace
  // ───────────────────────────────────────────────────────────────────────────

  const switchWorkspace =
    async (ws) => {
      if (!ws?._id) return

      try {
        setLoading(true)

        await workspaceAPI.switchTo(
          ws._id
        )

        // Update frontend immediately
        setCurrentWorkspace(ws)

        toast.success(
          `Switched to "${ws.name}"`
        )

      } catch (e) {
        toast.error(
          e.response?.data
            ?.message ||
            e.friendlyMessage ||
            'Failed to switch workspace'
        )
      } finally {
        setLoading(false)
      }
    }


  // ───────────────────────────────────────────────────────────────────────────
  // Members
  // ───────────────────────────────────────────────────────────────────────────

  const fetchMembers =
    async () => {
      try {
        const res =
          await workspaceAPI.getMembers()

        const m =
          extractList(res.data)

        setMembers(m)

        return m

      } catch (e) {
        if (
          import.meta.env.VITE_DEBUG ===
          'true'
        ) {
          console.error(
            '[members fetch]',
            e
          )
        }

        return []
      }
    }


  const removeMember =
    async (userId) => {
      try {
        await workspaceAPI.removeMember(
          userId
        )

        setMembers(
          members.filter(
            (m) =>
              (m._id ||
                m.user?._id) !==
              userId
          )
        )

        toast.success(
          'Member removed'
        )

      } catch (e) {
        toast.error(
          e.response?.data
            ?.message ||
            'Failed to remove member'
        )
      }
    }


  return {
    currentWorkspace,
    workspaces,
    members,
    loading,

    switchWorkspace,
    createWorkspace,

    fetchMembers,
    removeMember,

    refetch: fetchWorkspaces,
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// useReferral
// ─────────────────────────────────────────────────────────────────────────────

export function useReferral() {
  const [referral, setReferral] =
    useState(null)

  const [
    referredUsers,
    setReferredUsers,
  ] = useState([])

  const [stats, setStats] =
    useState(null)

  const [loading, setLoading] =
    useState(false)


  const fetch =
    useCallback(
      async () => {
        setLoading(true)

        try {
          const [
            codeRes,
            usersRes,
            statsRes,
          ] = await Promise.allSettled([
            referralAPI.getCode(),
            referralAPI.getUsers(),
            referralAPI.getStats(),
          ])


          if (
            codeRes.status ===
            'fulfilled'
          ) {
            setReferral(
              codeRes.value.data
                ?.data ||
                codeRes.value.data
            )
          }


          if (
            usersRes.status ===
            'fulfilled'
          ) {
            setReferredUsers(
              extractList(
                usersRes.value.data
              )
            )
          }


          if (
            statsRes.status ===
            'fulfilled'
          ) {
            setStats(
              statsRes.value.data
                ?.data ||
                statsRes.value.data
            )
          }

        } finally {
          setLoading(false)
        }
      },
      []
    )


  useEffect(() => {
    fetch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  return {
    referral,
    referredUsers,
    stats,
    loading,

    refetch: fetch,
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// useAuth
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const {
    setAuth,
    logout: storeLogout,
    updateUser,
  } = useAuthStore()

  const {
    setCurrentWorkspace,
    setWorkspaces,
  } = useWorkspaceStore()

  const [loading, setLoading] =
    useState(false)


  // ───────────────────────────────────────────────────────────────────────────
  // Login
  // ───────────────────────────────────────────────────────────────────────────

  const login = async (data) => {
    setLoading(true)

    try {
      const res =
        await authAPI.login(data)

      const {
        user,
        token,
      } = extractAuth(
        res.data
      )


      if (!token) {
        toast.error(
          res.data?.message ||
            'Login failed: no token received'
        )

        return false
      }


      setAuth(
        user,
        token
      )


      // Seed current workspace
      if (
        user?.currentWorkspace
      ) {
        const ws =
          typeof user.currentWorkspace ===
          'object'
            ? user.currentWorkspace
            : {
                _id:
                  user.currentWorkspace,
                name:
                  'My Workspace',
              }

        setCurrentWorkspace(ws)
      }


      toast.success(
        `Welcome back, ${
          user?.name?.split(' ')[0] ||
          'there'
        }! 👋`
      )

      return true

    } catch (e) {
      toast.error(
        e.friendlyMessage ||
          e.response?.data
            ?.message ||
          e.message ||
          'Login failed'
      )

      return false

    } finally {
      setLoading(false)
    }
  }


  // ───────────────────────────────────────────────────────────────────────────
  // Register
  // ───────────────────────────────────────────────────────────────────────────

  const register = async (data) => {
    setLoading(true)

    try {
      const res =
        await authAPI.register(data)

      const {
        user,
        token,
      } = extractAuth(
        res.data
      )


      if (!token) {
        toast.error(
          res.data?.message ||
            'Registration failed'
        )

        return false
      }


      setAuth(
        user,
        token
      )


      if (
        user?.currentWorkspace
      ) {
        const ws =
          typeof user.currentWorkspace ===
          'object'
            ? user.currentWorkspace
            : {
                _id:
                  user.currentWorkspace,
                name:
                  'My Workspace',
              }

        setCurrentWorkspace(ws)
      }


      toast.success(
        'Account created! 🎉'
      )

      return true

    } catch (e) {
      toast.error(
        e.friendlyMessage ||
          e.response?.data
            ?.message ||
          e.message ||
          'Registration failed'
      )

      return false

    } finally {
      setLoading(false)
    }
  }


  // ───────────────────────────────────────────────────────────────────────────
  // Logout
  // ───────────────────────────────────────────────────────────────────────────

  const logout = () => {
    storeLogout()

    setCurrentWorkspace(null)
    setWorkspaces([])

    toast.success(
      'Signed out'
    )
  }


  // ───────────────────────────────────────────────────────────────────────────
  // Profile
  // ───────────────────────────────────────────────────────────────────────────

  const updateProfile =
    async (data) => {
      setLoading(true)

      try {
        updateUser(data)

        toast.success(
          'Profile updated!'
        )

        return true

      } finally {
        setLoading(false)
      }
    }


  return {
    login,
    register,
    logout,
    updateProfile,
    loading,
  }
}