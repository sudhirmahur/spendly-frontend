import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, useWorkspaceStore } from '../store'
import { useTransactions } from '../hooks'
import {
  StatCard,
  Card,
  EmptyState,
  SkeletonRow,
  Modal,
  Skeleton,
  Badge,
  Button,
  Tabs,
} from '../components/ui'
import {
  MonthlyAreaChart,
  MonthlyBarChart,
  ComposedMonthlyChart,
  CategoryDonutChart,
} from '../components/charts'
import TransactionRow from '../components/layout/TransactionRow'
import TransactionForm from '../components/TransactionForm'
import { formatCurrency, cn, CATEGORIES } from '../utils/helpers'
import { CategoryIcon } from '../utils/categoryIcons'
import {
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Activity,
  PieChart,
  BarChart3,
  Wallet,
  RefreshCw,
} from 'lucide-react'


// ─── Rupee Amount Component ───────────────────────────────────────────────────

function RupeeAmount({
  amount,
  size = 14,
  className = '',
}) {
  const formatted = formatCurrency(amount)
    .replace(/[₹$€£]/g, '')
    .trim()

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
    >
      <IndianRupee
        size={size}
        strokeWidth={2.2}
        className="shrink-0"
      />

      <span>
        {formatted}
      </span>
    </span>
  )
}


// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {

  const { user } = useAuthStore()
  const { currentWorkspace } = useWorkspaceStore()

  const {
    transactions,
    loading,
    summary,
    monthlyData,
    categoryData,
    create,
    refetch,
  } = useTransactions()


  const [addOpen, setAddOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [chartTab, setChartTab] = useState('area')


  const totalIncome =
    summary?.totalIncome ||
    summary?.income ||
    0

  const totalExpense =
    summary?.totalExpense ||
    summary?.expense ||
    0

  const balance =
    summary?.balance ??
    (totalIncome - totalExpense)

  const savingsRate =
    totalIncome > 0
      ? Math.round(
          ((totalIncome - totalExpense) /
            totalIncome) *
            100
        )
      : 0


  const recent = transactions.slice(0, 8)


  // ─── Expense Breakdown ──────────────────────────────────────────────────────

  const breakdown = useMemo(() => {

    if (categoryData?.length) {

      return categoryData
        .map((item) => {

          const cat =
            CATEGORIES.find(
              (c) =>
                c._id ===
                (item._id || item.category)
            ) || {
              name:
                item._id ||
                'Other',
              icon: '📦',
              color: '#94a3b8',
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
            b.amount -
            a.amount
        )
    }


    const expenses =
      transactions.filter(
        (t) =>
          t.type === 'expense'
      )

    const total =
      expenses.reduce(
        (s, t) =>
          s + t.amount,
        0
      )

    const map = {}


    expenses.forEach((t) => {

      const id =
        t.category?._id ||
        t.category ||
        'other'


      if (!map[id]) {

        const cat =
          CATEGORIES.find(
            (c) =>
              c._id === id
          ) || {
            _id: id,
            name: id,
            icon: '📦',
            color: '#94a3b8',
          }

        map[id] = {
          ...cat,
          amount: 0,
          count: 0,
        }

      }


      map[id].amount +=
        t.amount

      map[id].count++

    })


    return Object.values(map)
      .map((c) => ({
        ...c,
        percentage: total
          ? Math.round(
              (c.amount /
                total) *
                100
            )
          : 0,
      }))
      .sort(
        (a, b) =>
          b.amount -
          a.amount
      )

  }, [
    categoryData,
    transactions,
  ])


  // ─── Add Transaction ────────────────────────────────────────────────────────

  const handleAdd = async (data) => {

    setSubmitting(true)

    try {

      await create(data)

      setAddOpen(false)

    } finally {

      setSubmitting(false)

    }

  }


  // ─── Greeting ───────────────────────────────────────────────────────────────

  const hour =
    new Date().getHours()

  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
        ? 'Good afternoon'
        : 'Good evening'


  // ─── Chart Tabs ──────────────────────────────────────────────────────────────

  const CHART_TABS = [
    {
      value: 'area',
      label: 'Area',
      icon: <Activity size={13} />,
    },
    {
      value: 'bar',
      label: 'Bar',
      icon: <BarChart3 size={13} />,
    },
    {
      value: 'composed',
      label: 'Combined',
      icon: <TrendingUp size={13} />,
    },
  ]


  return (

    <div className="space-y-6">


      {/* ─── Header ─────────────────────────────────────────────────────────── */}

      <div className="page-header animate-in">

        <div>

          <p className="text-sm text-slate-400">
            {greeting} 👋
          </p>

          <h1 className="page-title mt-0.5">
            {user?.name?.split(' ')[0] ||
              'Welcome'}
          </h1>


          {currentWorkspace && (

            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">

              <Wallet
                size={11}
                className="text-blue-500"
              />

              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {currentWorkspace.name}
              </span>

              <span className="text-slate-300">
                workspace
              </span>

            </p>

          )}

        </div>


        <div className="flex items-center gap-2">

          <Button
            variant="secondary"
            size="sm"
            icon={
              <RefreshCw size={13} />
            }
            onClick={() =>
              refetch({})
            }
          >
            Refresh
          </Button>


          <Button
            size="sm"
            icon={
              <Plus size={14} />
            }
            onClick={() =>
              setAddOpen(true)
            }
          >
            Add transaction
          </Button>

        </div>

      </div>


      {/* ─── Balance Hero ────────────────────────────────────────────────────── */}

      <Card className="relative overflow-hidden animate-in stagger-1 bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 border-0 text-white">

        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize:
              '30px 30px',
          }}
        />

        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />


        <div className="relative">

          <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">
            Net Balance
          </p>


          {loading ? (

            <Skeleton
              className="h-12 w-44 mt-2 bg-white/20"
            />

          ) : (

            <RupeeAmount
              amount={balance}
              size={32}
              className="text-5xl font-bold font-mono mt-2 tracking-tight"
            />

          )}


          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">


            {/* Income */}

            <div className="flex items-center gap-2">

              <TrendingUp
                size={14}
                className="text-emerald-300"
              />

              <span className="text-blue-200 text-xs">
                Income
              </span>

              {loading ? (

                <span className="text-white font-semibold text-sm font-mono">
                  —
                </span>

              ) : (

                <RupeeAmount
                  amount={totalIncome}
                  size={13}
                  className="text-white font-semibold text-sm font-mono"
                />

              )}

            </div>


            {/* Expenses */}

            <div className="flex items-center gap-2">

              <TrendingDown
                size={14}
                className="text-red-300"
              />

              <span className="text-blue-200 text-xs">
                Expenses
              </span>

              {loading ? (

                <span className="text-white font-semibold text-sm font-mono">
                  —
                </span>

              ) : (

                <RupeeAmount
                  amount={totalExpense}
                  size={13}
                  className="text-white font-semibold text-sm font-mono"
                />

              )}

            </div>


            {/* Savings */}

            {!loading &&
              totalIncome > 0 && (

                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">

                  <span className="text-white text-xs font-semibold">
                    {savingsRate}% saved
                  </span>

                </div>

              )}

          </div>

        </div>

      </Card>


      {/* ─── Stat Cards ─────────────────────────────────────────────────────── */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          label="Total Income"
          value={
            <RupeeAmount
              amount={totalIncome}
              size={15}
            />
          }
          icon={
            <TrendingUp size={16} />
          }
          accent="green"
          loading={loading}
        />


        <StatCard
          label="Total Expenses"
          value={
            <RupeeAmount
              amount={totalExpense}
              size={15}
            />
          }
          icon={
            <TrendingDown size={16} />
          }
          accent="red"
          loading={loading}
        />


        <StatCard
          label="Transactions"
          value={String(
            transactions.length
          )}
          icon={
            <Activity size={16} />
          }
          accent="blue"
          loading={loading}
        />


        <StatCard
          label="Savings Rate"
          value={
            totalIncome > 0
              ? `${savingsRate}%`
              : '—'
          }
          icon={
            <PieChart size={16} />
          }
          accent="violet"
          loading={loading}
          subvalue={
            savingsRate < 0
              ? 'Spending more than earning'
              : savingsRate < 20
                ? 'Good start!'
                : 'Great savings!'
          }
        />

      </div>


      {/* ─── Charts Row ─────────────────────────────────────────────────────── */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">


        {/* Monthly Chart */}

        <Card className="lg:col-span-2 animate-in stagger-2">

          <div className="flex items-start justify-between mb-4">

            <div>

              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Monthly Overview
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                Income vs Expenses — last 6 months
              </p>

            </div>

          </div>


          <div className="mb-4">

            <Tabs
              tabs={CHART_TABS}
              active={chartTab}
              onChange={setChartTab}
            />

          </div>


          {loading ? (

            <Skeleton className="h-56 w-full" />

          ) : monthlyData.length > 0 ? (

            chartTab === 'area' ? (

              <MonthlyAreaChart
                data={monthlyData}
              />

            ) : chartTab === 'bar' ? (

              <MonthlyBarChart
                data={monthlyData}
              />

            ) : (

              <ComposedMonthlyChart
                data={monthlyData}
              />

            )

          ) : (

            <div className="h-56 flex flex-col items-center justify-center gap-2 text-slate-400">

              <BarChart3
                size={32}
                className="opacity-30"
              />

              <p className="text-xs">
                No monthly data yet
              </p>

            </div>

          )}


          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">

            <span className="flex items-center gap-1.5 text-xs text-slate-400">

              <span className="w-2 h-2 rounded-full bg-emerald-500" />

              Income

            </span>


            <span className="flex items-center gap-1.5 text-xs text-slate-400">

              <span className="w-2 h-2 rounded-full bg-red-500" />

              Expenses

            </span>


            {chartTab === 'composed' && (

              <span className="flex items-center gap-1.5 text-xs text-slate-400">

                <span className="w-2 h-2 rounded-full bg-blue-500" />

                Net

              </span>

            )}

          </div>

        </Card>


        {/* Category Donut */}

        <Card className="animate-in stagger-3">

          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Expenses by Category
          </h2>

          <p className="text-xs text-slate-400 mt-0.5 mb-3">
            Where money is going
          </p>


          {loading ? (

            <div className="space-y-2.5">

              {[...Array(4)].map(
                (_, i) => (
                  <Skeleton
                    key={i}
                    className="h-4 w-full"
                  />
                )
              )}

            </div>

          ) : breakdown.length > 0 ? (

            <>

              <CategoryDonutChart
                data={breakdown}
              />


              <div className="space-y-2.5 mt-2">

                {breakdown
                  .slice(0, 5)
                  .map((cat, i) => (

                    <div
                      key={i}
                      className="flex items-center gap-2"
                    >

                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: `${cat.color || '#94a3b8'}18`,
                        }}
                      >

                        <CategoryIcon
                          icon={cat.icon}
                          color={
                            cat.color ||
                            '#94a3b8'
                          }
                          size={13}
                        />

                      </span>


                      <div className="flex-1 min-w-0">

                        <div className="flex justify-between mb-0.5">

                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                            {cat.name}
                          </span>

                          <span className="text-[10px] text-slate-400 shrink-0 ml-1 font-mono">
                            {cat.percentage}%
                          </span>

                        </div>


                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">

                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${cat.percentage}%`,
                              background: cat.color,
                            }}
                          />

                        </div>

                      </div>


                      {/* Category Amount */}

                      <RupeeAmount
                        amount={cat.amount}
                        size={12}
                        className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0"
                      />

                    </div>

                  ))}

              </div>

            </>

          ) : (

            <EmptyState
              icon="📊"
              title="No expense data"
              description="Add some expense transactions to see the breakdown"
            />

          )}

        </Card>

      </div>


      {/* ─── Recent Transactions ─────────────────────────────────────────────── */}

      <Card className="animate-in stagger-4">

        <div className="flex items-center justify-between mb-4">

          <div>

            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Recent Transactions
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              {transactions.length} total in workspace
            </p>

          </div>


          <Link
            to="/transactions"
            className="btn-ghost btn-sm flex items-center gap-1.5 text-blue-600 dark:text-blue-400"
          >
            View all
            <ArrowRight size={13} />
          </Link>

        </div>


        {loading ? (

          <div>
            {[...Array(5)].map(
              (_, i) => (
                <SkeletonRow
                  key={i}
                />
              )
            )}
          </div>

        ) : recent.length === 0 ? (

          <EmptyState
            icon="💸"
            title="No transactions yet"
            description="Add your first transaction to see your dashboard come alive"
            action={
              <Button
                size="sm"
                icon={
                  <Plus size={14} />
                }
                onClick={() =>
                  setAddOpen(true)
                }
              >
                Add first transaction
              </Button>
            }
          />

        ) : (

          <div className="overflow-x-auto -mx-1">

            <table className="w-full text-left">

              <tbody>

                {recent.map((tx) => (

                  <TransactionRow
                    key={tx._id}
                    tx={tx}
                  />

                ))}

              </tbody>

            </table>

          </div>

        )}

      </Card>


      {/* ─── Add Transaction Modal ───────────────────────────────────────────── */}

      <Modal
        open={addOpen}
        onClose={() =>
          setAddOpen(false)
        }
        title="New Transaction"
        description="Record an income or expense in your workspace"
      >

        <TransactionForm
          onSubmit={handleAdd}
          onCancel={() =>
            setAddOpen(false)
          }
          loading={submitting}
        />

      </Modal>

    </div>
  )
}