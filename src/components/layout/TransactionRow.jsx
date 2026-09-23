import { formatCurrency, cn } from '../../utils/helpers'
import { CategoryIcon } from '../../utils/categoryIcons'
import { Pencil, Trash2, Eye, IndianRupee } from 'lucide-react'
import { format } from 'date-fns'
import { useCategories } from '../../hooks'

export default function TransactionRow({
  tx,
  onView,
  onEdit,
  onDelete,
  selected,
  onSelect,
}) {

  const { categories } = useCategories()

  // Handle category ID OR category object
  const cat =
    typeof tx.category === 'object'
      ? tx.category
      : categories.find((c) => c._id === tx.category) || {}

  const label =
    tx.note ||
    tx.title ||
    cat.name ||
    'Transaction'

  return (
    <tr
      className={cn(
        'border-b border-slate-50 dark:border-slate-800/60 transition-colors duration-100 group',
        'hover:bg-slate-50 dark:hover:bg-slate-800/40',
        selected && 'bg-blue-50/60 dark:bg-blue-500/5'
      )}
    >

      {/* Checkbox */}
      <td className="w-10 pl-4 py-3">
        {onSelect && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onSelect(tx._id)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 cursor-pointer"
          />
        )}
      </td>


      {/* Category icon */}
      <td className="w-12 py-3 pl-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
          style={{
            background: `${cat.color || '#94a3b8'}18`,
          }}
        >
          <CategoryIcon
            icon={cat.icon}
            color={cat.color || '#94a3b8'}
            size={17}
          />
        </div>
      </td>


      {/* Note / Title */}
      <td className="py-3 px-3 max-w-[180px]">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate leading-tight">
          {label}
        </p>
      </td>


      {/* Category name */}
      <td className="py-3 px-3 hidden sm:table-cell">
        <div className="flex items-center gap-1.5">

          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: cat.color || '#94a3b8',
            }}
          />

          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {cat?.name || '—'}
          </span>

        </div>
      </td>


      {/* Date */}
      <td className="py-3 px-3 hidden md:table-cell">
        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {format(new Date(tx.date), 'MMM d, yyyy')}
        </span>
      </td>


      {/* Type */}
      <td className="py-3 px-3 hidden sm:table-cell">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize',
            tx.type === 'income'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
          )}
        >
          {tx.type === 'income' ? '↑' : '↓'} {tx.type}
        </span>
      </td>


      {/* Amount */}
      <td className="py-3 px-3 text-right whitespace-nowrap">

        <span
          className={cn(
            'inline-flex items-center justify-end gap-0.5 text-sm font-semibold font-mono',
            tx.type === 'income'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          )}
        >

          {/* Plus / Minus */}
          <span>
            {tx.type === 'income' ? '+' : '−'}
          </span>

          {/* Indian Rupee Lucide Icon */}
          <IndianRupee
            size={14}
            strokeWidth={2.3}
            className="shrink-0"
          />

          {/* Amount */}
          <span>
            {formatCurrency(tx.amount)
              .replace(/[₹$€£]/g, '')
              .trim()}
          </span>

        </span>

      </td>


      {/* Actions */}
      {/* <td className="py-3 pr-4 pl-2 text-right">

        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">

          {onView && (
            <button
              onClick={() => onView(tx)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-blue-500"
              title="View"
            >
              <Eye size={13} />
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(tx)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600"
              title="Edit"
            >
              <Pencil size={13} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(tx._id)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-red-500"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          )}

        </div>

      </td> */}

      {/* Actions */}
<td className="py-3 pr-4 pl-2 text-right">

  <div className="flex items-center justify-end gap-1">

    {/* View */}
    {onView && (
      <button
        onClick={() => onView(tx)}
        className="p-1.5 rounded-lg
                   text-slate-400 dark:text-slate-500
                   hover:text-blue-600 dark:hover:text-blue-400
                   hover:bg-blue-50 dark:hover:bg-blue-500/10
                   transition-all duration-150"
        title="View transaction"
      >
        <Eye size={14} strokeWidth={2} />
      </button>
    )}

    {/* Edit */}
    {onEdit && (
      <button
        onClick={() => onEdit(tx)}
        className="p-1.5 rounded-lg
                   text-slate-400 dark:text-slate-500
                   hover:text-slate-700 dark:hover:text-slate-200
                   hover:bg-slate-100 dark:hover:bg-slate-800
                   transition-all duration-150"
        title="Edit transaction"
      >
        <Pencil size={14} strokeWidth={2} />
      </button>
    )}

    {/* Delete */}
    {onDelete && (
      <button
        onClick={() => onDelete(tx._id)}
        className="p-1.5 rounded-lg
                   text-slate-400 dark:text-slate-500
                   hover:text-red-600 dark:hover:text-red-400
                   hover:bg-red-50 dark:hover:bg-red-500/10
                   transition-all duration-150"
        title="Delete transaction"
      >
        <Trash2 size={14} strokeWidth={2} />
      </button>
    )}

  </div>

</td>

    </tr>
  )
}