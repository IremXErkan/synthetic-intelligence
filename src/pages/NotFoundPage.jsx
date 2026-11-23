import { Link } from 'react-router'

// Placeholder: gets the themed "FILE NOT FOUND" design on day 2.
function NotFoundPage() {
  return (
    <section className="mx-auto max-w-3xl text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-red-400">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-100">File not found</h1>
      <Link to="/" className="mt-6 inline-block text-cyan-300 underline hover:text-cyan-200">
        Return to Command Center
      </Link>
    </section>
  )
}

export default NotFoundPage
