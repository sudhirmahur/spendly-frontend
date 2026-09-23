import { format, isToday, isYesterday } from 'date-fns'
import clsx from 'clsx'
export { clsx }

export const cn = clsx

export const formatCurrency = (amount = 0, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency,
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(amount)

export const formatDate = (date) => {
  const d = new Date(date)
  if (isToday(d))     return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

export const formatShortDate = (date) => format(new Date(date), 'MMM d')

export const groupByDate = (transactions) =>
  transactions.reduce((acc, tx) => {
    const key = formatDate(tx.date)
    if (!acc[key]) acc[key] = []
    acc[key].push(tx)
    return acc
  }, {})

// Extract user+token from any backend auth response shape
export function extractAuth(resData) {
  if (resData?.user && resData?.token)
    return { user: resData.user, token: resData.token }
  if (resData?.data?.user && resData?.data?.token)
    return { user: resData.data.user, token: resData.data.token }
  if (resData?.token && resData?.data?._id)
    return { user: resData.data, token: resData.token }
  if (resData?.token && resData?._id) {
    const { token, ...user } = resData
    return { user, token }
  }
  return { user: null, token: null }
}

// Extract array from any list response shape
export function extractList(resData) {
  if (Array.isArray(resData))                     return resData
  if (Array.isArray(resData?.transactions))        return resData.transactions
  if (Array.isArray(resData?.data))                return resData.data
  if (Array.isArray(resData?.data?.transactions))  return resData.data.transactions
  if (Array.isArray(resData?.docs))                return resData.docs
  return []
}

export function extractPagination(resData, len) {
  const p = resData?.pagination || resData?.meta || resData?.data?.pagination
  if (p) return p
  return { page: 1, total: resData?.total ?? len, pages: resData?.pages ?? 1 }
}

export function extractSingle(resData) {
  return resData?.transaction || resData?.data?.transaction || resData?.data || resData
}

export const CATEGORIES = [
  { _id: 'food',          name: 'Food & Dining',  icon: '🍔', color: '#f97316', type: 'expense' },
  { _id: 'travel',        name: 'Travel',         icon: '✈️',  color: '#3b82f6', type: 'expense' },
  { _id: 'shopping',      name: 'Shopping',       icon: '🛍️', color: '#a855f7', type: 'expense' },
  { _id: 'entertainment', name: 'Entertainment',  icon: '🎬', color: '#ec4899', type: 'expense' },
  { _id: 'healthcare',    name: 'Healthcare',     icon: '💊', color: '#ef4444', type: 'expense' },
  { _id: 'education',     name: 'Education',      icon: '📚', color: '#06b6d4', type: 'expense' },
  { _id: 'utilities',     name: 'Utilities',      icon: '⚡', color: '#eab308', type: 'expense' },
  { _id: 'rent',          name: 'Rent',           icon: '🏠', color: '#64748b', type: 'expense' },
  { _id: 'salary',        name: 'Salary',         icon: '💼', color: '#10b981', type: 'income'  },
  { _id: 'freelance',     name: 'Freelance',      icon: '💻', color: '#0ea5e9', type: 'income'  },
  { _id: 'investment',    name: 'Investment',     icon: '📈', color: '#8b5cf6', type: 'income'  },
  { _id: 'gift',          name: 'Gift',           icon: '🎁', color: '#f43f5e', type: 'income'  },
  { _id: 'other',         name: 'Other',          icon: '📦', color: '#94a3b8', type: 'expense' },
]

export const resolveCat = (catId) =>
  CATEGORIES.find((c) => c._id === catId) ||
  { _id: catId, name: catId, icon: '📦', color: '#94a3b8', type: 'expense' }

export const normaliseTx = (t) => ({
  ...t,
  category: typeof t.category === 'string' ? resolveCat(t.category) : (t.category || resolveCat('other')),
})

