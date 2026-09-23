import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(e) { return { hasError: true, error: e } }
  render() {
    if (this.state.hasError) return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-[#0a0a0f]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button className="btn-primary" onClick={() => { this.setState({ hasError: false }); window.location.reload() }}>
            Reload page
          </button>
        </div>
      </div>
    )
    return this.props.children
  }
}
