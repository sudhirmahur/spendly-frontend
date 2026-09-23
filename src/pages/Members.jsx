import { useEffect, useState } from 'react'
import { useWorkspace } from '../hooks'
import { useWorkspaceStore, useAuthStore } from '../store'
import { Card, EmptyState, Avatar, Badge, Button, ConfirmDialog, Skeleton, Input } from '../components/ui'
import { Users, Crown, Trash2, RefreshCw, Search, Shield, UserCheck } from 'lucide-react'

export default function Members() {
  const { user }                              = useAuthStore()
  const { currentWorkspace }                 = useWorkspaceStore()
  const { members, loading, fetchMembers, removeMember } = useWorkspace()
  const [removeId,  setRemoveId]  = useState(null)
  const [removing,  setRemoving]  = useState(false)
  const [search,    setSearch]    = useState('')

  useEffect(() => { fetchMembers() }, [currentWorkspace?._id])

  const isOwner = currentWorkspace?.role === 'owner' ||
    (currentWorkspace?.owner && (currentWorkspace.owner === user?._id || currentWorkspace.owner?._id === user?._id))

  const handleRemove = async () => {
    setRemoving(true); try { await removeMember(removeId); setRemoveId(null) } finally { setRemoving(false) }
  }

  const filtered = members.filter((m) => {
    if (!search) return true
    const name  = (m.name  || m.user?.name  || '').toLowerCase()
    const email = (m.email || m.user?.email || '').toLowerCase()
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-5">
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-sub">{currentWorkspace?.name || 'Current'} workspace · {members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<RefreshCw size={13}/>} onClick={fetchMembers}>Refresh</Button>
        </div>
      </div>

      {/* Workspace card */}
      {currentWorkspace && (
        <Card className="animate-in stagger-1">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {currentWorkspace.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-800 dark:text-white">{currentWorkspace.name}</h3>
                {isOwner && <Badge variant="violet"><Crown size={10}/> Owner</Badge>}
                {!isOwner && <Badge variant="blue"><UserCheck size={10}/> Member</Badge>}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">ID: {currentWorkspace._id}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Shield size={12} className="text-slate-400"/>
                <p className="text-xs text-slate-400">
                  {isOwner ? 'You can manage and remove members from this workspace' : 'Contact the workspace owner to manage members'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search + list */}
      <Card className="animate-in stagger-2">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400"/>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Team members</h2>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input className="input-sm pl-8 w-48" placeholder="Search members…" value={search} onChange={(e) => setSearch(e.target.value)}/>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0"/>
                <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-36"/><Skeleton className="h-2.5 w-44"/></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="👥" title={search ? 'No members match' : 'No members found'}
            description={search ? 'Try a different search term' : 'Share your referral code to invite team members'}/>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {filtered.map((m) => {
              const memberId    = m._id || m.user?._id || m.userId
              const memberName  = m.name || m.user?.name || 'Unknown'
              const memberEmail = m.email || m.user?.email || ''
              const role        = m.role || 'member'
              const isSelf      = memberId === user?._id
              const mIsOwner    = role === 'owner'
              const joinedAt    = m.joinedAt || m.createdAt

              return (
                <div key={memberId} className="flex items-center gap-3 py-3.5">
                  <Avatar name={memberName} size="md"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{memberName}</p>
                      {isSelf    && <Badge variant="blue"  dot>You</Badge>}
                      {mIsOwner  && <Badge variant="violet"><Crown size={10}/> Owner</Badge>}
                      {!mIsOwner && !isSelf && <Badge variant="gray">Member</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{memberEmail}</p>
                    {joinedAt && <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">Joined {new Date(joinedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={mIsOwner?'violet':'gray'}>{role}</Badge>
                    {isOwner && !isSelf && !mIsOwner && (
                      <button onClick={() => setRemoveId(memberId)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {!isOwner && members.length > 0 && (
        <p className="text-xs text-center text-slate-400 animate-in stagger-3">
          Only workspace owners can remove members. Contact your owner if needed.
        </p>
      )}

      <ConfirmDialog open={!!removeId} onClose={() => setRemoveId(null)} onConfirm={handleRemove}
        title="Remove Member" description="This member will lose access to the workspace and its transactions." loading={removing}/>
    </div>
  )
}
