import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  useAuthStore,
  useWorkspaceStore,
} from '../store'

import {
  useAuth,
  useTransactions,
} from '../hooks'

import {
  Card,
  Button,
  Input,
  Avatar,
  Badge,
  Tabs,
  Modal,
} from '../components/ui'

import {
  formatCurrency,
  cn,
} from '../utils/helpers'

import {
  User,
  Lock,
  LogOut,
  ShieldCheck,
  Wallet,
  Building2,
  Copy,
  Check,
  IndianRupee,
  Mail,
  CalendarDays,
  Users,
  ChevronRight,
  Settings,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'


// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'At least 2 characters'),

  email: z
    .string()
    .email('Valid email required'),
})


const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, 'At least 6 characters'),

    newPassword: z
      .string()
      .min(6, 'At least 6 characters'),

    confirmPassword: z.string(),
  })
  .refine(
    (d) =>
      d.newPassword ===
      d.confirmPassword,
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  )


// ─────────────────────────────────────────────────────────────
// Currency helper
// ─────────────────────────────────────────────────────────────

function RupeeAmount({
  amount,
  size = 13,
  className = '',
}) {
  const formatted = formatCurrency(amount)
    .replace(/[₹$€£]/g, '')
    .trim()

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 whitespace-nowrap',
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
// Small section header
// ─────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-3 mb-6">

      <div
        className="
          w-9 h-9 rounded-xl
          bg-blue-50
          dark:bg-blue-500/10
          border border-blue-100
          dark:border-blue-500/20
          flex items-center justify-center
          shrink-0
        "
      >
        {icon}
      </div>

      <div className="min-w-0">

        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h2>

        {description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {description}
          </p>
        )}

      </div>

    </div>
  )
}


// ─────────────────────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────────────────────

export default function Profile() {

  const { user } = useAuthStore()

  const {
    currentWorkspace,
    workspaces,
  } = useWorkspaceStore()

  const {
    updateProfile,
    logout,
    loading,
  } = useAuth()

  const { summary } =
    useTransactions()

  const navigate = useNavigate()


  const [tab, setTab] =
    useState('profile')

  const [codeCopied, setCodeCopied] =
    useState(false)

  const [logoutModal, setLogoutModal] =
    useState(false)

  const [pwLoading, setPwLoading] =
    useState(false)


  // ───────────────────────────────────────────────────────────
  // Financial summary
  // ───────────────────────────────────────────────────────────

  const totalIncome =
    summary?.totalIncome || 0

  const totalExpense =
    summary?.totalExpense || 0

  const balance =
    summary?.balance ??
    (totalIncome - totalExpense)


  // ───────────────────────────────────────────────────────────
  // Profile form
  // ───────────────────────────────────────────────────────────

  const {
    register: rp,
    handleSubmit: sp,
    formState: {
      errors: pe,
    },
  } = useForm({

    resolver:
      zodResolver(profileSchema),

    defaultValues: {
      name:
        user?.name || '',

      email:
        user?.email || '',
    },

  })


  // ───────────────────────────────────────────────────────────
  // Password form
  // ───────────────────────────────────────────────────────────

  const {
    register: rw,
    handleSubmit: sw,
    reset: resetPw,
    formState: {
      errors: we,
    },
  } = useForm({

    resolver:
      zodResolver(passwordSchema),

  })


  // ───────────────────────────────────────────────────────────
  // Copy referral
  // ───────────────────────────────────────────────────────────

  const copyCode = async () => {

    if (!user?.referralCode) {
      return
    }

    try {

      await navigator.clipboard.writeText(
        user.referralCode
      )

      setCodeCopied(true)

      toast.success(
        'Referral code copied!'
      )

      setTimeout(
        () => setCodeCopied(false),
        2000
      )

    } catch {

      toast.error(
        'Unable to copy referral code'
      )
    }
  }


  // ───────────────────────────────────────────────────────────
  // Tabs
  // ───────────────────────────────────────────────────────────

  const PROFILE_TABS = [
    {
      value: 'profile',
      label: 'Profile',
      icon: <User size={14} />,
    },

    {
      value: 'security',
      label: 'Security',
      icon: <Lock size={14} />,
    },

    {
      value: 'account',
      label: 'Account',
      icon: <Wallet size={14} />,
    },
  ]


  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (

    <div className="max-w-4xl space-y-6">


      {/* ═══════════════════════════════════════════════════════
          PAGE HEADER
      ═══════════════════════════════════════════════════════ */}

      <div className="animate-in">

        <div className="flex items-center gap-2">

          <Settings
            size={17}
            className="text-blue-500"
          />

          <h1 className="page-title">
            Account settings
          </h1>

        </div>

        <p className="page-sub">
          Manage your profile, security and workspace preferences
        </p>

      </div>


      {/* ═══════════════════════════════════════════════════════
          PROFILE HERO
      ═══════════════════════════════════════════════════════ */}

      <Card className="!p-0 overflow-hidden animate-in stagger-1">

        {/* Top accent */}
        <div
          className="
            h-1
            bg-gradient-to-r
            from-blue-500
            via-indigo-500
            to-violet-500
          "
        />


        <div className="p-5 sm:p-6">


          {/* User */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            <div className="relative shrink-0">

              <Avatar
                name={user?.name}
                size="xl"
              />

              <span
                className="
                  absolute
                  -bottom-0.5
                  -right-0.5
                  w-4 h-4
                  rounded-full
                  bg-emerald-500
                  border-2
                  border-white
                  dark:border-slate-900
                "
              />

            </div>


            <div className="flex-1 min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h2
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                    dark:text-white
                    truncate
                  "
                >
                  {user?.name || 'User'}
                </h2>

                {currentWorkspace?.role ===
                  'owner' && (
                  <Badge variant="violet">
                    Owner
                  </Badge>
                )}

              </div>


              <div className="flex items-center gap-1.5 mt-1">

                <Mail
                  size={12}
                  className="text-slate-400"
                />

                <p className="text-sm text-slate-400 truncate">
                  {user?.email}
                </p>

              </div>


              <div className="flex items-center gap-2 mt-3 flex-wrap">

                {currentWorkspace && (
                  <Badge
                    variant="blue"
                    dot
                  >
                    {currentWorkspace.name}
                  </Badge>
                )}

                <Badge
                  variant="green"
                  dot
                >
                  Active
                </Badge>

                {user?.createdAt && (

                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">

                    <CalendarDays
                      size={11}
                    />

                    Member since{' '}

                    {format(
                      new Date(
                        user.createdAt
                      ),
                      'MMM yyyy'
                    )}

                  </span>

                )}

              </div>

            </div>

          </div>


          {/* Financial stats */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-2.5
              mt-6
              pt-5
              border-t
              border-slate-100
              dark:border-slate-800
            "
          >

            {/* Balance */}
            <div
              className="
                p-3.5
                rounded-xl
                bg-blue-50/70
                dark:bg-blue-500/[0.07]
                border
                border-blue-100
                dark:border-blue-500/10
              "
            >

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Balance
              </p>

              <RupeeAmount
                amount={balance}
                size={13}
                className={cn(
                  'text-base font-bold font-mono mt-1',
                  balance >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              />

            </div>


            {/* Income */}
            <div
              className="
                p-3.5
                rounded-xl
                bg-emerald-50/70
                dark:bg-emerald-500/[0.07]
                border
                border-emerald-100
                dark:border-emerald-500/10
              "
            >

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Total income
              </p>

              <RupeeAmount
                amount={totalIncome}
                size={13}
                className="
                  text-base
                  font-bold
                  font-mono
                  mt-1
                  text-emerald-600
                  dark:text-emerald-400
                "
              />

            </div>


            {/* Expense */}
            <div
              className="
                p-3.5
                rounded-xl
                bg-red-50/70
                dark:bg-red-500/[0.07]
                border
                border-red-100
                dark:border-red-500/10
              "
            >

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Total expenses
              </p>

              <RupeeAmount
                amount={totalExpense}
                size={13}
                className="
                  text-base
                  font-bold
                  font-mono
                  mt-1
                  text-red-600
                  dark:text-red-400
                "
              />

            </div>

          </div>


          {/* Referral */}
          {user?.referralCode && (

            <div
              className="
                mt-4
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
                p-3.5
                rounded-xl
                bg-slate-50
                dark:bg-slate-800/40
                border
                border-slate-100
                dark:border-slate-800
              "
            >

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <Users
                    size={14}
                    className="text-blue-500"
                  />

                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Referral code
                  </p>

                </div>

                <p
                  className="
                    font-mono
                    font-bold
                    text-blue-600
                    dark:text-blue-400
                    tracking-[0.18em]
                    mt-1
                  "
                >
                  {user.referralCode}
                </p>

              </div>


              <button
                onClick={copyCode}
                className={cn(
                  `
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    h-9
                    px-3
                    rounded-lg
                    border
                    text-xs
                    font-semibold
                    transition-all
                  `,

                  codeCopied
                    ? `
                      bg-emerald-50
                      dark:bg-emerald-500/10
                      border-emerald-200
                      dark:border-emerald-500/30
                      text-emerald-600
                      dark:text-emerald-400
                    `
                    : `
                      bg-white
                      dark:bg-slate-800
                      border-slate-200
                      dark:border-slate-700
                      text-slate-600
                      dark:text-slate-300
                      hover:bg-slate-100
                      dark:hover:bg-slate-700
                    `
                )}
              >

                {codeCopied ? (
                  <Check size={14} />
                ) : (
                  <Copy size={14} />
                )}

                {codeCopied
                  ? 'Copied'
                  : 'Copy code'}

              </button>

            </div>

          )}

        </div>

      </Card>


      {/* ═══════════════════════════════════════════════════════
          TABS
      ═══════════════════════════════════════════════════════ */}

      <div className="animate-in stagger-2">

        <Tabs
          tabs={PROFILE_TABS}
          active={tab}
          onChange={setTab}
        />

      </div>


      {/* ═══════════════════════════════════════════════════════
          PROFILE TAB
      ═══════════════════════════════════════════════════════ */}

      {tab === 'profile' && (

        <Card className="animate-in">

          <SectionHeader
            icon={
              <User
                size={16}
                className="text-blue-500"
              />
            }
            title="Personal information"
            description="Update the information associated with your account."
          />


          <form
            onSubmit={sp(updateProfile)}
            className="space-y-5"
          >

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              "
            >

              <Input
                label="Full name"
                error={
                  pe.name?.message
                }
                {...rp('name')}
                placeholder="Your full name"
              />

              <Input
                label="Email address"
                type="email"
                error={
                  pe.email?.message
                }
                {...rp('email')}
                placeholder="your@email.com"
              />

            </div>


            {user?.referralCode && (

              <div className="space-y-1.5">

                <label className="label">
                  Referral code
                </label>

                <div
                  className="
                    input
                    flex
                    items-center
                    bg-slate-50
                    dark:bg-slate-800/60
                    font-mono
                    font-bold
                    text-blue-600
                    dark:text-blue-400
                    tracking-widest
                    cursor-default
                  "
                >
                  {user.referralCode}
                </div>

                <p className="text-xs text-slate-400">
                  Share this code with friends to invite them to your workspace.
                </p>

              </div>

            )}


            <div className="pt-1">

              <Button
                type="submit"
                loading={loading}
                icon={
                  <Check size={14} />
                }
              >
                Save changes
              </Button>

            </div>

          </form>

        </Card>

      )}


      {/* ═══════════════════════════════════════════════════════
          SECURITY TAB
      ═══════════════════════════════════════════════════════ */}

      {tab === 'security' && (

        <Card className="animate-in">

          <SectionHeader
            icon={
              <Lock
                size={16}
                className="text-blue-500"
              />
            }
            title="Password & security"
            description="Keep your account protected with a strong password."
          />


          <form
            onSubmit={sw(
              async (data) => {

                setPwLoading(true)

                try {

                  await new Promise(
                    (resolve) =>
                      setTimeout(
                        resolve,
                        700
                      )
                  )

                  toast.success(
                    'Password updated!'
                  )

                  resetPw()

                } finally {

                  setPwLoading(false)

                }
              }
            )}
            className="space-y-5"
          >

            <Input
              label="Current password"
              type="password"
              placeholder="••••••••"
              error={
                we.currentPassword
                  ?.message
              }
              {...rw(
                'currentPassword'
              )}
            />


            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              "
            >

              <Input
                label="New password"
                type="password"
                placeholder="••••••••"
                error={
                  we.newPassword
                    ?.message
                }
                {...rw(
                  'newPassword'
                )}
              />

              <Input
                label="Confirm password"
                type="password"
                placeholder="••••••••"
                error={
                  we.confirmPassword
                    ?.message
                }
                {...rw(
                  'confirmPassword'
                )}
              />

            </div>


            {/* Password info */}
            <div
              className="
                flex
                items-start
                gap-3
                p-3.5
                rounded-xl
                bg-blue-50
                dark:bg-blue-500/[0.07]
                border
                border-blue-100
                dark:border-blue-500/20
              "
            >

              <div
                className="
                  w-7 h-7
                  rounded-lg
                  bg-blue-100
                  dark:bg-blue-500/15
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <ShieldCheck
                  size={15}
                  className="text-blue-500"
                />
              </div>


              <div>

                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  Password requirements
                </p>

                <p className="text-xs text-blue-600/80 dark:text-blue-400 mt-1">
                  Use at least 6 characters. A combination of letters and numbers is recommended.
                </p>

              </div>

            </div>


            <Button
              type="submit"
              loading={pwLoading}
              icon={
                <Lock size={14} />
              }
            >
              Update password
            </Button>

          </form>

        </Card>

      )}


      {/* ═══════════════════════════════════════════════════════
          ACCOUNT TAB
      ═══════════════════════════════════════════════════════ */}

      {tab === 'account' && (

        <div className="space-y-4 animate-in">


          {/* Workspaces */}
          <Card>

            <SectionHeader
              icon={
                <Building2
                  size={16}
                  className="text-blue-500"
                />
              }
              title="Your workspaces"
              description="Workspaces you currently belong to."
            />


            {workspaces.length === 0 ? (

              <div
                className="
                  p-4
                  rounded-xl
                  bg-slate-50
                  dark:bg-slate-800/40
                  border
                  border-slate-100
                  dark:border-slate-800
                  text-center
                "
              >

                <Building2
                  size={20}
                  className="
                    mx-auto
                    text-slate-300
                    dark:text-slate-600
                  "
                />

                <p className="text-xs text-slate-400 mt-2">
                  No workspaces found.
                </p>

              </div>

            ) : (

              <div className="space-y-2">

                {workspaces.map((ws) => {

                  const isActive =
                    ws._id ===
                    currentWorkspace?._id

                  return (

                    <div
                      key={ws._id}
                      className={cn(
                        `
                          flex
                          items-center
                          gap-3
                          p-3.5
                          rounded-xl
                          border
                          transition-all
                        `,

                        isActive
                          ? `
                            bg-blue-50
                            dark:bg-blue-500/[0.07]
                            border-blue-200
                            dark:border-blue-500/25
                          `
                          : `
                            bg-slate-50
                            dark:bg-slate-800/40
                            border-slate-100
                            dark:border-slate-800
                            hover:border-slate-200
                            dark:hover:border-slate-700
                          `
                      )}
                    >

                      {/* Workspace avatar */}
                      <div
                        className={cn(
                          `
                            w-9 h-9
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            text-white
                            text-xs
                            font-bold
                            shrink-0
                          `,

                          isActive
                            ? 'bg-blue-600'
                            : 'bg-slate-400 dark:bg-slate-700'
                        )}
                      >
                        {ws.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>


                      {/* Info */}
                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-2">

                          <p
                            className={cn(
                              'text-sm font-semibold truncate',
                              isActive
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-slate-700 dark:text-slate-200'
                            )}
                          >
                            {ws.name}
                          </p>

                        </div>

                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                          {ws.role ||
                            'member'}
                        </p>

                      </div>


                      {/* Status */}
                      {isActive ? (

                        <Badge
                          variant="blue"
                          dot
                        >
                          Active
                        </Badge>

                      ) : (

                        <ChevronRight
                          size={15}
                          className="text-slate-300 dark:text-slate-600"
                        />

                      )}

                    </div>

                  )
                })}

              </div>

            )}

          </Card>


          {/* Danger zone */}
          <Card
            className="
              border-red-100
              dark:border-red-500/20
            "
          >

            <div className="flex items-start gap-3 mb-4">

              <div
                className="
                  w-9 h-9
                  rounded-xl
                  bg-red-50
                  dark:bg-red-500/10
                  border
                  border-red-100
                  dark:border-red-500/20
                  flex
                  items-center
                  justify-center
                "
              >
                <LogOut
                  size={16}
                  className="text-red-500"
                />
              </div>


              <div>

                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Sign out
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  End your current Spendly session.
                </p>

              </div>

            </div>


            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
                p-3.5
                rounded-xl
                bg-red-50/70
                dark:bg-red-500/[0.06]
                border
                border-red-100
                dark:border-red-500/15
              "
            >

              <div>

                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Sign out of your account
                </p>

                <p className="text-xs text-slate-400 mt-0.5">
                  You'll be redirected to the login page.
                </p>

              </div>


              <Button
                variant="danger"
                size="sm"
                icon={
                  <LogOut size={13} />
                }
                onClick={() =>
                  setLogoutModal(true)
                }
              >
                Sign out
              </Button>

            </div>

          </Card>

        </div>

      )}


      {/* ═══════════════════════════════════════════════════════
          LOGOUT MODAL
      ═══════════════════════════════════════════════════════ */}

      <Modal
        open={logoutModal}
        onClose={() =>
          setLogoutModal(false)
        }
        title="Sign out"
        description="Are you sure you want to sign out of Spendly?"
        size="sm"
      >

        <div className="flex gap-2.5 mt-2">

          <Button
            variant="secondary"
            className="flex-1"
            onClick={() =>
              setLogoutModal(false)
            }
          >
            Stay signed in
          </Button>


          <Button
            variant="danger"
            className="flex-1"
            icon={
              <LogOut size={14} />
            }
            onClick={() => {

              logout()

              navigate('/login')

            }}
          >
            Sign out
          </Button>

        </div>

      </Modal>

    </div>
  )
}