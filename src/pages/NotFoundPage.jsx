import { Link, useLocation } from 'react-router'
import { FileX2 } from 'lucide-react'
import HudPanel from '../components/common/HudPanel.jsx'
import { DataList, DataRow } from '../components/common/DataRow.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

/** Themed 404 for unknown routes (and later for invalid detail IDs). */
// "Title not found" → "Title Not Found" for the browser tab.
const toTitleCase = (text) => text.replace(/\b\w/g, (letter) => letter.toUpperCase())

function NotFoundPage({ title = 'File not found', message }) {
  const { pathname } = useLocation()
  useDocumentTitle(toTitleCase(title))

  return (
    <div className="mx-auto flex max-w-7xl justify-center px-4 py-16 sm:px-6">
      <HudPanel variant="alert" title="Error 404" titleAs="p" brackets className="w-full max-w-xl" bodyClassName="px-6 py-10 sm:px-10">
        <div className="text-center">
          <FileX2 className="mx-auto size-10 text-threat-critical" aria-hidden="true" />
          <h1 className="mt-4 text-3xl font-bold text-ink">{title}</h1>
          <p className="mt-3 text-ink-muted">
            {message || 'No archive record exists at this location. It may have been moved, redacted or never existed.'}
          </p>
        </div>

        <DataList className="mt-6 border-t border-line pt-5">
          <DataRow label="Request" value={<span className="break-all font-mono text-xs">{pathname}</span>} variant="neutral" />
          <DataRow label="Status" value={<span className="label-mono text-threat-critical">Analysis failed</span>} variant="neutral" />
        </DataList>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="chamfer inline-block bg-signal/15 px-5 py-2 text-sm font-medium text-signal transition-colors [--cut:8px] hover:bg-signal/25"
          >
            Return to Command Center
          </Link>
        </div>
      </HudPanel>
    </div>
  )
}

export default NotFoundPage
