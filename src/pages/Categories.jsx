import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useCategories, useTransactions } from '../hooks'

import {
  Card,
  EmptyState,
  Modal,
  Button,
  Input,
  Select,
  ConfirmDialog,
  Badge,
  Tabs,
  Skeleton,
} from '../components/ui'

import { CategoryDonutChart } from '../components/charts'
import { formatCurrency, cn } from '../utils/helpers'
import {
  ICON_MAP,
  ICON_KEYS,
  CATEGORY_COLORS as COLORS,
} from '../utils/categoryIcons'

import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  RefreshCw,
  Eye,
  LayoutGrid,
  List,
  IndianRupee,
  Receipt,
  PieChart,
} from 'lucide-react'


// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function LucideIcon({ name, size = 18, color, className }) {
  const IconComponent = ICON_MAP[name] || Tag

  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
    />
  )
}


// Currency display using Lucide Indian Rupee icon
function RupeeAmount({
  amount,
  size = 13,
  className = '',
  muted = false,
}) {
  const formatted = formatCurrency(amount)
    .replace(/[₹$€£]/g, '')
    .trim()

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 whitespace-nowrap',
        muted
          ? 'text-slate-400 dark:text-slate-500'
          : 'text-slate-700 dark:text-slate-200',
        className
      )}
    >
      <IndianRupee
        size={size}
        strokeWidth={2.2}
        className="shrink-0"
      />

      <span>{formatted}</span>
    </span>
  )
}


// ─────────────────────────────────────────────────────────────
// Zod Schema
// ─────────────────────────────────────────────────────────────

const catSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50),

  type: z.enum(['income', 'expense']),

  icon: z
    .string()
    .min(1, 'Pick an icon'),

  color: z
    .string()
    .min(1, 'Pick a color'),
})


// ─────────────────────────────────────────────────────────────
// Category Form
// ─────────────────────────────────────────────────────────────

function CategoryForm({
  onSubmit,
  onCancel,
  defaultValues,
  loading,
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(catSchema),

    defaultValues: {
      type: 'expense',
      icon: 'ShoppingCart',
      color: '#3b82f6',
      ...defaultValues,
    },
  })

  const icon = watch('icon')
  const color = watch('color')
  const type = watch('type')
  const name = watch('name')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >

      {/* Name + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        <Input
          label="Category name"
          placeholder="e.g. Food & Dining"
          error={errors.name?.message}
          {...register('name')}
        />

        <Select
          label="Type"
          error={errors.type?.message}
          {...register('type')}
        >
          <option value="expense">
            Expense
          </option>

          <option value="income">
            Income
          </option>
        </Select>

      </div>


      {/* Icon Picker */}
      <div>

        <label className="label mb-1.5 block">
          Icon
        </label>

        <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto pr-1">

          {ICON_KEYS.map((key) => {
            const IconComp = ICON_MAP[key]

            return (
              <button
                key={key}
                type="button"
                title={key}
                onClick={() => setValue('icon', key)}
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150',

                  icon === key
                    ? 'bg-blue-100 dark:bg-blue-500/20 ring-2 ring-blue-500 scale-110'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >

                <IconComp
                  size={16}
                  color={
                    icon === key
                      ? color
                      : undefined
                  }
                  className={
                    icon === key
                      ? ''
                      : 'text-slate-500 dark:text-slate-400'
                  }
                />

              </button>
            )
          })}

        </div>

        {errors.icon && (
          <p className="field-error mt-1">
            ⚠ {errors.icon.message}
          </p>
        )}

      </div>


      {/* Color Picker */}
      <div>

        <label className="label mb-1.5 block">
          Color
        </label>

        <div className="flex flex-wrap gap-2">

          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => setValue('color', c)}
              className={cn(
                'w-8 h-8 rounded-xl transition-all duration-150',
                'hover:scale-105',

                color === c &&
                  'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900 scale-110'
              )}
              style={{
                background: c,
              }}
            />
          ))}

        </div>

      </div>


      {/* Live Preview */}
      <div
        className="
          flex items-center gap-3 p-3 rounded-xl
          border border-slate-200 dark:border-slate-700
          bg-slate-50 dark:bg-slate-800/40
        "
      >

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${color}20`,
          }}
        >
          <LucideIcon
            name={icon}
            size={20}
            color={color}
          />
        </div>

        <div>

          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {name || 'Category Name'}
          </p>

          <Badge
            variant={type === 'income' ? 'green' : 'red'}
            className="mt-0.5 text-[10px]"
          >
            {type}
          </Badge>

        </div>

      </div>


      {/* Submit */}
      <div className="flex gap-2.5">

        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="flex-1"
          loading={loading}
        >
          {defaultValues?._id
            ? 'Update'
            : 'Create'}{' '}
          Category
        </Button>

      </div>

    </form>
  )
}


// ─────────────────────────────────────────────────────────────
// Main Categories Page
// ─────────────────────────────────────────────────────────────

export default function Categories() {

  const {
    categories,
    loading: catLoading,
    create,
    update,
    remove,
    refetch,
  } = useCategories()

  const {
    transactions,
    categoryData,
  } = useTransactions()


  // UI state
  const [tab, setTab] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [search, setSearch] = useState('')

  const [addOpen, setAddOpen] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [viewCat, setViewCat] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const [submitting, setSubmitting] = useState(false)


  // ───────────────────────────────────────────────────────────
  // Breakdown
  // ───────────────────────────────────────────────────────────

  const breakdown = useMemo(() => {

    if (categoryData?.length) {

      return categoryData
        .map((item) => {

          const id =
            item._id ||
            item.category

          const cat =
            categories.find(
              (c) => c._id === id
            ) || {
              _id: id,
              name: item.name || id,
              icon: item.icon || 'Tag',
              color: item.color || '#94a3b8',
            }

          return {
            ...cat,
            amount:
              item.total ||
              item.amount ||
              0,

            count:
              item.count ||
              0,

            percentage:
              item.percentage ||
              0,
          }
        })
        .sort(
          (a, b) =>
            b.amount - a.amount
        )
    }


    const expenses =
      transactions.filter(
        (t) => t.type === 'expense'
      )

    const total =
      expenses.reduce(
        (s, t) => s + t.amount,
        0
      )

    const map = {}


    expenses.forEach((t) => {

      const catObj =
        t.category &&
        typeof t.category === 'object'
          ? t.category
          : null

      const id =
        catObj?._id ||
        (
          typeof t.category === 'string'
            ? t.category
            : null
        ) ||
        'uncategorized'


      if (!map[id]) {

        const fromList =
          categories.find(
            (c) => c._id === id
          )

        const fromEmbedded =
          catObj
            ? {
                _id: catObj._id,
                name: catObj.name,
                icon:
                  catObj.icon ||
                  'Tag',
                color:
                  catObj.color ||
                  '#94a3b8',
                type:
                  catObj.type ||
                  'expense',
              }
            : null

        const fallback = {
          _id: id,
          name: 'Uncategorized',
          icon: 'Tag',
          color: '#94a3b8',
          type: 'expense',
        }

        map[id] = {
          ...(fromList ||
            fromEmbedded ||
            fallback),

          amount: 0,
          count: 0,
        }
      }


      map[id].amount += t.amount
      map[id].count++
    })


    return Object.values(map)
      .map((c) => ({
        ...c,

        percentage: total
          ? Math.round(
              (c.amount / total) *
                100
            )
          : 0,
      }))
      .sort(
        (a, b) =>
          b.amount - a.amount
      )

  }, [
    categoryData,
    transactions,
    categories,
  ])


  // ───────────────────────────────────────────────────────────
  // All categories
  // ───────────────────────────────────────────────────────────

  const allCategories = useMemo(() => {

    if (categories.length > 0) {
      return categories
    }


    const seen = new Set()
    const derived = []


    transactions.forEach((t) => {

      const catObj =
        t.category &&
        typeof t.category === 'object'
          ? t.category
          : null


      if (
        catObj &&
        !seen.has(catObj._id)
      ) {

        seen.add(catObj._id)

        derived.push({
          _id: catObj._id,
          name: catObj.name,
          type:
            catObj.type ||
            t.type,
          icon:
            catObj.icon ||
            'Tag',
          color:
            catObj.color ||
            '#94a3b8',
        })
      }

    })


    return derived

  }, [
    categories,
    transactions,
  ])


  // ───────────────────────────────────────────────────────────
  // Filtered categories
  // ───────────────────────────────────────────────────────────

  const filtered = useMemo(
    () =>
      allCategories
        .filter((c) =>
          tab === 'all'
            ? true
            : c.type === tab
        )
        .filter((c) =>
          search
            ? c.name
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
            : true
        ),

    [
      allCategories,
      tab,
      search,
    ]
  )


  // ───────────────────────────────────────────────────────────
  // CRUD
  // ───────────────────────────────────────────────────────────

  const handleCreate = async (d) => {

    setSubmitting(true)

    try {
      await create(d)
      setAddOpen(false)
    } finally {
      setSubmitting(false)
    }
  }


  const handleUpdate = async (d) => {

    setSubmitting(true)

    try {
      await update(
        editCat._id,
        d
      )

      setEditCat(null)

    } finally {
      setSubmitting(false)
    }
  }


  const handleDelete = async () => {

    setSubmitting(true)

    try {
      await remove(deleteId)
      setDeleteId(null)
    } finally {
      setSubmitting(false)
    }
  }


  // ───────────────────────────────────────────────────────────
  // Tabs
  // ───────────────────────────────────────────────────────────

  const CAT_TABS = [
    {
      value: 'all',
      label: 'All',
      count: allCategories.length,
    },

    {
      value: 'expense',
      label: 'Expense',
      count:
        allCategories.filter(
          (c) => c.type === 'expense'
        ).length,
    },

    {
      value: 'income',
      label: 'Income',
      count:
        allCategories.filter(
          (c) => c.type === 'income'
        ).length,
    },
  ]


  // ───────────────────────────────────────────────────────────
  // Empty state
  // ───────────────────────────────────────────────────────────

  const emptyState = (
    <EmptyState
      icon={
        <Tag
          size={32}
          className="text-slate-300 dark:text-slate-600"
        />
      }
      title="No categories found"
      description={
        search
          ? 'No categories match your search'
          : 'Create your first category to organize transactions'
      }
      action={
        <Button
          size="sm"
          icon={<Plus size={14} />}
          onClick={() =>
            setAddOpen(true)
          }
        >
          Create category
        </Button>
      }
    />
  )


  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="page-header animate-in">

        <div>

          <h1 className="page-title">
            Categories
          </h1>

          <p className="page-sub">
            {allCategories.length}{' '}
            categories · Organize your
            transactions
          </p>

        </div>


        <div className="flex items-center gap-2 flex-wrap">

          {/* Grid / Table */}
          <div
            className="
              flex items-center gap-1 p-1
              bg-slate-100 dark:bg-slate-800
              rounded-xl
            "
          >

            <button
              onClick={() =>
                setViewMode('grid')
              }
              title="Grid view"
              className={cn(
                'p-1.5 rounded-lg transition-all',

                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <LayoutGrid size={14} />
            </button>


            <button
              onClick={() =>
                setViewMode('table')
              }
              title="Table view"
              className={cn(
                'p-1.5 rounded-lg transition-all',

                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <List size={14} />
            </button>

          </div>


          <Button
            variant="secondary"
            size="sm"
            icon={
              <RefreshCw size={13} />
            }
            onClick={refetch}
          >
            Refresh
          </Button>


          <Button
            size="sm"
            icon={<Plus size={14} />}
            onClick={() =>
              setAddOpen(true)
            }
          >
            Add category
          </Button>

        </div>

      </div>


      {/* Charts */}
      {breakdown.length > 0 && (

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in stagger-1">

          <Card>

            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Expense Distribution
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
              Donut chart by category
            </p>

            <CategoryDonutChart
              data={breakdown}
            />

          </Card>


          <Card>

            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
              Top Categories by Spend
            </h2>

            <div className="space-y-3">

              {breakdown
                .slice(0, 6)
                .map((cat, i) => (

                  <div
                    key={
                      cat._id || i
                    }
                  >

                    <div className="flex items-center justify-between mb-1">

                      <div className="flex items-center gap-2 min-w-0">

                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background:
                              `${cat.color}20`,
                          }}
                        >
                          <LucideIcon
                            name={cat.icon}
                            size={13}
                            color={cat.color}
                          />
                        </span>

                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                          {cat.name}
                        </span>

                        <span className="text-[10px] text-slate-400 shrink-0">
                          ({cat.count})
                        </span>

                      </div>


                      <RupeeAmount
                        amount={cat.amount}
                        size={12}
                        className="text-xs font-semibold font-mono ml-2"
                      />

                    </div>


                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width:
                            `${cat.percentage}%`,
                          background:
                            cat.color,
                        }}
                      />

                    </div>

                  </div>

                ))}

            </div>

          </Card>

        </div>

      )}


      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-in stagger-2">

        <Tabs
          tabs={CAT_TABS}
          active={tab}
          onChange={setTab}
        />


        <div className="relative flex-1 sm:max-w-xs">

          <Tag
            size={13}
            className="
              absolute left-3 top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            className="input pl-8"
            placeholder="Search categories…"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>


      {/* Loading */}
      {catLoading && (

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">

          {[...Array(8)].map(
            (_, i) => (
              <Card
                key={i}
                className="!p-4 space-y-2"
              >
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-3 w-20" />
              </Card>
            )
          )}

        </div>

      )}


      {/* Grid View */}
      {!catLoading &&
        viewMode === 'grid' && (

          filtered.length === 0
            ? emptyState
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-in stagger-3">

                {filtered.map((cat) => {

                  const bd =
                    breakdown.find(
                      (b) =>
                        b._id ===
                        cat._id
                    )

                  return (

                    <div
                      key={cat._id}
                      className="card card-hover group relative p-4"
                    >

                      {/* Icon + Actions */}
                      <div className="flex items-start justify-between mb-3">

                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{
                            background:
                              `${cat.color || '#94a3b8'}18`,
                          }}
                        >
                          <LucideIcon
                            name={
                              cat.icon ||
                              'Tag'
                            }
                            size={22}
                            color={
                              cat.color ||
                              '#94a3b8'
                            }
                          />
                        </div>


                        <div className="flex items-center gap-1">

                          <button
                            onClick={() =>
                              setViewCat(cat)
                            }
                            title="View"
                            className="
                              p-1.5 rounded-lg
                              text-slate-400
                              dark:text-slate-500
                              hover:text-blue-600
                              dark:hover:text-blue-400
                              hover:bg-blue-50
                              dark:hover:bg-blue-500/10
                              transition-all
                            "
                          >
                            <Eye
                              size={13}
                              strokeWidth={2}
                            />
                          </button>


                          <button
                            onClick={() =>
                              setEditCat(cat)
                            }
                            title="Edit"
                            className="
                              p-1.5 rounded-lg
                              text-slate-400
                              dark:text-slate-500
                              hover:text-amber-600
                              dark:hover:text-amber-400
                              hover:bg-amber-50
                              dark:hover:bg-amber-500/10
                              transition-all
                            "
                          >
                            <Pencil
                              size={13}
                              strokeWidth={2}
                            />
                          </button>


                          <button
                            onClick={() =>
                              setDeleteId(
                                cat._id
                              )
                            }
                            title="Delete"
                            className="
                              p-1.5 rounded-lg
                              text-slate-400
                              dark:text-slate-500
                              hover:text-red-600
                              dark:hover:text-red-400
                              hover:bg-red-50
                              dark:hover:bg-red-500/10
                              transition-all
                            "
                          >
                            <Trash2
                              size={13}
                              strokeWidth={2}
                            />
                          </button>

                        </div>

                      </div>


                      {/* Name */}
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">
                        {cat.name}
                      </p>


                      {/* Badge + Amount */}
                      <div className="flex items-center justify-between mt-1 gap-2">

                        <Badge
                          variant={
                            cat.type ===
                            'income'
                              ? 'green'
                              : 'red'
                          }
                          className="text-[10px]"
                        >
                          {cat.type}
                        </Badge>


                        {bd && (
                          <RupeeAmount
                            amount={bd.amount}
                            size={11}
                            className="text-xs font-mono"
                            muted
                          />
                        )}

                      </div>


                      {/* Spend bar */}
                      {bd && (

                        <div className="mt-2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width:
                                `${bd.percentage}%`,
                              background:
                                cat.color ||
                                '#94a3b8',
                            }}
                          />

                        </div>

                      )}


                      {/* Transaction count */}
                      {bd && (

                        <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                          {bd.count}{' '}
                          transaction
                          {bd.count !== 1
                            ? 's'
                            : ''}
                        </p>

                      )}

                    </div>

                  )
                })}

              </div>
            )
        )}


      {/* Table View */}
      {!catLoading &&
        viewMode === 'table' && (

          filtered.length === 0
            ? emptyState
            : (

              <div className="animate-in stagger-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">

                {/* Header */}
                <div
                  className="
                    grid
                    grid-cols-[2fr_1fr_1fr_1fr_120px]
                    gap-4
                    px-5 py-3
                    bg-slate-50
                    dark:bg-slate-800/60
                    border-b
                    border-slate-200
                    dark:border-slate-700/60
                  "
                >

                  {[
                    'Category',
                    'Type',
                    'Transactions',
                    'Total Spend',
                    'Actions',
                  ].map((h) => (

                    <span
                      key={h}
                      className="
                        text-xs font-semibold
                        text-slate-500
                        dark:text-slate-400
                        uppercase
                        tracking-wider
                      "
                    >
                      {h}
                    </span>

                  ))}

                </div>


                {/* Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">

                  {filtered.map((cat) => {

                    const bd =
                      breakdown.find(
                        (b) =>
                          b._id ===
                          cat._id
                      )

                    return (

                      <div
                        key={cat._id}
                        className="
                          grid
                          grid-cols-[2fr_1fr_1fr_1fr_120px]
                          gap-4
                          px-5 py-3.5
                          items-center
                          bg-white
                          dark:bg-slate-900/40
                          hover:bg-slate-50
                          dark:hover:bg-slate-800/40
                          transition-colors
                        "
                      >

                        {/* Category */}
                        <div className="flex items-center gap-3 min-w-0">

                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background:
                                `${cat.color || '#94a3b8'}18`,
                            }}
                          >
                            <LucideIcon
                              name={
                                cat.icon ||
                                'Tag'
                              }
                              size={18}
                              color={
                                cat.color ||
                                '#94a3b8'
                              }
                            />
                          </div>


                          <div className="min-w-0">

                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                              {cat.name}
                            </p>


                            {bd && (

                              <div className="flex items-center gap-1.5 mt-0.5">

                                <div className="h-1 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width:
                                        `${bd.percentage}%`,
                                      background:
                                        cat.color,
                                    }}
                                  />

                                </div>

                                <span className="text-[10px] text-slate-400">
                                  {bd.percentage}%
                                </span>

                              </div>

                            )}

                          </div>

                        </div>


                        {/* Type */}
                        <div>

                          <Badge
                            variant={
                              cat.type ===
                              'income'
                                ? 'green'
                                : 'red'
                            }
                            className="text-[10px]"
                          >
                            {cat.type}
                          </Badge>

                        </div>


                        {/* Transactions */}
                        <div className="text-sm text-slate-500 dark:text-slate-400">

                          {bd ? (

                            <span>

                              {bd.count}{' '}

                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                txn
                                {bd.count !== 1
                                  ? 's'
                                  : ''}
                              </span>

                            </span>

                          ) : (

                            <span className="text-slate-300 dark:text-slate-600">
                              —
                            </span>

                          )}

                        </div>


                        {/* Total Spend */}
                        <div>

                          {bd ? (

                            <RupeeAmount
                              amount={
                                bd.amount
                              }
                              size={13}
                              className="text-sm font-semibold font-mono"
                            />

                          ) : (

                            <span className="text-slate-300 dark:text-slate-600 font-normal">
                              —
                            </span>

                          )}

                        </div>


                        {/* Actions */}
                        <div className="flex items-center gap-1">

                          <button
                            onClick={() =>
                              setViewCat(cat)
                            }
                            title="View details"
                            className="
                              p-2 rounded-lg
                              text-slate-400
                              dark:text-slate-500
                              hover:text-blue-600
                              dark:hover:text-blue-400
                              hover:bg-blue-50
                              dark:hover:bg-blue-500/10
                              transition-all
                            "
                          >
                            <Eye
                              size={14}
                              strokeWidth={2}
                            />
                          </button>


                          <button
                            onClick={() =>
                              setEditCat(cat)
                            }
                            title="Edit"
                            className="
                              p-2 rounded-lg
                              text-slate-400
                              dark:text-slate-500
                              hover:text-amber-600
                              dark:hover:text-amber-400
                              hover:bg-amber-50
                              dark:hover:bg-amber-500/10
                              transition-all
                            "
                          >
                            <Pencil
                              size={14}
                              strokeWidth={2}
                            />
                          </button>


                          <button
                            onClick={() =>
                              setDeleteId(
                                cat._id
                              )
                            }
                            title="Delete"
                            className="
                              p-2 rounded-lg
                              text-slate-400
                              dark:text-slate-500
                              hover:text-red-600
                              dark:hover:text-red-400
                              hover:bg-red-50
                              dark:hover:bg-red-500/10
                              transition-all
                            "
                          >
                            <Trash2
                              size={14}
                              strokeWidth={2}
                            />
                          </button>

                        </div>

                      </div>

                    )
                  })}

                </div>


                {/* Footer */}
                <div
                  className="
                    px-5 py-3
                    bg-slate-50
                    dark:bg-slate-800/60
                    border-t
                    border-slate-200
                    dark:border-slate-700/60
                    flex items-center
                    justify-between
                    gap-3
                  "
                >

                  <p className="text-xs text-slate-400">

                    Showing{' '}

                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {filtered.length}
                    </span>

                    {' '}of{' '}

                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {allCategories.length}
                    </span>

                    {' '}categories

                  </p>


                  <p className="text-xs font-mono text-slate-400 flex items-center gap-1">

                    <span>Total:</span>

                    <RupeeAmount
                      amount={breakdown.reduce(
                        (s, b) =>
                          s +
                          b.amount,
                        0
                      )}
                      size={11}
                      className="font-semibold text-slate-600 dark:text-slate-300"
                    />

                  </p>

                </div>

              </div>

            )
        )}


      {/* ─────────────────────────────────────────────────────
          Modals
      ───────────────────────────────────────────────────── */}

      {/* Create */}
      <Modal
        open={addOpen}
        onClose={() =>
          setAddOpen(false)
        }
        title="New Category"
        size="lg"
      >

        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() =>
            setAddOpen(false)
          }
          loading={submitting}
        />

      </Modal>


      {/* Edit */}
      <Modal
        open={!!editCat}
        onClose={() =>
          setEditCat(null)
        }
        title="Edit Category"
        size="lg"
      >

        {editCat && (

          <CategoryForm
            onSubmit={handleUpdate}
            onCancel={() =>
              setEditCat(null)
            }
            defaultValues={editCat}
            loading={submitting}
          />

        )}

      </Modal>


      {/* View Details */}
      <Modal
        open={!!viewCat}
        onClose={() =>
          setViewCat(null)
        }
        title="Category Details"
        size="md"
      >

        {viewCat &&
          (() => {

            const bd =
              breakdown.find(
                (b) =>
                  b._id ===
                  viewCat._id
              )

            return (

              <div className="space-y-4">

                {/* Header */}
                <div
                  className="
                    flex items-center gap-4
                    p-4 rounded-2xl
                    border border-slate-200
                    dark:border-slate-700
                    bg-slate-50
                    dark:bg-slate-800/40
                  "
                >

                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        `${viewCat.color || '#94a3b8'}20`,
                    }}
                  >

                    <LucideIcon
                      name={
                        viewCat.icon ||
                        'Tag'
                      }
                      size={28}
                      color={
                        viewCat.color ||
                        '#94a3b8'
                      }
                    />

                  </div>


                  <div>

                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {viewCat.name}
                    </h3>

                    <Badge
                      variant={
                        viewCat.type ===
                        'income'
                          ? 'green'
                          : 'red'
                      }
                      className="mt-1 text-xs"
                    >
                      {viewCat.type}
                    </Badge>

                  </div>

                </div>


                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">

                  {[
                    {
                      label:
                        'Total Spend',

                      value:
                        bd
                          ? bd.amount
                          : null,

                      icon: (
                        <IndianRupee
                          size={14}
                          strokeWidth={2.2}
                        />
                      ),

                      isCurrency: true,
                    },

                    {
                      label:
                        'Transactions',

                      value:
                        bd
                          ? bd.count
                          : '—',

                      icon: (
                        <Receipt
                          size={14}
                        />
                      ),
                    },

                    {
                      label: 'Share',

                      value:
                        bd
                          ? `${bd.percentage}%`
                          : '—',

                      icon: (
                        <PieChart
                          size={14}
                        />
                      ),
                    },
                  ].map((stat) => (

                    <div
                      key={stat.label}
                      className="
                        p-3 rounded-xl
                        bg-slate-50
                        dark:bg-slate-800/40
                        border border-slate-200
                        dark:border-slate-700
                        text-center
                      "
                    >

                      <div className="flex justify-center mb-1 text-slate-400 dark:text-slate-500">
                        {stat.icon}
                      </div>


                      <p className="text-base font-bold font-mono text-slate-700 dark:text-slate-200">

                        {stat.isCurrency &&
                        stat.value !== null ? (

                          <RupeeAmount
                            amount={
                              stat.value
                            }
                            size={13}
                            className="justify-center"
                          />

                        ) : (
                          stat.value
                        )}

                      </p>


                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {stat.label}
                      </p>

                    </div>

                  ))}

                </div>


                {/* Spend share */}
                {bd && (

                  <div>

                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">

                      <span>
                        Spend share of all expenses
                      </span>

                      <span className="font-mono font-semibold">
                        {bd.percentage}%
                      </span>

                    </div>


                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width:
                            `${bd.percentage}%`,
                          background:
                            viewCat.color ||
                            '#94a3b8',
                        }}
                      />

                    </div>

                  </div>

                )}


                {/* Color */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">

                  <div
                    className="
                      w-5 h-5 rounded-md
                      flex-shrink-0
                      border
                      border-slate-200
                      dark:border-slate-700
                    "
                    style={{
                      background:
                        viewCat.color ||
                        '#94a3b8',
                    }}
                  />

                  <span className="font-mono">
                    {viewCat.color ||
                      '#94a3b8'}
                  </span>

                </div>


                {/* Edit / Delete */}
                <div className="flex gap-2.5 pt-1">

                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setViewCat(null)
                      setEditCat(
                        viewCat
                      )
                    }}
                  >
                    <Pencil
                      size={13}
                      className="mr-1.5 inline"
                    />
                    Edit
                  </Button>


                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => {
                      setViewCat(null)
                      setDeleteId(
                        viewCat._id
                      )
                    }}
                  >
                    <Trash2
                      size={13}
                      className="mr-1.5 inline"
                    />
                    Delete
                  </Button>

                </div>

              </div>

            )
          })()}

      </Modal>


      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() =>
          setDeleteId(null)
        }
        onConfirm={handleDelete}
        title="Delete Category"
        description="This category will be removed. Existing transactions won't be affected."
        loading={submitting}
      />

    </div>
  )
}