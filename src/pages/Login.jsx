import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks'
import { Button, Input } from '../components/ui'
import {
  Eye,
  EyeOff,
  Wallet,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react'


// =====================================================
// FORM VALIDATION
// =====================================================

const schema = z.object({
  email: z
    .string()
    .email('Enter a valid email'),

  password: z
    .string()
    .min(6, 'At least 6 characters'),
})


// =====================================================
// FEATURES
// =====================================================

const FEATURES = [
  {
    icon: <TrendingUp size={16} />,
    title: 'Real-time analytics',
    desc: 'Track income and expenses with live charts',
  },
  {
    icon: <Shield size={16} />,
    title: 'Workspace isolation',
    desc: 'Separate dashboards for each workspace',
  },
  {
    icon: <Zap size={16} />,
    title: 'Referral rewards',
    desc: 'Invite friends and grow your workspace',
  },
]


// =====================================================
// LOGIN PAGE
// =====================================================

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const [showPass, setShowPass] = useState(false)


  // ===================================================
  // FORM
  // ===================================================

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      email: '',
      password: '',
    },
  })


  // ===================================================
  // SUBMIT
  // ===================================================

  const onSubmit = async (data) => {
    const ok = await login(data)

    if (ok) {
      navigate('/dashboard')
    }
  }


  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0a0a0f]">

      {/* =================================================
          LEFT PANEL
      ================================================= */}

      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 flex-col justify-between p-12 relative overflow-hidden">

        {/* Background Effects */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          }}
        />

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />


        {/* Logo */}
        <div className="relative flex items-center gap-3">

          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
            <Wallet
              size={20}
              className="text-white"
            />
          </div>

          <div>
            <p className="font-bold text-white text-lg leading-tight">
              Spendly
            </p>

            <p className="text-blue-200 text-xs">
              Workspace Finance
            </p>
          </div>

        </div>


        {/* Content */}
        <div className="relative space-y-6">

          <div>
            <h2 className="text-4xl font-bold text-white leading-snug">
              Track every dollar,
              <br />
              grow every goal.
            </h2>

            <p className="text-blue-200 text-base mt-3 leading-relaxed max-w-sm">
              Workspace-based finance tracking with shared dashboards and powerful analytics.
            </p>
          </div>


          {/* Features */}
          <div className="space-y-3">

            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 bg-white/8 rounded-xl px-4 py-3 border border-white/10 backdrop-blur-sm"
              >

                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-white shrink-0 mt-0.5">
                  {feature.icon}
                </div>

                <div>
                  <p className="text-white font-semibold text-sm">
                    {feature.title}
                  </p>

                  <p className="text-blue-200 text-xs mt-0.5">
                    {feature.desc}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </div>


        {/* Footer */}
        <p className="relative text-blue-300 text-xs">
          © 2026  Spendly. Built with ❤️
        </p>

      </div>


      {/* =================================================
          RIGHT PANEL
      ================================================= */}

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">

        <div className="w-full max-w-sm">


          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Wallet
                size={17}
                className="text-white"
              />
            </div>

            <p className="font-bold text-slate-900 dark:text-white">
              Spendly
            </p>

          </div>


          {/* Heading */}
          <div className="mb-8">

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back
            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Sign in to your account to continue
            </p>

          </div>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >

            {/* Email */}
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />


            {/* Password */}
            <div className="space-y-1.5">

              <label className="label">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input pr-11 ${
                    errors.password
                      ? 'input-error'
                      : ''
                  }`}
                  {...register('password')}
                />


                {/* Password Toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPass((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
                  aria-label={
                    showPass
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPass ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

              </div>


              {/* Password Error */}
              {errors.password && (
                <p className="field-error">
                  ⚠ {errors.password.message}
                </p>
              )}

            </div>


            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              Sign in

              {!loading && (
                <ArrowRight size={16} />
              )}
            </Button>

          </form>


          {/* Register Link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">

            Don't have an account?{' '}

            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Create one free
            </Link>

          </p>

        </div>

      </div>

    </div>
  )
}
