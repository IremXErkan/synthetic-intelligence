import { useEffect } from 'react'

const SITE_NAME = 'Synthetic Intelligence'

/**
 * Sets the browser tab title, e.g. "Ex Machina · Synthetic Intelligence".
 * Screen readers and browser history use it to tell pages apart.
 * Pass null to leave the title unchanged (e.g. while data is loading).
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    if (title === null || title === undefined) return
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME
  }, [title])
}
