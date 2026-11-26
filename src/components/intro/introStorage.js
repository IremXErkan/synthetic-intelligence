// "Intro already seen" flag. localStorage can throw (privacy mode, blocked
// storage); in that case we treat the intro as seen so it never blocks the site.
const KEY = 'si.introSeen'

export function hasSeenIntro() {
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

export function markIntroSeen() {
  try {
    window.localStorage.setItem(KEY, '1')
  } catch {
    // Storage unavailable: nothing to remember, nothing to break.
  }
}
