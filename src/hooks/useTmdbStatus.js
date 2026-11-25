import { useSyncExternalStore } from 'react'
import { getConnectionStatus, subscribeConnectionStatus } from '../services/tmdb.js'

/** Live TMDB link status: 'connecting' | 'online' | 'error'. */
export default function useTmdbStatus() {
  return useSyncExternalStore(subscribeConnectionStatus, getConnectionStatus)
}
