import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '../store'
import { cn } from '../utils/helpers'
import WorkspaceSwitcher from '../components/workspace/WorkspaceSwitcher'
import {
  LayoutDashboard, ArrowUpDown, Tag, Users, Gift, User,
  Sun, Moon, LogOut, Menu, X, Wallet, Bell, Settings,
  TrendingUp, ChevronRight,
} from 'lucide-react'

// Most-used sections for the mobile bottom nav; everything else lives behind
// the "More" tab, which opens the full slide-in sidebar.
const BOTTOM_NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Home'   },
  { to: '/transactions', icon: ArrowUpDown,      label: 'Activity' },
  { to: '/categories',   icon: Tag,              label: 'Categories' },
  { to: '/referral',     icon: Gift,             label: 'Referral' },
]

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500'   },
      { to: '/transactions', icon: ArrowUpDown,      label: 'Transactions', color: 'text-violet-500' },
      { to: '/categories',   icon: Tag,              label: 'Categories', color: 'text-amber-500' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/members',  icon: Users, label: 'Members',  color: 'text-emerald-500' },
      { to: '/referral', icon: Gift,  label: 'Referral', color: 'text-pink-500'    },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', icon: User, label: 'Profile', color: 'text-slate-500' },
    ],
  },
]

function NavItem({ to, icon: Icon, label, color, onClick }) {
  return (
    <NavLink to={to} onClick={onClick}
      className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}>
      <Icon size={16} className={cn('shrink-0 transition-colors', 'group-hover:text-current')} />
      <span className="flex-1 font-medium">{label}</span>
    </NavLink>
  )
}

function SidebarContent({ onClose }) {
  const { user, logout }   = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate           = useNavigate()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-glow">
          <Wallet size={15} className="text-white"/>
        </div>
        <div>
          <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">Spendly</p>
          <p className="text-[10px] text-slate-400 leading-tight">Finance Tracker</p>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close menu" className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 lg:hidden">
            <X size={16}/>
          </button>
        )}
      </div>

      {/* Workspace */}
      <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1">Workspace</p>
        <WorkspaceSwitcher/>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1.5 px-3">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => <NavItem key={item.to} {...item} onClick={() => onClose?.()} />)}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
        <button onClick={toggle} className="nav-link w-full">
          {isDark ? <Sun size={16} className="shrink-0"/> : <Moon size={16} className="shrink-0"/>}
          <span className="font-medium">{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button onClick={() => { logout(); navigate('/login') }}
          className="nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
          <LogOut size={16} className="shrink-0"/>
          <span className="font-medium">Sign out</span>
        </button>
        {/* User chip */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppLayout({ children }) {
  const { isDark, toggle } = useThemeStore()
  const { user }           = useAuthStore()
  const [open, setOpen]    = useState(false)

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0a0a0f]">
      {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setOpen(false)}/>}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-60 z-20 bg-white dark:bg-[#0d0d14] border-r border-slate-100 dark:border-slate-800">
        <SidebarContent/>
      </aside>

      {/* Mobile sidebar */}
      <aside className={cn('fixed top-0 left-0 h-full w-64 z-40 flex flex-col bg-white dark:bg-[#0d0d14] border-r border-slate-100 dark:border-slate-800 transition-transform duration-300 lg:hidden',
        open ? 'translate-x-0' : '-translate-x-full')}>
        <SidebarContent onClose={() => setOpen(false)}/>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-14 flex items-center gap-3 px-5 bg-white/80 dark:bg-[#0d0d14]/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="btn-ghost btn-icon rounded-xl text-slate-500 lg:hidden">
            <Menu size={18}/>
          </button>
          <div className="flex-1"/>
          <button onClick={toggle} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className="btn-ghost btn-icon rounded-xl text-slate-500 hidden lg:flex">
            {isDark ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer" role="img" aria-label={`${user?.name || 'User'} avatar`}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 pb-24 md:p-6 lg:p-8 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch bg-white/90 dark:bg-[#0d0d14]/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 pb-[env(safe-area-inset-bottom,0px)]" aria-label="Bottom navigation">
        {BOTTOM_NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
            )}>
            {({ isActive }) => (
              <>
                <Icon size={19} strokeWidth={isActive ? 2.3 : 2} aria-hidden="true" />
                <span aria-current={isActive ? 'page' : undefined}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button onClick={() => setOpen(true)} aria-label="More menu"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
          <Menu size={19} />
          <span>More</span>
        </button>
      </nav>
    </div>
  )
}
