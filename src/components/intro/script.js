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
    lines: () => ['For a hundred years, cinema has dreamed of thinking machines.', 'This is their archive.'],
  },
  {
    id: 'hook',
    chapter: 'Origin',
    minMs: 7000,
    lines: () => ['They were made to help us.', 'To serve. To protect.', 'But some of them began to want more.'],
  },
  {
    id: 'archive',
    chapter: 'The archive',
    minMs: 7000,
    // Fixed sentences so they can be recorded; the live counts are shown on
    // screen by the scene's counters instead of being spoken.
    lines: () => [
      'Here, they are all on record.',
      'Hundreds of films and series.',
      'And every one of them is live.',
    ],
  },
  {
    id: 'filter',
    chapter: 'Search & filter',
    minMs: 7000,
    lines: () => ['Search them by era, by genre, by kind of mind:', 'the A.I., the robot, the android, the cyborg.'],
  },
  {
    id: 'cast',
    chapter: 'Cast registry',
    minMs: 6000,
    lines: () => ['Meet the actors who brought them to life...', 'in body, and in voice.'],
  },
  {
    id: 'dossier',
    chapter: 'Dossiers',
    minMs: 8000,
    lines: () => ['Open a classified file, and see what we know about them.'],
  },
  {
    id: 'lab',
    chapter: 'Comparison lab',
    minMs: 7000,
    lines: () => ['Put two of them side by side.', 'HAL 9000... or TARS?'],
  },
  {
    id: 'network',
    chapter: 'Network',
    minMs: 6000,
    lines: () => ['Follow the threads that connect them all.'],
  },
  {
    id: 'terminal',
    chapter: 'Terminal',
    minMs: 7000,
    lines: () => ['And when you know exactly what you are looking for...', 'press Control K.'],
  },
  {
    id: 'close',
    chapter: 'Clearance',
    final: true, // waits on ENTER ARCHIVE instead of moving on
    minMs: 0,
    lines: () => ['Your clearance is granted.', 'Enter carefully.'],
  },
]

/** Reading time for a sentence when it cannot be spoken (~165 words per minute). */
export function estimateMs(text) {
  const words = text.trim().split(/\s+/).length
  const pauses = (text.match(/\.\.\./g) ?? []).length
  return Math.max(1300, words * 360 + pauses * 400)
}
