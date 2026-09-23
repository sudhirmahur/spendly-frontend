import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useThemeStore } from './store'
import ErrorBoundary     from './components/ErrorBoundary'
import ProtectedRoute    from './components/ProtectedRoute'
import AppLayout         from './layouts/AppLayout'
import Login             from './pages/Login'
import Register          from './pages/Register'
import Dashboard         from './pages/Dashboard'
import Transactions      from './pages/Transactions'
import Categories        from './pages/Categories'
import Members           from './pages/Members'
import Referral          from './pages/Referral'
import Profile           from './pages/Profile'

export default function App() {
  const { init } = useThemeStore()
  useEffect(() => { init() }, [])

  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background  : '#18181b',
            color       : '#f4f4f5',
            border      : '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            fontSize    : '13px',
            fontWeight  : 500,
            fontFamily  : 'Inter, system-ui, sans-serif',
            boxShadow   : '0 8px 32px rgba(0,0,0,0.24)',
            padding     : '10px 14px',
          },
          success : { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error   : { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login"    element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="dashboard"    element={<Dashboard/>}/>
                <Route path="transactions" element={<Transactions/>}/>
                <Route path="categories"   element={<Categories/>}/>
                <Route path="members"      element={<Members/>}/>
                <Route path="referral"     element={<Referral/>}/>
                <Route path="profile"      element={<Profile/>}/>
                <Route path="*"            element={<Navigate to="dashboard" replace/>}/>
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }/>
      </Routes>
    </ErrorBoundary>
  )
}
