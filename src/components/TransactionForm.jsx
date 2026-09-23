import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Toggle } from './ui'
import { useCategories } from '../hooks'
import { ICON_MAP } from '../utils/categoryIcons'
import { format } from 'date-fns'
import { Loader2, AlertCircle } from 'lucide-react'

// Native <select><option> can only render text — show the emoji prefix only
// when the category's icon field is actually an emoji, not a Lucide icon key
const optionLabel = (c) => (c.icon && !ICON_MAP[c.icon] ? `${c.icon} ${c.name}` : c.name)

const schema = z.object({
  type    : z.enum(['income', 'expense']),
  amount  : z.coerce.number().positive('Must be greater than 0'),
  category: z.string().min(1, 'Please select a category'),
  date    : z.string().min(1, 'Date is required'),
  note    : z.string().max(300, 'Max 300 characters').optional(),
})

export default function TransactionForm({ onSubmit, onCancel, defaultValues, loading }) {
  const { categories, loading: catLoading } = useCategories()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type    : 'expense',
      date    : format(new Date(), 'yyyy-MM-dd'),
      ...defaultValues,
      // ✅ Always a plain _id string — never the full category object
      category: defaultValues?.category?._id || defaultValues?.category || '',
      amount  : defaultValues?.amount || '',
      note    : defaultValues?.note   || '',
    },
  })

  const type     = watch('type')
  const filtered = categories.filter((c) => !c.type || c.type === type)

  const handleFormSubmit = (data) => {
    // ✅ data.category is a plain ObjectId string from the <select>
    onSubmit({
      type    : data.type,
      amount  : data.amount,   // zod coerced to number
      category: data.category, // plain ObjectId string — what backend expects
      date    : data.date,
      note    : data.note || '',
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">

      {/* Type */}
      <div>
        <label className="label">Transaction type</label>
        <Toggle
          value={type}
          onChange={(v) => { setValue('type', v); setValue('category', '') }}
          options={[
            { value: 'expense', label: '↓ Expense' },
            { value: 'income',  label: '↑ Income'  },
          ]}
        />
      </div>

      {/* Amount */}
      <Input
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        prefix="$"
        error={errors.amount?.message}
        {...register('amount')}
      />

      {/* Category */}
      <div className="space-y-1.5">
        <label className="label">
          Category
          {catLoading && <Loader2 size={11} className="inline ml-1.5 animate-spin opacity-60" />}
        </label>

        {catLoading ? (
          <div className="input flex items-center gap-2 text-slate-400 cursor-wait">
            <Loader2 size={14} className="animate-spin shrink-0" />
            <span className="text-sm">Loading categories…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="input flex items-start gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 h-auto py-2.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span className="text-sm">
              No {type} categories found.{' '}
              <a href="/categories" className="underline font-semibold">Create one first →</a>
            </span>
          </div>
        ) : (
          /* value is always c._id — a real MongoDB ObjectId ✅ */
          <select
            className={`input ${errors.category ? 'input-error' : ''}`}
            {...register('category')}
          >
            <option value="">Select a category</option>
            {filtered.map((c) => (
              <option key={c._id} value={c._id}>
                {optionLabel(c)}
              </option>
            ))}
          </select>
        )}

        {errors.category && <p className="field-error">⚠ {errors.category.message}</p>}
      </div>

      {/* Date */}
      <Input
        label="Date"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      {/* Note */}
      <div className="space-y-1.5">
        <label className="label">
          Note <span className="normal-case font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          className={`input resize-none text-sm ${errors.note ? 'input-error' : ''}`}
          placeholder={type === 'income' ? 'e.g. Monthly salary payment' : 'e.g. Lunch at office'}
          {...register('note')}
        />
        {errors.note && <p className="field-error">⚠ {errors.note.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading} disabled={catLoading || filtered.length === 0}>
          {defaultValues?._id ? 'Update transaction' : 'Add transaction'}
        </Button>
      </div>
    </form>
  )
}