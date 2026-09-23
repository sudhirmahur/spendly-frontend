import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks'
import { Button, Input } from '../components/ui'
import { useThemeStore } from '../store'
import { Wallet, ArrowRight } from 'lucide-react'

const schema = z.object({
  name           : z.string().min(2, 'At least 2 characters'),
  email          : z.string().email('Enter a valid email'),
  password       : z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string(),
  referralCode   : z.string().optional(),
}).refine(d => d.password === d.confirmPassword, { message:"Passwords don't match", path:['confirmPassword'] })

export default function Register() {
  const { register: doRegister, loading } = useAuth()
  const navigate     = useNavigate()
  const { init }     = useThemeStore()
  const [params]     = useSearchParams()
  const refFromUrl   = params.get('ref') || ''

  useEffect(() => { init() }, [])

  const { register, handleSubmit, formState:{errors} } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { referralCode: refFromUrl },
  })

  const onSubmit = async (data) => {
    const { confirmPassword, ...payload } = data
    if (!payload.referralCode) delete payload.referralCode
    const ok = await doRegister(payload)
    if (ok) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0a0a0f]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-violet-600 via-blue-600 to-blue-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 50%)'}}/>
        <div className="absolute top-0 left-0 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl"/>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
            <Wallet size={20} className="text-white"/>
          </div>
          <p className="font-bold text-white text-lg">Spendly</p>
        </div>
        <div className="relative space-y-5">
          <h2 className="text-4xl font-bold text-white leading-snug">Your finances,<br/>your workspace.</h2>
          <p className="text-violet-200 text-base leading-relaxed">Join and manage shared budgets, track expenses collaboratively, earn referral rewards.</p>
          <div className="space-y-2.5 pt-1">
            {[{e:'⚡',t:'Set up in under 2 minutes'},{e:'🔒',t:'JWT secured, data isolated'},{e:'🎁',t:'Invite friends with referral code'}].map(f=>(
              <div key={f.t} className="flex items-center gap-3">
                <span className="text-xl">{f.e}</span>
                <span className="text-white/80 text-sm">{f.t}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-violet-300 text-xs">Start free. No credit card required.</p>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-sm py-4">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Wallet size={17} className="text-white"/>
            </div>
            <p className="font-bold text-slate-900 dark:text-white">Spendly</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Start managing your finances today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full name"       placeholder="Alex Johnson"     error={errors.name?.message}            {...register('name')}/>
            <Input label="Email address"  type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')}/>
            <Input label="Password"       type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')}/>
            <Input label="Confirm password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')}/>
            <Input label="Referral code"  placeholder="ABCD1234" error={errors.referralCode?.message}
              hint="Optional — automatically join a friend's workspace" {...register('referralCode')}/>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create account {!loading && <ArrowRight size={16}/>}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
