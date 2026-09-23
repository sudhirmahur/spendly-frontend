import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts'

import { formatCurrency } from '../../utils/helpers'
import { IndianRupee } from 'lucide-react'


// ─── Currency helper ──────────────────────────────────────────────────────────

const cleanCurrency = (value) => {
  return String(
    formatCurrency(value)
  )
    .replace(/[₹$€£]/g, '')
    .trim()
}


// ─── Custom Currency Text ─────────────────────────────────────────────────────

const RupeeValue = ({
  value,
  size = 12,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
    >
      <IndianRupee
        size={size}
        strokeWidth={2.2}
        className="shrink-0"
      />

      <span>
        {cleanCurrency(value)}
      </span>
    </span>
  )
}


// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const TT = ({
  active,
  payload,
  label,
}) => {

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">

      {label && (
        <p className="font-semibold text-slate-600 dark:text-slate-300 mb-2">
          {label}
        </p>
      )}

      {payload.map((p, i) => (

        <div
          key={i}
          className="flex items-center gap-2 mb-0.5"
        >

          {/* Chart color indicator */}

          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: p.color,
            }}
          />


          {/* Name */}

          <span className="text-slate-500 dark:text-slate-400 capitalize">
            {p.name}:
          </span>


          {/* Indian Rupee amount */}

          <RupeeValue
            value={p.value}
            size={11}
            className="font-semibold text-slate-800 dark:text-slate-200"
          />

        </div>

      ))}

    </div>
  )
}


// ─── Chart Styles ─────────────────────────────────────────────────────────────

const axisStyle = {
  fontSize: 11,
  fill: '#94a3b8',
}

const gridStyle = {
  strokeDasharray: '3 3',
  stroke: 'rgba(148,163,184,0.1)',
}


// ─── Y Axis Formatter ────────────────────────────────────────────────────────

const formatAxisValue = (value) => {

  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`
  }

  return value
}


// ─── Monthly Area Chart ──────────────────────────────────────────────────────

export function MonthlyAreaChart({
  data,
}) {

  return (

    <ResponsiveContainer
      width="100%"
      height={230}
    >

      <AreaChart
        data={data}
        margin={{
          top: 4,
          right: 4,
          left: -20,
          bottom: 0,
        }}
      >

        <defs>

          <linearGradient
            id="gInc"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >

            <stop
              offset="5%"
              stopColor="#10b981"
              stopOpacity={0.2}
            />

            <stop
              offset="95%"
              stopColor="#10b981"
              stopOpacity={0}
            />

          </linearGradient>


          <linearGradient
            id="gExp"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >

            <stop
              offset="5%"
              stopColor="#ef4444"
              stopOpacity={0.15}
            />

            <stop
              offset="95%"
              stopColor="#ef4444"
              stopOpacity={0}
            />

          </linearGradient>

        </defs>


        <CartesianGrid
          {...gridStyle}
        />


        <XAxis
          dataKey="month"
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
        />


        <YAxis
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatAxisValue}
        />


        <Tooltip
          content={<TT />}
        />


        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#gInc)"
          dot={false}
          activeDot={{
            r: 4,
            strokeWidth: 0,
          }}
        />


        <Area
          type="monotone"
          dataKey="expense"
          name="Expense"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#gExp)"
          dot={false}
          activeDot={{
            r: 4,
            strokeWidth: 0,
          }}
        />

      </AreaChart>

    </ResponsiveContainer>
  )
}


// ─── Monthly Bar Chart ───────────────────────────────────────────────────────

export function MonthlyBarChart({
  data,
}) {

  return (

    <ResponsiveContainer
      width="100%"
      height={230}
    >

      <BarChart
        data={data}
        margin={{
          top: 4,
          right: 4,
          left: -20,
          bottom: 0,
        }}
        barSize={8}
        barGap={3}
      >

        <CartesianGrid
          {...gridStyle}
        />


        <XAxis
          dataKey="month"
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
        />


        <YAxis
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatAxisValue}
        />


        <Tooltip
          content={<TT />}
        />


        <Bar
          dataKey="income"
          name="Income"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
        />


        <Bar
          dataKey="expense"
          name="Expense"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />

      </BarChart>

    </ResponsiveContainer>
  )
}


// ─── Composed Monthly Chart ──────────────────────────────────────────────────

export function ComposedMonthlyChart({
  data,
}) {

  return (

    <ResponsiveContainer
      width="100%"
      height={230}
    >

      <ComposedChart
        data={data}
        margin={{
          top: 4,
          right: 4,
          left: -20,
          bottom: 0,
        }}
      >

        <defs>

          <linearGradient
            id="gBal"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >

            <stop
              offset="5%"
              stopColor="#3b82f6"
              stopOpacity={0.15}
            />

            <stop
              offset="95%"
              stopColor="#3b82f6"
              stopOpacity={0}
            />

          </linearGradient>

        </defs>


        <CartesianGrid
          {...gridStyle}
        />


        <XAxis
          dataKey="month"
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
        />


        <YAxis
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatAxisValue}
        />


        <Tooltip
          content={<TT />}
        />


        <Bar
          dataKey="income"
          name="Income"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          barSize={8}
        />


        <Bar
          dataKey="expense"
          name="Expense"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
          barSize={8}
        />


        <Line
          type="monotone"
          dataKey="balance"
          name="Net Balance"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />

      </ComposedChart>

    </ResponsiveContainer>
  )
}


// ─── Category Donut Chart ─────────────────────────────────────────────────────

export function CategoryDonutChart({
  data,
}) {

  const items = data.slice(0, 8)

  return (

    <ResponsiveContainer
      width="100%"
      height={200}
    >

      <PieChart>

        <Pie
          data={items}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={82}
          paddingAngle={2}
          dataKey="amount"
          nameKey="name"
        >

          {items.map(
            (item, i) => (

              <Cell
                key={i}
                fill={
                  item.color ||
                  '#94a3b8'
                }
                strokeWidth={0}
              />

            )
          )}

        </Pie>


        {/* Donut Tooltip */}

        <Tooltip
          formatter={(value) =>
            cleanCurrency(value)
          }
          contentStyle={{
            background:
              'rgba(17,17,24,0.95)',
            border:
              '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            fontSize: 11,
            color: '#e2e8f0',
          }}
        />

      </PieChart>

    </ResponsiveContainer>
  )
}


// ─── Mini Line Chart ──────────────────────────────────────────────────────────

export function MiniLineChart({
  data,
  dataKey = 'value',
  color = '#3b82f6',
}) {

  return (

    <ResponsiveContainer
      width="100%"
      height={50}
    >

      <LineChart
        data={data}
        margin={{
          top: 2,
          right: 2,
          left: 2,
          bottom: 2,
        }}
      >

        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
        />

      </LineChart>

    </ResponsiveContainer>
  )
}