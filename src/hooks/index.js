import { useState, useEffect, useCallback } from 'react'
import {
  authAPI, transactionAPI, categoryAPI,
  statsAPI, workspaceAPI, referralAPI,
} from '../services/api'
import { useAppStore, useAuthStore, useWorkspaceStore } from '../store'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// Extract any array from an API response regardless of shape
function extractList(d) {
  if (Array.isArray(d))                    return d
  if (Array.isArray(d?.data))              return d.data
  if (Array.isArray(d?.transactions))      return d.transactions
  if (Array.isArray(d?.categories))        return d.categories
  if (Array.isArray(d?.members))           return d.members
  if (Array.isArray(d?.users))             return d.users
  if (Array.isArray(d?.data?.transactions))return d.data.transactions
  if (Array.isArray(d?.docs))              return d.docs
  return []
}

function extractPagination(d, len) {
  const p = d?.pagination || d?.meta || d?.data?.pagination
  if (p) return p
  return { page: 1, total: d?.total ?? len, pages: d?.pages ?? 1 }
}

function extractSingle(d) {
  return d?.data?.transaction || d?.transaction ||
         d?.data?.category    || d?.category    ||
         d?.data              || d
}

// Extract user + token from any auth response shape
function extractAuth(d) {
  if (d?.user  && d?.token)            return { user: d.user,      token: d.token }
  if (d?.data?.user && d?.data?.token) return { user: d.data.user, token: d.data.token }
  if (d?.token && d?.data?._id)        return { user: d.data,      token: d.token }
  if (d?.token && d?._id)              { const { token, ...u } = d; return { user: u, token } }
  return { user: null, token: null }
}

// Visual meta for well-known category slugs (used to enrich API response)
const SLUG_META = {
  food         : { icon: '🍔', color: '#f97316' },
  travel       : { icon: '✈️',  color: '#3b82f6' },
  shopping     : { icon: '🛍️', color: '#a855f7' },
  entertainment: { icon: '🎬', color: '#ec4899' },
  healthcare   : { icon: '💊', color: '#ef4444' },
  education    : { icon: '📚', color: '#06b6d4' },
  utilities    : { icon: '⚡', color: '#eab308' },
  rent         : { icon: '🏠', color: '#64748b' },
  salary       : { icon: '💼', color: '#10b981' },
  freelance    : { icon: '💻', color: '#0ea5e9' },
  investment   : { icon: '📈', color: '#8b5cf6' },
  gift         : { icon: '🎁', color: '#f43f5e' },
  other        : { icon: '📦', color: '#94a3b8' },
}

// Add icon + color to a category object from the API
function enrichCat(c) {
  if (!c) return c
  const slug = (c.slug || c.name || '').toLowerCase().replace(/[\s&]/g, '')
  const key  = Object.keys(SLUG_META).find((k) => slug.startsWith(k)) || 'other'
  const meta = SLUG_META[key]
  return {
    ...c,
    icon  : c.icon  || meta.icon,
    color : c.color || meta.color,
  }
}

// Given the raw category field on a transaction and the loaded category list,
// return a full enriched category object for display purposes.
// ⚠️  This is DISPLAY ONLY — never feed the returned object back to the API.
//     The API always wants the plain _id string.
function resolveCatDisplay(raw, catList) {
  if (!raw) return enrichCat({ _id: 'other', name: 'Other', type: 'expense' })

  // Already a populated object from the backend
  if (typeof raw === 'object' && raw._id) return enrichCat(raw)

  // It's a string — find by ObjectId or slug
  const found = catList.find(
    (c) => c._id === raw ||
           c.slug === raw ||
           c.name?.toLowerCase() === raw?.toLowerCase()
  )
  if (found) return enrichCat(found)

  // Unknown — return a placeholder
  return { _id: raw, name: raw, icon: '📦', color: '#94a3b8', type: 'expense' }
}


// ─────────────────────────────────────────────────────────────────────────────
// useCategories  ← fetches REAL categories from /categories/list
//                  so every _id is a genuine MongoDB ObjectId
// ─────────────────────────────────────────────────────────────────────────────
export function useCategories() {
  const {
    categories, setCategories,
    addCategory, updateCategory, deleteCategory,
  } = useAppStore()
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async (force = false) => {
    if (categories.length > 0 && !force) return categories
    setLoading(true)
    try {
      const res  = await categoryAPI.getAll()
      const list = extractList(res.data).map(enrichCat)
      setCategories(list)
      return list
    } catch (e) {
      if (import.meta.env.VITE_DEBUG === 'true') console.error('[categories fetch]', e)
      toast.error(e.friendlyMessage || 'Failed to load categories')
      return categories
    } finally {
      setLoading(false)
    }
  }, [categories, setCategories])

  useEffect(() => { fetch() }, []) // eslint-disable-line

  const create = async (data) => {
    try {
      const res = await categoryAPI.create(data)
      const cat = enrichCat(extractSingle(res.data))
      addCategory(cat)
      toast.success('Category created!')
      return cat
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create category')
      throw e
    }
  }

  const update = async (id, data) => {
    try {
      const res = await categoryAPI.update(id, data)
      updateCategory(id, enrichCat(extractSingle(res.data)))
      toast.success('Category updated!')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update category')
      throw e
    }
  }

  const remove = async (id) => {
    try {
      await categoryAPI.delete(id)
      deleteCategory(id)
      toast.success('Category deleted')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete category')
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
export function useTransactions(initialFilters = {}) {
  const {
    transactions, setTransactions,
    addTransaction, updateTransaction, deleteTransaction,
    categories,
  } = useAppStore()

  const [loading,      setLoading]      = useState(false)
  const [summary,      setSummary]      = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [monthlyData,  setMonthlyData]  = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [pagination,   setPagination]   = useState({ page: 1, total: 0, pages: 1 })

  // Enrich a raw transaction so its category field is a full display object
  const normTx = useCallback(
    (t) => ({ ...t, category: resolveCatDisplay(t.category, categories) }),
    [categories]
  )

  const fetch = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const [txRes, sumRes, monRes, catRes] = await Promise.allSettled([
        transactionAPI.getAll(params),
        statsAPI.summary(),
        statsAPI.monthly(),
        statsAPI.category(),
      ])

      if (txRes.status === 'fulfilled') {
        const raw  = extractList(txRes.value.data)
        const list = raw.map(normTx)
        setTransactions(list)
        setPagination(extractPagination(txRes.value.data, list.length))
      } else {
        toast.error(txRes.reason?.friendlyMessage || 'Failed to load transactions')
      }

      if (sumRes.status === 'fulfilled') {
        const d = sumRes.value.data?.data || sumRes.value.data || {}
        setSummary({
          totalIncome : d.totalIncome  ?? d.income  ?? 0,
          totalExpense: d.totalExpense ?? d.expense ?? 0,
          balance     : d.balance ?? ((d.totalIncome ?? d.income ?? 0) - (d.totalExpense ?? d.expense ?? 0)),
        })
      }

      if (monRes.status === 'fulfilled') {
        const d = monRes.value.data
        setMonthlyData(Array.isArray(d) ? d : (d?.data || []))
      }

      if (catRes.status === 'fulfilled') {
        const d = catRes.value.data
        setCategoryData(Array.isArray(d) ? d : (d?.data || []))
      }
    } finally {
      setLoading(false)
    }
  }, [setTransactions, normTx])

  useEffect(() => { fetch(initialFilters) }, []) // eslint-disable-line

  // ── Refresh only stats (called after mutations) ───────────────────────────
  const refreshStats = async () => {
    try {
      const [s, m, c] = await Promise.allSettled([
        statsAPI.summary(), statsAPI.monthly(), statsAPI.category(),
      ])
      if (s.status === 'fulfilled') {
        const d = s.value.data?.data || s.value.data || {}
        setSummary({
          totalIncome : d.totalIncome  ?? d.income  ?? 0,
          totalExpense: d.totalExpense ?? d.expense ?? 0,
          balance     : d.balance      ?? 0,
        })
      }
      if (m.status === 'fulfilled') {
        const d = m.value.data
        setMonthlyData(Array.isArray(d) ? d : (d?.data || []))
      }
      if (c.status === 'fulfilled') {
        const d = c.value.data
        setCategoryData(Array.isArray(d) ? d : (d?.data || []))
      }
    } catch (_) {}
  }

  // ── create ────────────────────────────────────────────────────────────────
  const create = async (data) => {
    // ✅ Always extract the plain _id string — never send the full object
    const categoryId = typeof data.category === 'object'
      ? data.category?._id
      : data.category

    if (!categoryId) {
      toast.error('Please select a category')
      throw new Error('Category required')
    }

    const payload = {
      type    : data.type,
      amount  : Number(data.amount),
      category: categoryId,   // ← plain MongoDB ObjectId string
      note    : data.note || '',
      date    : data.date,
    }

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('[create transaction payload]', payload)
    }

    try {
      const res   = await transactionAPI.create(payload)
      const newTx = normTx(extractSingle(res.data))
      addTransaction(newTx)
      toast.success('Transaction added! 🎉')
      refreshStats()
      return newTx
    } catch (e) {
      const errs = e.response?.data?.errors
      const msg  = errs?.length
        ? errs.map((err) => `${err.field}: ${err.message}`).join(' · ')
        : e.response?.data?.message || 'Failed to add transaction'
      toast.error(msg)
      throw e
    }
  }

  // ── update ────────────────────────────────────────────────────────────────
  const update = async (id, data) => {
    const categoryId = typeof data.category === 'object'
      ? data.category?._id
      : data.category

    const payload = {
      type    : data.type,
      amount  : Number(data.amount),
      category: categoryId,
      note    : data.note || '',
      date    : data.date,
    }

    try {
      const res = await transactionAPI.update(id, payload)
      const upd = normTx(extractSingle(res.data))
      updateTransaction(id, upd)
      toast.success('Transaction updated!')
      refreshStats()
    } catch (e) {
      const errs = e.response?.data?.errors
      const msg  = errs?.length
        ? errs.map((err) => `${err.field}: ${err.message}`).join(' · ')
        : e.response?.data?.message || 'Failed to update'
      toast.error(msg)
      throw e
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  const remove = async (id) => {
    try {
      await transactionAPI.delete(id)
      deleteTransaction(id)
      toast.success('Transaction deleted')
      refreshStats()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete')
      throw e
    }
  }

  return {
    transactions, loading,
    summary, monthlyData, categoryData, pagination,
    create, update, remove,
    refetch: fetch,
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// useWorkspace
// ─────────────────────────────────────────────────────────────────────────────
export function useWorkspace() {
  const {
    currentWorkspace, workspaces, members,
    setCurrentWorkspace, setWorkspaces, setMembers,
  } = useWorkspaceStore()
  const [loading, setLoading] = useState(false)

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await workspaceAPI.getAll()
      const list = extractList(res.data)
      setWorkspaces(list)
      if (!currentWorkspace && list.length > 0) setCurrentWorkspace(list[0])
    } catch (e) {
      if (import.meta.env.VITE_DEBUG === 'true') console.error('[workspace fetch]', e)
      toast.error(e.friendlyMessage || 'Failed to load workspaces')
    } finally {
      setLoading(false)
    }
  }, [currentWorkspace, setCurrentWorkspace, setWorkspaces])

  useEffect(() => { fetchWorkspaces() }, []) // eslint-disable-line

  const createWorkspace = async (data) => {
    try {
      const res = await workspaceAPI.create(data)
      const ws  = extractSingle(res.data)
      setWorkspaces([...workspaces, ws])
      setCurrentWorkspace(ws)
      toast.success(`Workspace "${ws.name || data.name}" created!`)
      setTimeout(() => window.location.reload(), 300)
      return ws
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create workspace')
      throw e
    }
  }

  const switchWorkspace = async (ws) => {
    try {
      await workspaceAPI.switchTo(ws._id)
    } catch (_) {}
    setCurrentWorkspace(ws)
    toast.success(`Switched to "${ws.name}"`)
    // reload so all data re-fetches with new workspace-id header
    setTimeout(() => window.location.reload(), 300)
  }

  const fetchMembers = async () => {
    try {
      const res = await workspaceAPI.getMembers()
      const m   = extractList(res.data)
      setMembers(m)
      return m
    } catch (e) {
      if (import.meta.env.VITE_DEBUG === 'true') console.error('[members fetch]', e)
    }
  }

  const removeMember = async (userId) => {
    try {
      await workspaceAPI.removeMember(userId)
      setMembers(members.filter((m) => (m._id || m.user?._id) !== userId))
      toast.success('Member removed')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to remove member')
    }
  }

  return {
    currentWorkspace, workspaces, members, loading,
    switchWorkspace, createWorkspace, fetchMembers, removeMember,
    refetch: fetchWorkspaces,
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// useReferral
// ─────────────────────────────────────────────────────────────────────────────
export function useReferral() {
  const [referral,      setReferral]      = useState(null)
  const [referredUsers, setReferredUsers] = useState([])
  const [stats,         setStats]         = useState(null)
  const [loading,       setLoading]       = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [codeRes, usersRes, statsRes] = await Promise.allSettled([
        referralAPI.getCode(),
        referralAPI.getUsers(),
        referralAPI.getStats(),
      ])
      if (codeRes.status  === 'fulfilled') setReferral(codeRes.value.data?.data || codeRes.value.data)
      if (usersRes.status === 'fulfilled') setReferredUsers(extractList(usersRes.value.data))
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || statsRes.value.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, []) // eslint-disable-line

  return { referral, referredUsers, stats, loading, refetch: fetch }
}


// ─────────────────────────────────────────────────────────────────────────────
// useAuth
// ─────────────────────────────────────────────────────────────────────────────
export function useAuth() {
  const { setAuth, logout: storeLogout, updateUser } = useAuthStore()
  const { setCurrentWorkspace, setWorkspaces }       = useWorkspaceStore()
  const [loading, setLoading] = useState(false)

  const login = async (data) => {
    setLoading(true)
    try {
      const res             = await authAPI.login(data)
      const { user, token } = extractAuth(res.data)
      if (!token) { toast.error(res.data?.message || 'Login failed: no token received'); return false }

      setAuth(user, token)

      // Seed the workspace store from the user object so workspace-id
      // is available for the very first API call after login
      if (user?.currentWorkspace) {
        const ws = typeof user.currentWorkspace === 'object'
          ? user.currentWorkspace
          : { _id: user.currentWorkspace, name: 'My Workspace' }
        setCurrentWorkspace(ws)
      }

      toast.success(`Welcome back, ${user?.name?.split(' ')[0] || 'there'}! 👋`)
      return true
    } catch (e) {
      toast.error(e.friendlyMessage || e.response?.data?.message || e.message || 'Login failed')
      return false
    } finally { setLoading(false) }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      const res             = await authAPI.register(data)
      const { user, token } = extractAuth(res.data)
      if (!token) { toast.error(res.data?.message || 'Registration failed'); return false }

      setAuth(user, token)

      if (user?.currentWorkspace) {
        const ws = typeof user.currentWorkspace === 'object'
          ? user.currentWorkspace
          : { _id: user.currentWorkspace, name: 'My Workspace' }
        setCurrentWorkspace(ws)
      }

      toast.success('Account created! 🎉')
      return true
    } catch (e) {
      toast.error(e.friendlyMessage || e.response?.data?.message || e.message || 'Registration failed')
      return false
    } finally { setLoading(false) }
  }

  const logout = () => {
    storeLogout()
    setCurrentWorkspace(null)
    setWorkspaces([])
    toast.success('Signed out')
  }

  const updateProfile = async (data) => {
    setLoading(true)
    try { updateUser(data); toast.success('Profile updated!'); return true }
    finally { setLoading(false) }
  }

  return { login, register, logout, updateProfile, loading }
}