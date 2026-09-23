import { useState, useMemo, useCallback, useRef } from 'react'
import { useTransactions, useCategories } from '../hooks'
import {
  Card, Modal, EmptyState, Button, Toggle, Pagination,
  ConfirmDialog, Tabs, SkeletonRow,
} from '../components/ui'
import TransactionRow from '../components/layout/TransactionRow'
import TransactionForm from '../components/TransactionForm'
import { formatCurrency, cn } from '../utils/helpers'
import { CategoryIcon, ICON_MAP } from '../utils/categoryIcons'
import {
  Search,
  Plus,
  X,
  Download,
  Trash2,
  List,
  Calendar,
  RefreshCw,
  Filter,
  Eye,
  IndianRupee,
} from 'lucide-react'
import { format } from 'date-fns'


// ─── constants ───────────────────────────────────────────────────────────────

const SORT_OPTS = [
  { value: 'latest',  label: 'Latest first' },
  { value: 'oldest',  label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest',  label: 'Lowest amount' },
]

const LIMIT_OPTS = [10, 20, 50, 100]


// ─── Currency component ──────────────────────────────────────────────────────

function RupeeAmount({ amount, prefix = '' }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {prefix}
      <IndianRupee
        size={13}
        strokeWidth={2.2}
        className="shrink-0"
      />
      <span>{formatCurrency(amount).replace(/[₹$€£]/g, '').trim()}</span>
    </span>
  )
}


// ─── View modal (read-only detail) ───────────────────────────────────────────

function TransactionDetail({ tx, onClose }) {
  if (!tx) return null

  const cat = tx.category || {}
  const label = tx.note || tx.title || cat.name || 'Transaction'

  return (
    <div className="space-y-4 pt-1">

      {/* Icon + label */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${cat.color || '#94a3b8'}18` }}
        >
          <CategoryIcon
            icon={cat.icon}
            color={cat.color || '#94a3b8'}
            size={22}
          />
        </div>

        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {label}
          </p>

          <p className="text-xs text-slate-400">
            {cat.name || 'Uncategorized'}
          </p>
        </div>
      </div>


      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">

        {[
          {
            label: 'Amount',
            value: (
              <RupeeAmount
                amount={tx.amount}
                prefix={tx.type === 'income' ? '+' : '-'}
              />
            ),
            accent:
              tx.type === 'income'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400',
          },

          {
            label: 'Type',
            value: tx.type,
          },

          {
            label: 'Date',
            value: format(new Date(tx.date), 'MMM d, yyyy'),
          },

          {
            label: 'Category',
            value: cat.name || '—',
          },

        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5"
          >
            <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-0.5">
              {label}
            </p>

            <p
              className={cn(
                'text-sm font-medium capitalize inline-flex items-center',
                accent || 'text-slate-700 dark:text-slate-200'
              )}
            >
              {value}
            </p>
          </div>
        ))}

      </div>


      {tx.note && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-0.5">
            Note
          </p>

          <p className="text-sm text-slate-700 dark:text-slate-200">
            {tx.note}
          </p>
        </div>
      )}


      <div className="flex justify-end pt-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
        >
          Close
        </Button>
      </div>

    </div>
  )
}


// ─── Table header ─────────────────────────────────────────────────────────────

function TableHead({ allSelected, onSelectAll }) {

  const cols = [
    '',
    'Icon',
    'Note / Title',
    'Category',
    'Date',
    'Type',
    'Amount',
    'Actions',
  ]

  return (
    <thead>

      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30">

        <th className="w-10 pl-4 py-2.5">

          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600"
          />

        </th>

        <th className="w-12 py-2.5 pl-3" />

        {['Note / Title', 'Category', 'Date', 'Type'].map((h, i) => (

          <th
            key={h}
            className={cn(
              'py-2.5 px-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400',
              i === 1 && 'hidden sm:table-cell',
              i === 2 && 'hidden md:table-cell',
              i === 3 && 'hidden sm:table-cell',
            )}
          >
            {h}
          </th>

        ))}

        <th className="py-2.5 px-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Amount
        </th>

        <th className="py-2.5 pr-4 pl-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Actions
        </th>

      </tr>

    </thead>
  )
}


// ─── Main page ────────────────────────────────────────────────────────────────

export default function Transactions() {

  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    search: '',
    sort: 'latest',
    page: 1,
    limit: 20,
  })

  const [showF, setShowF] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [addOpen, setAddOpen] = useState(false)
  const [viewTx, setViewTx] = useState(null)
  const [editTx, setEditTx] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [bulkDel, setBulkDel] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const searchRef = useRef()


  const {
    transactions,
    loading,
    summary,
    pagination,
    create,
    update,
    remove,
    refetch,
  } = useTransactions(filters)

  const { categories } = useCategories()


  const totalIncome = summary?.totalIncome || 0
  const totalExpense = summary?.totalExpense || 0

  const hasFilters =
    filters.type ||
    filters.category ||
    filters.startDate ||
    filters.endDate ||
    filters.search


  // ── filter helpers ──────────────────────────────────────────────────────────

  const apply = useCallback(
    (newF) => {
      const merged = {
        ...filters,
        ...newF,
        page: 1,
      }

      setFilters(merged)
      refetch(merged)
    },
    [filters, refetch]
  )


  const clearFilters = () => {

    const r = {
      type: '',
      category: '',
      startDate: '',
      endDate: '',
      search: '',
      sort: 'latest',
      page: 1,
      limit: filters.limit,
    }

    setFilters(r)
    refetch(r)
  }


  const changePage = (p) => {

    const f = {
      ...filters,
      page: p,
    }

    setFilters(f)
    refetch(f)
  }


  // ── grouped view ────────────────────────────────────────────────────────────

  const grouped = useMemo(
    () =>
      transactions.reduce((acc, tx) => {

        const key = format(
          new Date(tx.date),
          'EEE, MMM d yyyy'
        )

        if (!acc[key]) acc[key] = []

        acc[key].push(tx)

        return acc

      }, {}),
    [transactions]
  )


  // ── selection ───────────────────────────────────────────────────────────────

  const toggleSelect = (id) =>
    setSelected((s) => {

      const n = new Set(s)

      n.has(id)
        ? n.delete(id)
        : n.add(id)

      return n
    })


  const selectAll = () =>
    setSelected(
      new Set(
        transactions.map((t) => t._id)
      )
    )


  const clearSelected = () =>
    setSelected(new Set())


  const allSelected =
    transactions.length > 0 &&
    selected.size === transactions.length


  // ── CRUD ────────────────────────────────────────────────────────────────────

  const handleAdd = async (d) => {

    setSubmitting(true)

    try {
      await create(d)
      setAddOpen(false)
    } finally {
      setSubmitting(false)
    }
  }


  const handleEdit = async (d) => {

    setSubmitting(true)

    try {
      await update(editTx._id, d)
      setEditTx(null)
    } finally {
      setSubmitting(false)
    }
  }


  const handleDel = async () => {

    await remove(deleteId)
    setDeleteId(null)
  }


  const handleBulkDelete = async () => {

    for (const id of selected) {
      try {
        await remove(id)
      } catch {}
    }

    clearSelected()
    setBulkDel(false)
  }


  // ── CSV export ──────────────────────────────────────────────────────────────

  const exportCSV = () => {

    const rows = [
      ['Date', 'Type', 'Category', 'Note', 'Amount'],
    ]

    transactions.forEach((t) => {

      rows.push([
        format(new Date(t.date), 'yyyy-MM-dd'),
        t.type,
        t.category?.name || t.category,
        t.note || '',
        t.amount,
      ])

    })

    const csv = rows
      .map((r) => r.join(','))
      .join('\n')

    const a = document.createElement('a')

    a.href =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(csv)

    a.download =
      `transactions-${format(
        new Date(),
        'yyyy-MM-dd'
      )}.csv`

    a.click()
  }


  const VIEW_TABS = [
    {
      value: 'list',
      label: 'List',
      icon: <List size={13} />,
    },
    {
      value: 'grouped',
      label: 'Grouped',
      icon: <Calendar size={13} />,
    },
  ]


  // ── reusable table renderer ─────────────────────────────────────────────────

  const renderTable = (
    rows,
    showDateGroupHeader = false,
    dateLabel = ''
  ) => (

    <Card className="!p-0 overflow-hidden">

      {showDateGroupHeader && (

        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">

          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {dateLabel}
          </p>

          <div className="flex items-center gap-3 text-[10px] font-mono">

            {rows.some(
              (t) => t.type === 'income'
            ) && (

              <span className="text-emerald-500 inline-flex items-center gap-0.5">

                +
                <IndianRupee
                  size={11}
                  strokeWidth={2.2}
                />

                {formatCurrency(
                  rows
                    .filter(
                      (t) => t.type === 'income'
                    )
                    .reduce(
                      (s, t) => s + t.amount,
                      0
                    )
                ).replace(/[₹$€£]/g, '').trim()}

              </span>

            )}


            {rows.some(
              (t) => t.type === 'expense'
            ) && (

              <span className="text-red-500 inline-flex items-center gap-0.5">

                -
                <IndianRupee
                  size={11}
                  strokeWidth={2.2}
                />

                {formatCurrency(
                  rows
                    .filter(
                      (t) => t.type === 'expense'
                    )
                    .reduce(
                      (s, t) => s + t.amount,
                      0
                    )
                ).replace(/[₹$€£]/g, '').trim()}

              </span>

            )}

          </div>

        </div>
      )}


      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <TableHead
            allSelected={allSelected}
            onSelectAll={
              allSelected
                ? clearSelected
                : selectAll
            }
          />

          <tbody>

            {rows.map((tx) => (

              <TransactionRow
                key={tx._id}
                tx={tx}
                onView={setViewTx}
                onEdit={setEditTx}
                onDelete={setDeleteId}
                selected={selected.has(tx._id)}
                onSelect={toggleSelect}
              />

            ))}

          </tbody>

        </table>

      </div>

    </Card>
  )


  // ── render ──────────────────────────────────────────────────────────────────

  return (

    <div className="space-y-5">

      {/* Header */}

      <div className="page-header animate-in">

        <div>

          <h1 className="page-title">
            Transactions
          </h1>

          <p className="page-sub">
            {pagination.total} total records in workspace
          </p>

        </div>


        <div className="flex items-center gap-2 flex-wrap">

          {selected.size > 0 && (

            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={() => setBulkDel(true)}
            >
              Delete {selected.size}
            </Button>

          )}


          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={13} />}
            onClick={exportCSV}
          >
            Export
          </Button>


          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={13} />}
            onClick={() => refetch(filters)}
          >
            Refresh
          </Button>


          <Button
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setAddOpen(true)}
          >
            Add
          </Button>

        </div>

      </div>


      {/* Summary strip */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in stagger-1">

        {[
          {
            label: 'Income',
            value: totalIncome,
            color:
              'text-emerald-600 dark:text-emerald-400',
            rupee: true,
          },

          {
            label: 'Expenses',
            value: totalExpense,
            color:
              'text-red-600 dark:text-red-400',
            rupee: true,
          },

          {
            label: 'Net',
            value:
              totalIncome - totalExpense,
            color:
              totalIncome - totalExpense >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-red-600 dark:text-red-400',
            rupee: true,
          },

          {
            label: 'Records',
            value:
              pagination.total ||
              transactions.length,
            color:
              'text-slate-700 dark:text-slate-300',
            rupee: false,
          },

        ].map(
          ({
            label,
            value,
            color,
            rupee,
          }) => (

            <Card
              key={label}
              className="!p-4"
            >

              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                {label}
              </p>


              <p
                className={cn(
                  'text-lg font-bold font-mono mt-0.5',
                  color
                )}
              >

                {rupee ? (

                  <span className="inline-flex items-center gap-1">

                    <IndianRupee
                      size={16}
                      strokeWidth={2.2}
                    />

                    {formatCurrency(value)
                      .replace(/[₹$€£]/g, '')
                      .trim()}

                  </span>

                ) : (
                  value
                )}

              </p>

            </Card>

          )
        )}

      </div>


      {/* Filters + search */}

      <Card className="!p-4 space-y-3 animate-in stagger-2">

        <div className="flex gap-2 flex-wrap">

          {/* Search */}

          <div className="flex-1 min-w-48 relative">

            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              ref={searchRef}
              className="input pl-9 pr-9"
              placeholder="Search by note or keyword…"
              value={filters.search}
              onChange={(e) =>
                apply({
                  search: e.target.value,
                })
              }
            />

            {filters.search && (

              <button
                onClick={() =>
                  apply({ search: '' })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>

            )}

          </div>


          {/* Filter toggle */}

          <button
            onClick={() => setShowF(!showF)}
            className={cn(
              'btn btn-sm flex items-center gap-1.5',

              showF || hasFilters
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-none'
                : 'btn-secondary'
            )}
          >

            <Filter size={13} />

            <span className="hidden sm:inline">
              Filters
            </span>

            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}

          </button>


          {/* Sort */}

          <select
            className="input-sm w-auto"
            value={filters.sort}
            onChange={(e) =>
              apply({
                sort: e.target.value,
              })
            }
          >

            {SORT_OPTS.map((o) => (
              <option
                key={o.value}
                value={o.value}
              >
                {o.label}
              </option>
            ))}

          </select>


          {/* Per page */}

          <select
            className="input-sm w-auto"
            value={filters.limit}
            onChange={(e) => {

              const f = {
                ...filters,
                limit: Number(
                  e.target.value
                ),
                page: 1,
              }

              setFilters(f)
              refetch(f)

            }}
          >

            {LIMIT_OPTS.map((n) => (
              <option
                key={n}
                value={n}
              >
                {n} / page
              </option>
            ))}

          </select>


          {hasFilters && (

            <button
              onClick={clearFilters}
              className="btn-ghost btn-sm flex items-center gap-1 text-slate-500"
            >
              <X size={13} />
              Clear
            </button>

          )}

        </div>


        {/* Expanded filters */}

        {showF && (

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in">

            <div>

              <label className="label">
                Type
              </label>

              <Toggle
                value={filters.type || 'all'}
                onChange={(v) =>
                  apply({
                    type:
                      v === 'all'
                        ? ''
                        : v,
                  })
                }
                options={[
                  {
                    value: 'all',
                    label: 'All',
                  },
                  {
                    value: 'income',
                    label: '↑ Income',
                  },
                  {
                    value: 'expense',
                    label: '↓ Expense',
                  },
                ]}
              />

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {/* Category */}

              <div>

                <label className="label">
                  Category
                </label>

                <select
                  className="input"
                  value={filters.category}
                  onChange={(e) =>
                    apply({
                      category:
                        e.target.value,
                    })
                  }
                >

                  <option value="">
                    All categories
                  </option>

                  {categories.map((c) => (

                    <option
                      key={c._id}
                      value={c._id}
                    >
                      {c.icon &&
                      !ICON_MAP[c.icon]
                        ? `${c.icon} ${c.name}`
                        : c.name}
                    </option>

                  ))}

                </select>

              </div>


              <div>

                <label className="label">
                  From date
                </label>

                <input
                  type="date"
                  className="input"
                  value={filters.startDate}
                  onChange={(e) =>
                    apply({
                      startDate:
                        e.target.value,
                    })
                  }
                />

              </div>


              <div>

                <label className="label">
                  To date
                </label>

                <input
                  type="date"
                  className="input"
                  value={filters.endDate}
                  onChange={(e) =>
                    apply({
                      endDate:
                        e.target.value,
                    })
                  }
                />

              </div>

            </div>

          </div>

        )}

      </Card>


      {/* Bulk select bar + view toggle */}

      {transactions.length > 0 && (

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">

          <button
            onClick={
              allSelected
                ? clearSelected
                : selectAll
            }
            className="hover:text-slate-700 dark:hover:text-slate-200 underline"
          >
            {allSelected
              ? 'Deselect all'
              : 'Select all'}
          </button>


          {selected.size > 0 && (

            <span className="font-medium text-blue-600 dark:text-blue-400">
              {selected.size} selected
            </span>

          )}


          <div className="ml-auto">

            <Tabs
              tabs={VIEW_TABS}
              active={viewMode}
              onChange={setViewMode}
            />

          </div>

        </div>

      )}


      {/* Transaction table */}

      <div className="space-y-3 animate-in stagger-3">

        {loading ? (

          <Card>
            {[...Array(6)].map(
              (_, i) => (
                <SkeletonRow key={i} />
              )
            )}
          </Card>

        ) : transactions.length === 0 ? (

          <EmptyState
            icon="📋"
            title="No transactions found"
            description={
              hasFilters
                ? 'Try adjusting your search or filters'
                : 'Add your first transaction to get started'
            }
            action={
              !hasFilters && (
                <Button
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() =>
                    setAddOpen(true)
                  }
                >
                  Add Transaction
                </Button>
              )
            }
          />

        ) : viewMode === 'list' ? (

          renderTable(transactions)

        ) : (

          Object.entries(grouped).map(
            ([date, txs]) =>
              renderTable(
                txs,
                true,
                date
              )
          )

        )}

      </div>


      {/* Pagination */}

      {transactions.length > 0 && (

        <Pagination
          page={filters.page}
          pages={pagination.pages}
          total={pagination.total}
          onPageChange={changePage}
          loading={loading}
        />

      )}


      {/* ── Modals ── */}

      {/* View */}

      <Modal
        open={!!viewTx}
        onClose={() => setViewTx(null)}
        title="Transaction Detail"
        description="Full details of this record"
      >
        <TransactionDetail
          tx={viewTx}
          onClose={() => setViewTx(null)}
        />
      </Modal>


      {/* Add */}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="New Transaction"
        description="Record income or expense in your workspace"
      >
        <TransactionForm
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={submitting}
        />
      </Modal>


      {/* Edit */}

      <Modal
        open={!!editTx}
        onClose={() => setEditTx(null)}
        title="Edit Transaction"
        description="Update transaction details"
      >

        {editTx && (

          <TransactionForm
            onSubmit={handleEdit}
            onCancel={() => setEditTx(null)}
            defaultValues={editTx}
            loading={submitting}
          />

        )}

      </Modal>


      {/* Delete single */}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDel}
        title="Delete Transaction"
        description="This will permanently remove this transaction. Are you sure?"
        loading={submitting}
      />


      {/* Bulk delete */}

      <ConfirmDialog
        open={bulkDel}
        onClose={() => setBulkDel(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} Transactions`}
        description="This will permanently remove all selected transactions."
        confirmLabel={`Delete ${selected.size} records`}
        loading={submitting}
      />

    </div>
  )
}