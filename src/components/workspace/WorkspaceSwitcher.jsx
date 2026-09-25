import { useEffect, useState } from 'react'
import { useWorkspace } from '../../hooks'
import { useWorkspaceStore } from '../../store'
import { Modal, Input, Button } from '../ui'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  ChevronDown,
  Check,
  Plus,
  Loader2,
} from 'lucide-react'

import { cn } from '../../utils/helpers'


const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'At least 2 characters'),
})


export default function WorkspaceSwitcher() {

  const {
    currentWorkspace,
    workspaces,
  } = useWorkspaceStore()

  const {
    switchWorkspace,
    createWorkspace,
    loading,
    refetch,
  } = useWorkspace()

  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
    },
  })


  // =====================================================
  // FETCH WORKSPACES
  // =====================================================

  useEffect(() => {
    refetch()
  }, [refetch])


  // =====================================================
  // CREATE WORKSPACE
  // =====================================================

  const handleCreate = async (data) => {

    if (saving) return

    setSaving(true)

    try {

      /*
       * createWorkspace():
       * 1. Creates workspace in backend
       * 2. Adds workspace to Zustand
       * 3. Makes it current workspace
       */

      await createWorkspace({
        name: data.name.trim(),
      })

      reset()

      setModal(false)
      setOpen(false)

      // Refresh workspace list from backend
      await refetch()

    } catch (error) {

      console.error(
        'Create workspace error:',
        error
      )

    } finally {

      setSaving(false)

    }
  }


  // =====================================================
  // SWITCH WORKSPACE
  // =====================================================

  const handleSwitch = async (workspace) => {

    if (!workspace?._id) return

    if (
      currentWorkspace?._id ===
      workspace._id
    ) {
      setOpen(false)
      return
    }

    setOpen(false)

    await switchWorkspace(workspace)
  }


  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================

  const openCreateModal = () => {

    setOpen(false)

    reset()

    setModal(true)

  }


  return (
    <div className="relative">

      {/* =====================================================
          CURRENT WORKSPACE BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={loading}
        aria-expanded={open}
        aria-haspopup="menu"
        className="
          flex
          items-center
          gap-2.5
          w-full
          px-3
          py-2.5
          rounded-xl
          bg-slate-100
          dark:bg-slate-800
          border
          border-slate-200
          dark:border-slate-700
          hover:bg-slate-200
          dark:hover:bg-slate-700
          transition-colors
          text-sm
          font-medium
          text-left
          disabled:opacity-70
        "
      >

        {/* Workspace icon */}

        <div
          className="
            w-6
            h-6
            rounded-lg
            bg-gradient-to-br
            from-blue-500
            to-violet-500
            flex
            items-center
            justify-center
            text-white
            text-xs
            font-bold
            shrink-0
          "
        >
          {currentWorkspace?.name
            ?.charAt(0)
            ?.toUpperCase() || 'W'}
        </div>


        {/* Workspace name */}

        <span
          className="
            flex-1
            truncate
            text-slate-700
            dark:text-slate-200
          "
        >
          {currentWorkspace?.name ||
            'Select workspace'}
        </span>


        {/* Loading / dropdown icon */}

        {loading ? (

          <Loader2
            size={13}
            className="
              animate-spin
              text-slate-400
              shrink-0
            "
          />

        ) : (

          <ChevronDown
            size={13}
            className={cn(
              'text-slate-400 shrink-0 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />

        )}

      </button>


      {/* =====================================================
          DROPDOWN
      ====================================================== */}

      {open && (

        <>

          {/* Outside click */}

          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />


          <div
            className="
              absolute
              left-0
              right-0
              mt-1
              z-50
              bg-white
              dark:bg-[#111118]
              border
              border-slate-200
              dark:border-slate-800
              rounded-xl
              shadow-modal
              overflow-hidden
              animate-[scaleIn_0.15s_ease_forwards]
            "
            role="menu"
          >

            {/* =================================================
                WORKSPACE LIST
            ================================================== */}

            <div className="p-1.5">

              <p
                className="
                  text-[10px]
                  font-semibold
                  text-slate-400
                  uppercase
                  tracking-widest
                  px-2.5
                  py-2
                "
              >
                Workspaces
              </p>


              {workspaces.length === 0 ? (

                <div className="px-2.5 py-3">

                  <p className="text-xs text-slate-400">
                    No workspaces yet
                  </p>

                </div>

              ) : (

                <div className="space-y-0.5">

                  {workspaces.map((ws) => {

                    const active =
                      currentWorkspace?._id ===
                      ws._id


                    return (

                      <button
                        key={ws._id}
                        type="button"
                        role="menuitem"
                        onClick={() =>
                          handleSwitch(ws)
                        }
                        className={cn(
                          `
                            w-full
                            flex
                            items-center
                            gap-2.5
                            px-2.5
                            py-2
                            rounded-lg
                            text-sm
                            transition-colors
                          `,

                          active
                            ? `
                              bg-blue-50
                              dark:bg-blue-500/10
                              text-blue-700
                              dark:text-blue-400
                            `
                            : `
                              hover:bg-slate-50
                              dark:hover:bg-slate-800
                              text-slate-700
                              dark:text-slate-300
                            `
                        )}
                      >

                        {/* Icon */}

                        <div
                          className="
                            w-6
                            h-6
                            rounded-md
                            bg-gradient-to-br
                            from-blue-500
                            to-violet-500
                            flex
                            items-center
                            justify-center
                            text-white
                            text-xs
                            font-bold
                            shrink-0
                          "
                        >
                          {ws.name
                            ?.charAt(0)
                            ?.toUpperCase() || 'W'}
                        </div>


                        {/* Name + role */}

                        <div
                          className="
                            flex-1
                            min-w-0
                            text-left
                          "
                        >

                          <p className="font-medium truncate">
                            {ws.name}
                          </p>


                          {ws.role && (

                            <p
                              className="
                                text-[10px]
                                text-slate-400
                                capitalize
                              "
                            >
                              {ws.role}
                            </p>

                          )}

                        </div>


                        {/* Active check */}

                        {active && (

                          <Check
                            size={13}
                            className="
                              shrink-0
                              text-blue-500
                            "
                          />

                        )}

                      </button>

                    )

                  })}

                </div>

              )}

            </div>


            {/* =================================================
                CREATE WORKSPACE
            ================================================== */}

            <div
              className="
                border-t
                border-slate-100
                dark:border-slate-800
                p-1.5
              "
            >

              <button
                type="button"
                onClick={openCreateModal}
                className="
                  w-full
                  flex
                  items-center
                  gap-2
                  px-2.5
                  py-2
                  rounded-lg
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                  hover:bg-slate-50
                  dark:hover:bg-slate-800
                  transition-colors
                "
              >

                <Plus size={14} />

                <span>
                  New workspace
                </span>

              </button>

            </div>

          </div>

        </>

      )}


      {/* =====================================================
          CREATE WORKSPACE MODAL
      ====================================================== */}

      <Modal
        open={modal}
        onClose={() => {

          if (!saving) {

            setModal(false)

            reset()

          }

        }}
        title="New Workspace"
        description="Create a separate workspace for different finance tracking"
        size="sm"
      >

        <form
          onSubmit={handleSubmit(handleCreate)}
          className="space-y-4"
        >

          <Input
            label="Workspace name"
            placeholder="e.g. Personal, Business"
            error={errors.name?.message}
            disabled={saving}
            autoFocus
            {...register('name')}
          />


          <div className="flex gap-2.5">

            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={saving}
              onClick={() => {

                setModal(false)

                reset()

              }}
            >
              Cancel
            </Button>


            <Button
              type="submit"
              className="flex-1"
              loading={saving}
              disabled={saving}
            >
              Create
            </Button>

          </div>

        </form>

      </Modal>

    </div>
  )
}