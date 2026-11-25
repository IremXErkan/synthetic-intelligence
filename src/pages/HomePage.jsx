import { useState } from 'react'
import { ENTITIES } from '../data/entities.js'
import HudPanel from '../components/common/HudPanel.jsx'
import HeroEntity from '../components/home/HeroEntity.jsx'
import LatestFeed from '../components/home/LatestFeed.jsx'
import QuickAccess from '../components/home/QuickAccess.jsx'
import FeaturedDossiers from '../components/home/FeaturedDossiers.jsx'
import ArchiveSearch from '../components/home/ArchiveSearch.jsx'

function randomIndex(exclude) {
  if (ENTITIES.length < 2) return 0
  let next = exclude
  while (next === exclude) next = Math.floor(Math.random() * ENTITIES.length)
  return next
}

/** Command Center: the dashboard landing page. */
function HomePage() {
  // A different featured entity on every visit; "Scan another" picks a new one.
  const [heroIndex, setHeroIndex] = useState(() => randomIndex(-1))

  return (
    <div className="relative">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[36rem] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.15fr_1fr]">
          {/* Intro + search */}
          <HudPanel variant="data" title="Command center" titleAs="p" brackets bodyClassName="p-6 sm:p-7">
            <p className="label-mono text-ink-muted">
              SEC-00 <span aria-hidden="true">//</span> Fictional AI &amp; Robotics Archive
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Synthetic Intelligence</h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Cinema has imagined thinking machines for a century: loyal companions, cold supercomputers, androids
              that want to be human and networks that decide we are the threat. This archive collects them.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Films, series and cast are pulled <span className="text-signal">live from TMDB</span>. The dossiers add
              an <span className="text-pulse">editorial analysis</span> layer: classification, capabilities and
              threat assessment.
            </p>
            <div className="mt-6 border-t border-line pt-5">
              <ArchiveSearch />
            </div>
          </HudPanel>

          {/* Featured entity */}
          <div className="lg:pt-2">
            <HeroEntity entity={ENTITIES[heroIndex]} onShuffle={() => setHeroIndex((i) => randomIndex(i))} />
          </div>

          {/* Live feed */}
          <LatestFeed />
        </div>

        <QuickAccess />
        <FeaturedDossiers />
      </div>
    </div>
  )
}

export default HomePage
