import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/router";

type BugType = 'defect' | 'enhancement' | 'task'
type Status = 'UNCONFIRMED' | 'NEW' | 'ASSIGNED' | 'RESOLVED'
type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | '--'
type Severity = 'S1' | 'S2' | 'S3' | 'S4' | '--'
type Team = 'core' | 'discovery' | 'activation' | 'foundations'
type Group = Team | '--'

type Bug = {
  id: number
  status: Status
  type: BugType
  priority: Priority
  severity: Severity
}

type Component = {
  name: string
  bugs: Bug[]
}

type HomePageProps = {
  product: string
  components: Component[]
}

type PrioritySelection = 'All' | Priority
type SeveritySelection = 'All' | Severity
type BugTypeSelection = 'All' | BugType
type GroupSelection = 'All' | Group
type SortOrder = 'count' | 'name'
type ViewMode = 'grid' | 'table'

type Filters = {
  priority: PrioritySelection
  severity: SeveritySelection
  bugType: BugTypeSelection
}

const products = [
  { label: 'Fenix', product: 'Firefox for Android' },
  { label: 'Focus', product: 'Focus' },
  { label: 'GeckoView', product: 'GeckoView' },
]

const teams: { id: Team, name: string }[] = [
  { id: 'core', name: 'Core Browser Experience' },
  { id: 'discovery', name: 'Discovery & Engagement' },
  { id: 'activation', name: 'Activation & Trust' },
  { id: 'foundations', name: 'Android Tech Foundations' },
]

const groupComponents: Record<Team, string[]> = {
  'core': ['Toolbar', 'Menu', 'Bookmarks', 'History', 'Settings', 'Tabs', 'Downloads', 'Reader Mode', 'Contextual AI'],
  'discovery': ['Homepage', 'Search', 'Stories', 'Top Sites', 'Collections'],
  'activation': ['Onboarding', 'Accounts and Sync', 'Autofill', 'Logins', 'WebAuthn', 'Privacy', 'WebExtensions', 'Extensions', 'App Links', 'Share', 'Experimentation and Telemetry'],
  'foundations': ['Browser Engine', 'Performance', 'Crash Reporting', 'Media', 'IME', 'PDF Viewer', 'Tooling', 'UI Tests'],
}

const bugTypes: { type: BugType, label: string, plural: string, color: string }[] = [
  { type: 'defect', label: 'Defect', plural: 'Defects', color: 'var(--series-defect)' },
  { type: 'enhancement', label: 'Enhancement', plural: 'Enhancements', color: 'var(--series-enhancement)' },
  { type: 'task', label: 'Task', plural: 'Tasks', color: 'var(--series-task)' },
]

const teamFor = (componentName: string) =>
  teams.find((t) => groupComponents[t.id].includes(componentName))

const withBugsFiltered = (component : Component, { priority, severity, bugType } : Filters) => {
  return {
    name: component.name,
    bugs: component.bugs.filter((b) => {
      return (priority == 'All' ? true : b.priority == priority)
      && (severity == 'All' ? true : b.severity == severity)
      && (bugType == 'All' ? true : b.type == bugType)
    })
  }
}

const withGroupFiltered = (component : Component, group: GroupSelection) => {
  if (group == 'All') { return true }
  if (group == '--') {
    return !Object.values(groupComponents).some((names) => names.includes(component.name))
  }

  return groupComponents[group].includes(component.name)
}

const bugzillaUrl = (product: string, component: string, { priority, severity, bugType }: Filters) => {
  const params = new URLSearchParams({ product, component, resolution: '---' })
  if (priority != 'All') { params.set('priority', priority) }
  if (severity != 'All') { params.set('bug_severity', severity) }
  if (bugType != 'All') { params.set('bug_type', bugType) }
  return `https://bugzilla.mozilla.org/buglist.cgi?${params.toString()}`
}

const countByType = (bugs: Bug[]) =>
  bugTypes.map((t) => ({ ...t, count: bugs.filter((b) => b.type == t.type).length }))

type SegmentedProps<T extends string> = {
  label: string
  options: { value: T, label: string }[]
  value: T
  onChange: (value: T) => void
}

const Segmented = <T extends string>({ label, options, value, onChange }: SegmentedProps<T>) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</span>
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
      {options.map((option) => {
        const selected = option.value == value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              selected
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  </div>
)

const StatTile = ({ label, value, detail, color }: { label: string, value: number, detail?: string, color?: string }) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
      {color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      {label}
    </div>
    <div className="mt-1 flex items-baseline gap-2">
      <span className="text-3xl font-semibold text-zinc-900 dark:text-white">{value.toLocaleString()}</span>
      {detail && <span className="text-sm text-zinc-500 dark:text-zinc-400">{detail}</span>}
    </div>
  </div>
)

const TeamBadge = ({ name }: { name: string }) => {
  const team = teamFor(name)
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
      team
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
    }`}>
      {team ? team.name : 'Unassigned'}
    </span>
  )
}

const StackedBar = ({ bugs, largest }: { bugs: Bug[], largest: number }) => {
  const segments = countByType(bugs).filter((s) => s.count > 0)
  const width = largest == 0 ? 0 : bugs.length / largest * 100
  return (
    <div className="flex h-4">
      <div className="flex h-4 gap-[2px]" style={{ width: `${width}%` }}>
        {segments.map((segment, i) => (
          <div
            key={segment.type}
            className="group relative flex h-4 items-center"
            style={{ flexGrow: segment.count, flexBasis: 0, minWidth: 2 }}
          >
            <div
              className={`h-2 w-full ${i == segments.length - 1 ? 'rounded-r' : ''}`}
              style={{ background: segment.color }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block dark:bg-zinc-700">
              {segment.count.toLocaleString()} {segment.count == 1 ? segment.label.toLowerCase() : segment.plural.toLowerCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const ComponentCard = ({ product, component, filters, largest }: { product: string, component: Component, filters: Filters, largest: number }) => {
  const { name, bugs } = component
  return (
    <a
      className="group/card flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
      target="_blank"
      rel="noreferrer"
      href={bugzillaUrl(product, name, filters)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-zinc-900 dark:text-white">{name}</h2>
          <div className="mt-1"><TeamBadge name={name} /></div>
        </div>
        <div className="flex items-center gap-1 text-2xl font-semibold text-zinc-900 dark:text-white">
          {bugs.length.toLocaleString()}
          <svg className="h-4 w-4 text-zinc-400 opacity-0 transition group-hover/card:opacity-100" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
        </div>
      </div>
      <StackedBar bugs={bugs} largest={largest} />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {countByType(bugs).map((t) => (
          <span key={t.type} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
            <span className="tabular-nums text-zinc-700 dark:text-zinc-300">{t.count}</span> {t.plural}
          </span>
        ))}
      </div>
    </a>
  )
}

const ComponentTable = ({ product, components, filters }: { product: string, components: Component[], filters: Filters }) => (
  <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <table className="w-full text-left text-sm">
      <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <tr>
          <th className="px-4 py-3 font-medium">Component</th>
          <th className="px-4 py-3 font-medium">Team</th>
          {bugTypes.map((t) => (
            <th key={t.type} className="px-4 py-3 text-right font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                {t.plural}
              </span>
            </th>
          ))}
          <th className="px-4 py-3 text-right font-medium">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {components.map((c) => (
          <tr key={c.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
            <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-white">
              <a className="hover:text-indigo-600 hover:underline dark:hover:text-indigo-400" target="_blank" rel="noreferrer" href={bugzillaUrl(product, c.name, filters)}>{c.name}</a>
            </td>
            <td className="px-4 py-2.5"><TeamBadge name={c.name} /></td>
            {countByType(c.bugs).map((t) => (
              <td key={t.type} className="px-4 py-2.5 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{t.count.toLocaleString()}</td>
            ))}
            <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-zinc-900 dark:text-white">{c.bugs.length.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const useRouteLoading = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const start = () => setLoading(true)
    const stop = () => setLoading(false)
    router.events.on('routeChangeStart', start)
    router.events.on('routeChangeComplete', stop)
    router.events.on('routeChangeError', stop)
    return () => {
      router.events.off('routeChangeStart', start)
      router.events.off('routeChangeComplete', stop)
      router.events.off('routeChangeError', stop)
    }
  }, [router])
  return loading
}

const Home: NextPage<HomePageProps> = ({ product, components }: HomePageProps) => {
  const [priority, setPriority] = useState<PrioritySelection>('All');
  const [severity, setSeverity] = useState<SeveritySelection>('All');
  const [bugType, setBugType] = useState<BugTypeSelection>('All');
  const [group, setGroup] = useState<GroupSelection>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('count');
  const [view, setView] = useState<ViewMode>('grid');
  const loading = useRouteLoading()

  const filters: Filters = { priority, severity, bugType }
  const filteredComponents = components
    .filter((c) => withGroupFiltered(c, group))
    .filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
    .map((c) => withBugsFiltered(c, filters))
    .sort((a, b) => sort == 'name' ? a.name.localeCompare(b.name) : b.bugs.length - a.bugs.length || a.name.localeCompare(b.name))
  const largest = filteredComponents.reduce(
    (acc, c) => acc > c.bugs.length ? acc : c.bugs.length, 0)
  const allBugs = filteredComponents.flatMap((c) => c.bugs)
  const typeTotals = countByType(allBugs)
  const hasFilters = priority != 'All' || severity != 'All' || bugType != 'All' || group != 'All' || query != ''

  const resetFilters = () => {
    setPriority('All')
    setSeverity('All')
    setBugType('All')
    setGroup('All')
    setQuery('')
  }

  return (
    <>
      <Head>
        <title>{`bugz · ${product}`}</title>
        <meta name="description" content="Fenix bugz" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loading && <div className="fixed inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-indigo-500" />}
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-[#09090b]/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">b</span>
              <span className="text-lg font-semibold tracking-tight">bugz</span>
            </div>
            <nav className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {products.map((p) => {
                const active = p.product == product
                return (
                  <Link
                    key={p.product}
                    href={{ pathname: '/', query: { product: p.product } }}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    {p.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </header>

        <main className={`mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 transition-opacity sm:px-6 ${loading ? 'opacity-50' : ''}`}>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{product}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Open bugs by component</p>
          </div>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Open bugs" value={allBugs.length} detail={`in ${filteredComponents.length} components`} />
            {typeTotals.map((t) => (
              <StatTile
                key={t.type}
                label={t.plural}
                value={t.count}
                color={t.color}
                detail={allBugs.length ? `${Math.round(t.count / allBugs.length * 100)}%` : undefined}
              />
            ))}
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap gap-x-6 gap-y-4">
              <Segmented
                label="Team"
                value={group}
                onChange={setGroup}
                options={[
                  { value: 'All', label: 'All' },
                  ...teams.map((t) => ({ value: t.id, label: t.name })),
                  { value: '--', label: 'Unassigned' },
                ]}
              />
              <Segmented
                label="Priority"
                value={priority}
                onChange={setPriority}
                options={(['All', 'P1', 'P2', 'P3', 'P4', 'P5', '--'] as PrioritySelection[]).map((p) => ({ value: p, label: p }))}
              />
              <Segmented
                label="Severity"
                value={severity}
                onChange={setSeverity}
                options={(['All', 'S1', 'S2', 'S3', 'S4', '--'] as SeveritySelection[]).map((s) => ({ value: s, label: s }))}
              />
              <Segmented
                label="Type"
                value={bugType}
                onChange={setBugType}
                options={[{ value: 'All', label: 'All' }, ...bugTypes.map((t) => ({ value: t.type, label: t.label }))]}
              />
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search components"
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <div className="flex items-center gap-3">
              {hasFilters && (
                <button type="button" onClick={resetFilters} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Reset filters
                </button>
              )}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
                aria-label="Sort components"
                className="rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-8 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              >
                <option value="count">Most bugs</option>
                <option value="name">Name</option>
              </select>
              <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
                {(['grid', 'table'] as ViewMode[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={view == v}
                    className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                      view == v
                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {filteredComponents.length == 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No components match these filters.
            </div>
          ) : view == 'grid' ? (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredComponents.map((fc) => (
                <li key={fc.name} className="flex flex-col [&>a]:flex-1">
                  <ComponentCard product={product} component={fc} filters={filters} largest={largest} />
                </li>
              ))}
            </ul>
          ) : (
            <ComponentTable product={product} components={filteredComponents} filters={filters} />
          )}
        </main>
      </div>
    </>
  );
};

async function getBugs(product: string, component: string): Promise<Component> {
  const params = new URLSearchParams({
    include_fields: 'id,summary,status,type,severity,priority',
    component,
    product,
    resolution: '---',
  })
  const res = await fetch(`https://bugzilla.mozilla.org/rest/bug?${params.toString()}`)
  const bugs: Bug[] = (await res.json()).bugs

  return {
    name: component,
    bugs: bugs
  }
}

type CName = {
  name: string
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
  const product: string = (context.query.product || 'Firefox for Android') as string
  const res = await fetch(`https://bugzilla.mozilla.org/rest/product?names=${encodeURIComponent(product)}`)
  const components = await res.json()
  if (!components.products?.length) {
    return { notFound: true }
  }
  const cnames: CName[] = components.products[0].components
  const data = await Promise.all(cnames.map((c) => c.name).map((c) => getBugs(product, c)))
  return {
    props: {
      product: product,
      components: data
    }
  }
}


export default Home;
