// Theme definition for the archive: which TMDB keywords make a title "synthetic
// intelligence" content. Every ID below was looked up with GET /search/keyword
// and confirmed with GET /keyword/{id} (verified 2026-11-25).
//
// TMDB discover semantics (verified): with_keywords "a|b" = OR (union),
// "a,b" = AND (intersection). Theme lists always use OR.

/**
 * Keyword groups. Each group is a sub-class the user can toggle on/off in the
 * list filters, so a noisy group can be switched off on its own.
 * Counts in comments: /discover/movie and /discover/tv total_results
 * (no vote threshold) at verification time.
 */
export const THEME_GROUPS = {
  ai: {
    label: 'AI',
    keywords: [
      { id: 310, name: 'artificial intelligence (a.i.)' }, // 757 movies / 177 tv
      { id: 3222, name: 'super computer' }, //                20 / 5
      { id: 155842, name: 'supercomputer' }, //               2 / 2
      { id: 298590, name: 'ai rebellion' }, //                7 / 1
      { id: 350730, name: 'rogue ai' }, //                    6 / 0
      { id: 385535, name: 'sentient ai' }, //                 2 / 0
      { id: 291207, name: 'sentient machine' }, //            6 / 6
      { id: 239670, name: 'virtual assistant' }, //           7 / 2
    ],
  },
  robot: {
    label: 'Robot',
    keywords: [
      { id: 14544, name: 'robot' }, //                        605 / 228
      { id: 1373, name: 'killer robot' }, //                  61 / 4
      { id: 220903, name: 'humanoid robot' }, //              27 / 7
      { id: 372143, name: 'sentient robot' }, //              3 / 0
    ],
  },
  android: {
    label: 'Android',
    keywords: [
      { id: 803, name: 'android' }, //                        181 / 82
      { id: 244653, name: 'synthetic android' }, //           7 / 1
      { id: 200055, name: 'synthetic human' }, //             6 / 0
    ],
  },
  cyborg: {
    label: 'Cyborg',
    keywords: [
      { id: 679, name: 'cyborg' }, //                         183 / 66
      { id: 239110, name: 'female cyborg' }, //               11 / 3
    ],
  },
}

// Deliberately NOT used (checked and rejected):
//   387896 "ai"              – 5 movies, mostly unrelated
//   331637 "artificial life" – 2 movies, mixed
//   288884 "human robot"     – unrelated romance titles
//   298669 "robot apocalypse"– 1 movie
//   209131 "humanoid"        – also tags aliens / primates
//   10891 "giant robot", 10046 "mecha" – piloted machines, mostly anime (+258/+436)

/** All group keys, in display order. */
export const THEME_GROUP_KEYS = Object.keys(THEME_GROUPS)

/**
 * Default minimum vote count for theme lists. At 50 the archive held
 * 407 movies / 141 tv (vs 1599 / 482 with no threshold); below that the
 * middle pages were dominated by 0-vote titles. Users can lower it to 0 with
 * the "Include low-vote titles" toggle.
 */
export const MIN_VOTE_COUNT = 50

/** TV genres excluded from theme lists: 10762 = Kids (Doraemon, Super Wings…). */
export const TV_EXCLUDED_GENRES = [10762]

/**
 * Builds the with_keywords value (OR) for the given groups.
 * Unknown keys are ignored; an empty/invalid selection falls back to all groups
 * so the archive never queries TMDB without a theme filter.
 * @param {string[]} groupKeys e.g. ['ai', 'android']
 * @returns {string} e.g. '310|3222|…|803|244653|200055'
 */
export function buildKeywordFilter(groupKeys = THEME_GROUP_KEYS) {
  const valid = groupKeys.filter((key) => key in THEME_GROUPS)
  const selected = valid.length > 0 ? valid : THEME_GROUP_KEYS
  return selected.flatMap((key) => THEME_GROUPS[key].keywords.map((k) => k.id)).join('|')
}
