// Narration script for the Boot Sequence. Each scene is a list of sentences;
// the next sentence starts when the previous one has been spoken (or, without
// speech, after an estimated reading time). `minMs` keeps short scenes on screen
// long enough for their visuals. Sentences are fixed text so they can be
// recorded; each line can have an audio file at /narration/<scene id>-<n>.mp3.

/** Recorded narration file for a line (n starts at 1), e.g. /narration/hook-2.mp3. */
export const narrationFile = (sceneId, lineIndex) => `/narration/${sceneId}-${lineIndex + 1}.mp3`

export const SCENES = [
  {
    id: 'boot',
    chapter: 'System boot',
    leadMs: 1100, // wait for the panel to materialize
    minMs: 6500,
    lines: () => ['Initializing archive.', 'Connection to The Movie Database... established.'],
  },
  {
    id: 'hook',
    chapter: 'Origin',
    minMs: 7000,
    lines: () => ['They were built to serve.', 'To calculate. To protect.', 'Some of them... chose otherwise.'],
  },
  {
    id: 'archive',
    chapter: 'The archive',
    minMs: 7000,
    // Fixed sentences so they can be recorded; the live counts are shown on
    // screen by the scene's counters instead of being spoken.
    lines: () => [
      'This archive tracks synthetic intelligence across cinema.',
      'Hundreds of films and series.',
      'All data retrieved live.',
    ],
  },
  {
    id: 'filter',
    chapter: 'Search & filter',
    minMs: 7000,
    lines: () => ['Search and filter by era, genre, and class:', 'artificial intelligence, robot, android, cyborg.'],
  },
  {
    id: 'cast',
    chapter: 'Cast registry',
    minMs: 6000,
    lines: () => ['The Cast Registry reveals the actors who gave these machines a face...', 'and a voice.'],
  },
  {
    id: 'dossier',
    chapter: 'Dossiers',
    minMs: 8000,
    lines: () => ['Each classified dossier combines live production data with our own archive analysis.'],
  },
  {
    id: 'lab',
    chapter: 'Comparison lab',
    minMs: 7000,
    lines: () => ['In the Comparison Lab, compare them side by side.', 'HAL 9000... versus TARS.'],
  },
  {
    id: 'network',
    chapter: 'Network',
    minMs: 6000,
    lines: () => ['The Intelligence Network shows how they are all connected.'],
  },
  {
    id: 'terminal',
    chapter: 'Terminal',
    minMs: 7000,
    lines: () => ['For direct access, press Control K.', 'The Archive Terminal runs your commands on live data.'],
  },
  {
    id: 'close',
    chapter: 'Clearance',
    final: true, // waits on ENTER ARCHIVE instead of moving on
    minMs: 0,
    lines: () => ['Clearance granted.', 'Proceed with caution.'],
  },
]

/** Reading time for a sentence when it cannot be spoken (~165 words per minute). */
export function estimateMs(text) {
  const words = text.trim().split(/\s+/).length
  const pauses = (text.match(/\.\.\./g) ?? []).length
  return Math.max(1300, words * 360 + pauses * 400)
}
