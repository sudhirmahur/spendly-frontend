import { useState } from 'react'
import { useWorkspace } from '../../hooks'
import { useWorkspaceStore } from '../../store'
import { Modal, Input, Button } from '../ui'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronDown, Check, Plus, Building2, Loader2 } from 'lucide-react'
import { cn } from '../../utils/helpers'

const schema = z.object({ name: z.string().min(2, 'At least 2 characters') })

export default function WorkspaceSwitcher() {
  const { currentWorkspace, workspaces }        = useWorkspaceStore()
  const { switchWorkspace, createWorkspace, loading } = useWorkspace()
  const [open,    setOpen]    = useState(false)
  const [modal,   setModal]   = useState(false)
  const [saving,  setSaving]  = useState(false)

  const { register, handleSubmit, reset, formState:{errors} } = useForm({ resolver: zodResolver(schema) })

  const handleCreate = async (data) => {
    setSaving(true)
    try { await createWorkspace(data); reset(); setModal(false) }
    catch (_) { /* toast already shown */ }
    finally { setSaving(false) }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-left">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {currentWorkspace?.name?.[0]?.toUpperCase() || 'W'}
        </div>
        <span className="flex-1 truncate text-slate-700 dark:text-slate-200">
          {currentWorkspace?.name || 'Select workspace'}
        </span>
        {loading ? <Loader2 size={13} className="animate-spin text-slate-400 shrink-0"/> : <ChevronDown size={13} className="text-slate-400 shrink-0"/>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}/>
          <div className="absolute left-0 right-0 mt-1 z-50 bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 rounded-xl shadow-modal overflow-hidden animate-[scaleIn_0.15s_ease_forwards]">
            <div className="p-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2.5 py-2">Workspaces</p>
              {workspaces.length === 0 && <p className="text-xs text-slate-400 px-2.5 py-2">No workspaces yet</p>}
              {workspaces.map((ws) => {
                const active = currentWorkspace?._id === ws._id
                return (
                  <button key={ws._id} onClick={() => { if (!active) { switchWorkspace(ws) } setOpen(false) }}
                    className={cn('w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                      active ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300')}>
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {ws.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium truncate">{ws.name}</p>
                      {ws.role && <p className="text-[10px] text-slate-400 capitalize">{ws.role}</p>}
                    </div>
                    {active && <Check size={13} className="shrink-0"/>}
                  </button>
                )
              })}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 p-1.5">
              <button onClick={() => { setModal(true); setOpen(false) }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Plus size={14}/> New workspace
              </button>
            </div>
          </div>
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Workspace" description="Create a separate workspace for different finance tracking" size="sm">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <Input label="Workspace name" placeholder="e.g. Personal, Business" error={errors.name?.message} {...register('name')}/>
          <div className="flex gap-2.5">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={saving}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
