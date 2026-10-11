import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 text-xl font-bold text-gray-900 no-underline">
            DoAide <span className="text-da mx-0.5 font-normal">|</span> <span className="text-da font-semibold">Poll</span>
          </Link>
          <Link
            to="/create"
            className="bg-da hover:bg-da-dark text-white font-semibold px-5 py-2 rounded-lg transition-colors no-underline text-sm"
          >
            Create Poll
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center">
            <span className="bg-da/10 text-da px-3 py-1 rounded-full text-xs font-medium">A DoAide Product</span>
          </div>
          <p className="text-sm">
            <Link to="/" className="text-da hover:text-da-dark no-underline font-semibold">
              DoAide | Poll
            </Link>
            {' '}&mdash; Free polls & surveys for everyone.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <a href="https://doaide.com" className="hover:text-gray-300 no-underline">doaide.com</a>
            <span>&middot;</span>
            <a href="https://poll.doaide.com" className="hover:text-gray-300 no-underline">Poll</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
