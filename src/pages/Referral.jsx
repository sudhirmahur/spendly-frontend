import { useState } from 'react'
import { useReferral } from '../hooks'
import { useAuthStore } from '../store'
import {
  Card,
  EmptyState,
  Avatar,
  Badge,
  Button,
  Skeleton,
  StatCard,
} from '../components/ui'

import {
  Copy,
  Check,
  Gift,
  Users,
  RefreshCw,
  TrendingUp,
  Share2,
  Star,
  Link2,
  ChevronRight,
} from 'lucide-react'

import { formatDate, cn } from '../utils/helpers'
import toast from 'react-hot-toast'


/* =========================================================
   HOW IT WORKS
========================================================= */

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '🔗',
    title: 'Get your link',
    desc: 'Copy your unique referral link or code below',
  },
  {
    step: '02',
    icon: '📤',
    title: 'Share it',
    desc: 'Send it to friends via email, WhatsApp, or socials',
  },
  {
    step: '03',
    icon: '✅',
    title: 'Friend joins',
    desc: 'They sign up using your code during registration',
  },
  {
    step: '04',
    icon: '🚀',
    title: 'Auto workspace',
    desc: 'They automatically join your workspace',
  },
]


/* =========================================================
   COPY BOX
========================================================= */

function CopyBox({ label, value, mono, large }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)

      setCopied(true)
      toast.success('Copied to clipboard!')

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      toast.error('Unable to copy')
    }
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}

      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex-1 input bg-slate-50 dark:bg-slate-800/60 cursor-default truncate',
            mono &&
              'font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400',
            large && 'text-lg py-3'
          )}
        >
          {value || (
            <span className="text-slate-300 dark:text-slate-600">
              —
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={copy}
          disabled={!value}
          aria-label={`Copy ${label || 'value'}`}
          className={cn(
            'p-2.5 rounded-xl transition-all shrink-0 border',
            copied
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-200 dark:border-emerald-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 disabled:opacity-40'
          )}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  )
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Referral() {
  const { user } = useAuthStore()

  const {
    referral,
    referredUsers,
    stats,
    loading,
    refetch,
  } = useReferral()


  /* =======================================================
     REFERRAL DATA
  ======================================================= */

  const referralCode =
    referral?.code ||
    referral?.referralCode ||
    user?.referralCode ||
    ''


  /*
   * IMPORTANT:
   * Always generate the referral link from the current
   * website origin.
   *
   * Local:
   * http://localhost:3000/register?ref=XXXX
   *
   * Vercel:
   * https://your-app.vercel.app/register?ref=XXXX
   *
   * Custom domain:
   * https://yourdomain.com/register?ref=XXXX
   */

  const inviteLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : ''


  /* =======================================================
     STATS
  ======================================================= */

  const totalReferrals =
    stats?.totalReferrals ||
    stats?.total ||
    referredUsers.length


  const activeCount =
    stats?.activeUsers ||
    stats?.active ||
    referredUsers.filter(
      (u) => u.isActive !== false
    ).length


  /* =======================================================
     COPY INVITE LINK
  ======================================================= */

  const copyInviteLink = async () => {
    if (!inviteLink) {
      toast.error('Referral link is not ready yet')
      return
    }

    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Referral link copied!')
    } catch {
      toast.error('Unable to copy referral link')
    }
  }


  /* =======================================================
     WHATSAPP
  ======================================================= */

  const shareWhatsApp = () => {
    if (!inviteLink) {
      toast.error('Referral link is not ready yet')
      return
    }

    const message =
      `Hey! Join me on Spendly for smart expense tracking 💰\n${inviteLink}`

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }


  /* =======================================================
     EMAIL
  ======================================================= */

  const shareEmail = () => {
    if (!inviteLink) {
      toast.error('Referral link is not ready yet')
      return
    }

    const subject = 'Join me on Spendly!'
    const body =
      `Hey! I'm using Spendly for expense tracking. Join me using my referral link:\n\n${inviteLink}`

    window.location.href =
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }


  /* =======================================================
     TWITTER / X
  ======================================================= */

  const shareTwitter = () => {
    if (!inviteLink) {
      toast.error('Referral link is not ready yet')
      return
    }

    const text =
      `Track expenses smarter with Spendly! Join using my referral link: ${inviteLink}`

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }


  /* =======================================================
     NATIVE SHARE
  ======================================================= */

  const shareNative = async () => {
    if (!inviteLink) {
      toast.error('Referral link is not ready yet')
      return
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Spendly',
          text: 'Track your expenses smarter with Spendly.',
          url: inviteLink,
        })
      } catch {
        // User cancelled share dialog.
      }
    } else {
      await copyInviteLink()
    }
  }


  /* =======================================================
     HOW IT WORKS CLICK
  ======================================================= */

  const handleHowItWorksClick = async (index) => {
    switch (index) {
      case 0:
        // Get your link
        await copyInviteLink()
        break

      case 1:
        // Share it
        await shareNative()
        break

      case 2:
        // Friend joins
        document
          .getElementById('referral-details')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        break

      case 3:
        // Auto workspace
        document
          .getElementById('referred-users')
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        break

      default:
        break
    }
  }


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6 pb-8">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="page-header animate-in">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Gift
                size={16}
                className="text-blue-500"
              />
            </div>

            <h1 className="page-title">
              Referral Program
            </h1>
          </div>

          <p className="page-sub">
            Invite friends · Grow your workspace · Track your impact
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={13} />}
          onClick={refetch}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>


      {/* ===================================================
          STATS
      =================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in stagger-1">

        <StatCard
          label="Total Referrals"
          value={String(totalReferrals)}
          icon={<Users size={16} />}
          accent="blue"
          loading={loading}
        />

        <StatCard
          label="Active Members"
          value={String(activeCount)}
          icon={<Star size={16} />}
          accent="green"
          loading={loading}
        />

        <div className="col-span-2 sm:col-span-1">
          <StatCard
            label="Your Code"
            value={
              loading
                ? '—'
                : referralCode || '—'
            }
            icon={<Gift size={16} />}
            accent="violet"
            loading={loading}
            subvalue={
              referralCode
                ? 'Share this code'
                : 'Loading…'
            }
          />
        </div>

      </div>


      {/* ===================================================
          HOW IT WORKS
      =================================================== */}

      <Card className="animate-in stagger-2">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">
            <TrendingUp
              size={16}
              className="text-blue-500"
            />

            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              How it works
            </h2>
          </div>

          <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400">
            Click a step
            <ChevronRight size={12} />
          </span>

        </div>


        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {HOW_IT_WORKS.map((s, i) => (

            <div
              key={i}
              className="relative"
            >

              {/* Connecting line */}

              {i < HOW_IT_WORKS.length - 1 && (
                <div
                  className="
                    hidden sm:block
                    absolute
                    top-5
                    left-[calc(100%-8px)]
                    w-full
                    h-px
                    border-t-2
                    border-dashed
                    border-slate-200
                    dark:border-slate-700
                    z-0
                  "
                />
              )}


              {/* Clickable Card */}

              <button
                type="button"
                onClick={() =>
                  handleHowItWorksClick(i)
                }
                className="
                  relative
                  z-10
                  w-full
                  text-center
                  bg-slate-50
                  dark:bg-slate-800/50
                  rounded-xl
                  p-3.5
                  border
                  border-slate-100
                  dark:border-slate-800
                  hover:border-blue-200
                  dark:hover:border-blue-500/30
                  hover:bg-blue-50/50
                  dark:hover:bg-blue-500/5
                  hover:-translate-y-0.5
                  active:translate-y-0
                  transition-all
                  duration-200
                  cursor-pointer
                  group
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500/30
                "
              >

                <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 mb-2 tracking-widest">
                  {s.step}
                </p>

                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                  {s.icon}
                </div>

                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                  {s.title}
                </p>

                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  {s.desc}
                </p>

                <div className="mt-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-medium text-blue-500">
                    {i === 0 && 'Copy link'}
                    {i === 1 && 'Share'}
                    {i === 2 && 'View details'}
                    {i === 3 && 'View members'}
                  </span>
                </div>

              </button>

            </div>

          ))}

        </div>

      </Card>


      {/* ===================================================
          REFERRAL DETAILS
      =================================================== */}

      <Card
        id="referral-details"
        className="animate-in stagger-3"
      >

        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Gift
                size={16}
                className="text-blue-500"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Your referral details
              </h2>

              <p className="text-[10px] text-slate-400 mt-0.5">
                Share your code or invite link
              </p>
            </div>

          </div>

        </div>


        {loading ? (

          <div className="space-y-4">

            <Skeleton className="h-12 w-full" />

            <Skeleton className="h-12 w-full" />

          </div>

        ) : (

          <div className="space-y-5">

            {/* Referral Code */}

            <CopyBox
              label="Referral code"
              value={referralCode}
              mono
              large
            />


            {/* Invite Link */}

            <CopyBox
              label="Invite link"
              value={inviteLink}
            />


            {/* Share buttons */}

            <div>

              <label className="label">
                Share via
              </label>

              <div className="flex gap-2 flex-wrap">

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Share2 size={13} />}
                  onClick={copyInviteLink}
                  disabled={!inviteLink}
                >
                  Copy link
                </Button>


                <Button
                  variant="secondary"
                  size="sm"
                  onClick={shareWhatsApp}
                  disabled={!inviteLink}
                >
                  <span className="text-base">
                    💬
                  </span>

                  WhatsApp
                </Button>


                <Button
                  variant="secondary"
                  size="sm"
                  onClick={shareEmail}
                  disabled={!inviteLink}
                >
                  <span className="text-base">
                    📧
                  </span>

                  Email
                </Button>


                <Button
                  variant="secondary"
                  size="sm"
                  onClick={shareTwitter}
                  disabled={!inviteLink}
                >
                  <span className="text-base">
                    🐦
                  </span>

                  Twitter
                </Button>

              </div>

            </div>


            {/* Info banner */}

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">

              <div className="flex items-start gap-3">

                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Link2
                    size={15}
                    className="text-blue-500"
                  />
                </div>

                <div>

                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    About workspace referrals
                  </p>

                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                    When someone signs up with your code,
                    they automatically join your workspace
                    and see shared transactions.
                    If they refer others, a brand new
                    workspace is created — each referral
                    chain stays isolated.
                  </p>

                </div>

              </div>

            </div>

          </div>

        )}

      </Card>


      {/* ===================================================
          REFERRED USERS
      =================================================== */}

      <Card
        id="referred-users"
        className="animate-in stagger-4"
      >

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Users
                size={16}
                className="text-slate-500"
              />
            </div>

            <div>

              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                People you referred
              </h2>

              <p className="text-[10px] text-slate-400 mt-0.5">
                Members who joined using your referral
              </p>

            </div>

          </div>


          {referredUsers.length > 0 && (
            <Badge variant="blue">
              {referredUsers.length} total
            </Badge>
          )}

        </div>


        {loading ? (

          <div className="space-y-3">

            {[...Array(3)].map((_, i) => (

              <div
                key={i}
                className="flex items-center gap-3 py-2"
              >

                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />

                <div className="flex-1 space-y-2">

                  <Skeleton className="h-3.5 w-36" />

                  <Skeleton className="h-2.5 w-24" />

                </div>

                <Skeleton className="h-5 w-14 rounded-lg" />

              </div>

            ))}

          </div>

        ) : referredUsers.length === 0 ? (

          <EmptyState
            icon="🎯"
            title="No referrals yet"
            description="Share your referral link or code above. Friends who sign up using it will appear here."
            action={
              <Button
                variant="secondary"
                size="sm"
                icon={<Copy size={13} />}
                onClick={copyInviteLink}
                disabled={!inviteLink}
              >
                Copy invite link
              </Button>
            }
          />

        ) : (

          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">

            {referredUsers.map((u, i) => {

              const name =
                u.name ||
                u.user?.name ||
                'User'

              const email =
                u.email ||
                u.user?.email ||
                ''

              const date =
                u.createdAt ||
                u.joinedAt

              const isActive =
                u.isActive !== false


              return (

                <div
                  key={u._id || i}
                  className="
                    flex
                    items-center
                    gap-3
                    py-3.5
                    px-2
                    -mx-2
                    rounded-xl
                    hover:bg-slate-50
                    dark:hover:bg-slate-800/40
                    transition-colors
                  "
                >

                  <Avatar
                    name={name}
                    size="md"
                  />


                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {name}
                    </p>

                    <p className="text-xs text-slate-400 truncate">
                      {email}
                    </p>

                  </div>


                  <div className="text-right shrink-0 space-y-1">

                    <Badge
                      variant={
                        isActive
                          ? 'green'
                          : 'gray'
                      }
                      dot
                    >
                      {isActive
                        ? 'Active'
                        : 'Inactive'}
                    </Badge>

                    {date && (
                      <p className="text-[10px] text-slate-400 block">
                        {formatDate(date)}
                      </p>
                    )}

                  </div>

                </div>

              )

            })}

          </div>

        )}

      </Card>


      {/* ===================================================
          BOTTOM CTA
      =================================================== */}

      {!loading && inviteLink && (

        <div
          className="
            rounded-2xl
            border
            border-blue-100
            dark:border-blue-500/20
            bg-gradient-to-r
            from-blue-50
            via-indigo-50
            to-violet-50
            dark:from-blue-500/10
            dark:via-indigo-500/10
            dark:to-violet-500/10
            p-5
            sm:p-6
            animate-in
          "
        >

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>

              <div className="flex items-center gap-2 mb-1">

                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center">
                  <Share2
                    size={15}
                    className="text-blue-500"
                  />
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Ready to invite someone?
                </h3>

              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share your Spendly referral link and invite
                friends to your workspace.
              </p>

            </div>


            <Button
              size="sm"
              icon={<Share2 size={14} />}
              onClick={shareNative}
            >
              Share invite
            </Button>

          </div>

        </div>

      )}

    </div>
  )
}