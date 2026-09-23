import { useState } from 'react'
import { useReferral } from '../hooks'
import { useAuthStore } from '../store'
import { Card, EmptyState, Avatar, Badge, Button, Skeleton, StatCard } from '../components/ui'
import { Copy, Check, Gift, Users, Link2, RefreshCw, TrendingUp, Share2, Star, ChevronRight } from 'lucide-react'
import { formatDate, cn } from '../utils/helpers'
import toast from 'react-hot-toast'

function CopyBox({ label, value, mono, large }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true); toast.success('Copied to clipboard!'); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-2">
        <div className={cn(
          'flex-1 input bg-slate-50 dark:bg-slate-800/60 cursor-default truncate',
          mono && 'font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400',
          large && 'text-lg py-3'
        )}>
          {value || <span className="text-slate-300">—</span>}
        </div>
        <button onClick={copy} disabled={!value}
          className={cn(
            'p-2.5 rounded-xl transition-all shrink-0 border',
            copied
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-200 dark:border-emerald-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 disabled:opacity-40'
          )}>
          {copied ? <Check size={15}/> : <Copy size={15}/>}
        </button>
      </div>
    </div>
  )
}

const HOW_IT_WORKS = [
  { step: '01', icon: '🔗', title: 'Get your link', desc: 'Copy your unique referral link or code below' },
  { step: '02', icon: '📤', title: 'Share it', desc: 'Send it to friends via email, WhatsApp, or socials' },
  { step: '03', icon: '✅', title: 'Friend joins', desc: 'They sign up using your code during registration' },
  { step: '04', icon: '🚀', title: 'Auto workspace', desc: 'They automatically join your workspace' },
]

export default function Referral() {
  const { user }                                      = useAuthStore()
  const { referral, referredUsers, stats, loading, refetch } = useReferral()

  const referralCode = referral?.code || referral?.referralCode || user?.referralCode || ''
  const inviteLink   = referral?.inviteLink || referral?.link ||
    (referralCode ? `${window.location.origin}/register?ref=${referralCode}` : '')

  const totalReferrals = stats?.totalReferrals || stats?.total || referredUsers.length
  const activeCount    = stats?.activeUsers    || stats?.active || referredUsers.filter(u => u.isActive !== false).length

  const shareWhatsApp = () => {
    if (!inviteLink) return
    window.open(`https://wa.me/?text=${encodeURIComponent(`Hey! Join me on Spendly for smart expense tracking 💰\n${inviteLink}`)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Referral Program</h1>
          <p className="page-sub">Invite friends · Grow your workspace · Track your impact</p>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCw size={13}/>} onClick={refetch}>Refresh</Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in stagger-1">
        <StatCard label="Total Referrals" value={String(totalReferrals)} icon={<Users size={16}/>}   accent="blue"   loading={loading}/>
        <StatCard label="Active Members"  value={String(activeCount)}    icon={<Star size={16}/>}    accent="green"  loading={loading}/>
        <div className="col-span-2 sm:col-span-1">
          <StatCard label="Your Code"
            value={loading ? '—' : (referralCode || '—')}
            icon={<Gift size={16}/>} accent="violet" loading={loading}
            subvalue={referralCode ? 'Share this code' : 'Loading…'}/>
        </div>
      </div>

      {/* How it works */}
      <Card className="animate-in stagger-2">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-blue-500"/>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">How it works</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={i} className="relative">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-[calc(100%-8px)] w-full h-px border-t-2 border-dashed border-slate-200 dark:border-slate-700 z-0"/>
              )}
              <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 text-center border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 mb-2 tracking-widest">{s.step}</p>
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">{s.title}</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Code + link */}
      <Card className="animate-in stagger-3">
        <div className="flex items-center gap-2 mb-5">
          <Gift size={16} className="text-blue-500"/>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your referral details</h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full"/>
            <Skeleton className="h-12 w-full"/>
          </div>
        ) : (
          <div className="space-y-5">
            <CopyBox label="Referral code" value={referralCode} mono large/>
            <CopyBox label="Invite link" value={inviteLink}/>

            {/* Share buttons */}
            <div>
              <label className="label">Share via</label>
              <div className="flex gap-2 flex-wrap">
                <Button variant="secondary" size="sm" icon={<Share2 size={13}/>}
                  onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Link copied!') }}>
                  Copy link
                </Button>
                <Button variant="secondary" size="sm"
                  onClick={shareWhatsApp}>
                  <span className="text-base">💬</span> WhatsApp
                </Button>
                <Button variant="secondary" size="sm"
                  onClick={() => window.open(`mailto:?subject=Join Spendly!&body=Hey! I'm using Spendly for expense tracking. Join with my link: ${inviteLink}`)}>
                  <span className="text-base">📧</span> Email
                </Button>
                <Button variant="secondary" size="sm"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Track expenses smarter with @Spendly! Join using my link: ${inviteLink}`)}`)}>
                  <span className="text-base">🐦</span> Twitter
                </Button>
              </div>
            </div>

            {/* Info banner */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <div className="flex items-start gap-3">
                <div className="text-xl mt-0.5">💡</div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">About workspace referrals</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                    When someone signs up with your code, they automatically join your workspace and see shared transactions.
                    If they refer others, a brand new workspace is created — each referral chain stays isolated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Referred users */}
      <Card className="animate-in stagger-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400"/>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">People you referred</h2>
          </div>
          {referredUsers.length > 0 && (
            <Badge variant="blue">{referredUsers.length} total</Badge>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0"/>
                <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-36"/><Skeleton className="h-2.5 w-24"/></div>
                <Skeleton className="h-5 w-14 rounded-lg"/>
              </div>
            ))}
          </div>
        ) : referredUsers.length === 0 ? (
          <EmptyState icon="🎯" title="No referrals yet"
            description="Share your referral link or code above. Friends who sign up using it will appear here."
            action={
              <Button variant="secondary" size="sm" icon={<Copy size={13}/>}
                onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Link copied!') }}>
                Copy invite link
              </Button>
            }/>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {referredUsers.map((u, i) => {
              const name    = u.name  || u.user?.name  || 'User'
              const email   = u.email || u.user?.email || ''
              const date    = u.createdAt || u.joinedAt
              const isActive = u.isActive !== false
              return (
                <div key={u._id || i} className="flex items-center gap-3 py-3.5">
                  <Avatar name={name} size="md"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
                    <p className="text-xs text-slate-400 truncate">{email}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <Badge variant={isActive ? 'green' : 'gray'} dot>{isActive ? 'Active' : 'Inactive'}</Badge>
                    {date && <p className="text-[10px] text-slate-400 block">{formatDate(date)}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
