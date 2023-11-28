import { type NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from 'react';
import Link from "next/link";

type BugType = 'defect' | 'enhancement' | 'task'
type Status = 'UNCONFIRMED' | 'NEW' | 'ASSIGNED' | 'RESOLVED'
type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | '--'
type Severity = 'S1' | 'S2' | 'S3' | 'S4' | '--'

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

const withBugsFiltered = (component : Component, priority : PrioritySelection, severity : SeveritySelection, bugType : BugTypeSelection) => {
  return {
    name: component.name,
    bugs: component.bugs.filter((b) => { 
      return (priority == 'All' ? true : b.priority == priority)
      && (severity == 'All' ? true : b.severity == severity)
      && (bugType == 'All' ? true : b.type == bugType)
    })
  }
}

function getLogarithmicPercentage(value : number, maxValue : number) {
  // Ensure value and maxValue are within the valid range
  value = Math.max(0, value);
  maxValue = Math.max(0, maxValue);

  // Calculate the logarithmic scale
  const logScale = Math.log(value + 1) / Math.log(10);
  const maxLogScale = Math.log(maxValue + 1) / Math.log(10);

  // Normalize the scale between 0 and 1
  const normalizedScale = logScale / maxLogScale;

  // Map the normalized scale to a percentage (0 to 100)
  const percentage = normalizedScale * 100;
  return percentage;
}


const ComponentItem = ({ name, bugs }: Component, priority: PrioritySelection, severity: SeveritySelection, bugType: BugTypeSelection, largest: number) => {
  const total = bugs.length
  const percent = getLogarithmicPercentage(total, largest)

  const defectSegment = {
    color: 'rose',
    count: bugs.filter(b => b.type == 'defect').length
  }
  const enhancementSegment = {
    color: 'emerald',
    count: bugs.filter(b => b.type == 'enhancement').length
  }
  const taskSegment = {
    color: 'sky',
    count: bugs.filter(b => b.type == 'task').length
  }

  const url = `https://bugzilla.mozilla.org/buglist.cgi?product=Fenix&component=${name}&resolution=---&list_id=16395189${priority == 'All' ? '': '&priority=' + priority}${severity == 'All' ? '' : '&bug_severity=' + severity}${bugType == 'All' ? '' : '&bug_type=' + bugType}`
  const style = {
    width: `${percent}%`
  }
  return (
    <a
      key={name}
      className="p-2 bg-white/25 backdrop-blur-sm border border-white/20 rounded-lg m-2 shadow-sm cursor-pointer"
      target="_blank"
      rel="noreferrer"
      href={url}
    >
      <span className="font-mono text-xl">{name}</span>

      <div className="flex items-center">
        <span className="text-xs pr-2 font-mono">{bugs.length}</span>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 shadow-gray-400/50 flex" style={style}>
          {[defectSegment, enhancementSegment, taskSegment].filter((x) => x.count > 0).map((segment) => {
            const style = { width: `${segment.count / total * 100}%` }
            const className = `bg-${segment.color}-400 h-2.5 last:rounded-r-full first:rounded-l-full shadow-sm shadow-${segment.color}-400/50`
            return (<div key={segment.color} className={className} style={style}></div>)
          })}
        </div>
      </div>
    </a>
  );
}


type PrioritySelection = 'All' | Priority
type SeveritySelection = 'All' | Severity
type BugTypeSelection = 'All' | BugType

const Home: NextPage<HomePageProps> = ({ product, components }: HomePageProps) => {
  const [priortiy, setPriority] = useState<PrioritySelection>('All');
  const [severity, setSeverity] = useState<SeveritySelection>('All');
  const [bugType, setBugType] = useState<BugTypeSelection>('All');
  const filteredComponents = components.map((c) => withBugsFiltered(c, priortiy, severity, bugType))
  const largest = filteredComponents.reduce(
    (acc, c) => acc > c.bugs.length ? acc : c.bugs.length, 0)
  const isFenix = product == 'Fenix'
  const isFocus = product == 'Focus'
  const isGeckoView = product == 'GeckoView'

  return (
    <>
      <Head>
        <title>bugz</title>
        <meta name="description" content="Fenix bugz" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b to-indigo-50 from-indigo-200 text-indigo-500">
        <div className="p-2 text-xl font-bold">
          <Link className={`p-2 ${isFenix ? 'text-indigo-800' : ''}`} href="/?product=Fenix">Fenix</Link>
          <Link className={`p-2 ${isFocus ? 'text-indigo-800' : ''}`} href="/?product=Focus">Focus</Link>
          <Link className={`p-2 ${isGeckoView ? 'text-indigo-800' : ''}`} href="/?product=GeckoView">GeckoView</Link>
        </div>
        <div className="flex gap-4">
          <div className="flex font-bold cursor-pointer">
            <div
            className={`border-indigo-800 border-y-4 border-l-4 rounded-l p-2 ${ priortiy == 'All' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setPriority('All')}>All</div>
            <div
            className={`border-indigo-800 border-y-4 p-2 ${ priortiy == 'P1' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setPriority('P1')}>P1</div>
            <div
            className={`border-indigo-800 border-y-4 p-2 ${ priortiy == 'P2' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setPriority('P2')}>P2</div>
            <div
            className={`border-indigo-800 border-y-4 p-2 ${ priortiy == 'P3' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setPriority('P3')}>P3</div>
            <div
            className={`border-indigo-800 border-y-4 p-2 ${ priortiy == 'P4' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setPriority('P4')}>P4</div>
            <div
            className={`border-indigo-800 border-y-4 p-2 ${ priortiy == 'P5' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setPriority('P5')}>P5</div>
            <div
            className={`border-indigo-800 border-y-4 border-r-4 rounded-r p-2 ${ priortiy == '--' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setPriority('--')}>--</div>
          </div>
          <div className="flex font-bold cursor-pointer">
            <div
            className={`border-indigo-800 border-y-4 border-l-4 rounded-l p-2 ${ severity == 'All' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setSeverity('All')}>All</div>
            <div
            className={`border-indigo-800 border-y-4 p-2 ${ severity == 'S1' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setSeverity('S1')}>S1</div>
            <div
            className={`border-indigo-800 border-y-4 p-2 ${ severity == 'S2' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setSeverity('S2')}>S2</div>
            <div
            className={`border-indigo-800 border-y-4 p-2 ${ severity == 'S3' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setSeverity('S3')}>S3</div>
            <div
            className={`border-indigo-800 border-y-4 border-r-4 rounded-r p-2 ${ severity == '--' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setSeverity('--')}>--</div>
          </div>
          <div className="flex font-bold cursor-pointer">
            <div
            className={`border-indigo-800 border-y-4 border-l-4 rounded-l p-2 ${ bugType == 'All' ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
            onClick={() => setBugType('All')}>All</div>
            <div
            className={`border-indigo-800 border-y-4 p-2 ${ bugType == 'defect' ? 'bg-rose-500 text-white' : 'hover:bg-rose-500 hover:text-white text-rose-500' }`}
            onClick={() => setBugType('defect')}>Defect</div>
            <div
            className={`border-indigo-800 border-y-4 p-2 ${ bugType == 'enhancement' ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-500 hover:text-white text-emerald-500' }`}
            onClick={() => setBugType('enhancement')}>Enhancement</div>
            <div
            className={`border-indigo-800 border-y-4 border-r-4 rounded-r p-2 ${ bugType == 'task' ? 'bg-sky-500 text-white' : 'hover:bg-sky-500 hover:text-white text-sky-500' }`}
            onClick={() => setBugType('task')}>Task</div>
          </div>
        </div>
        <h1 className="p-2 text-xl font-bold">{filteredComponents.map(fc => fc.bugs.length).reduce((x, y) => x + y, 0)}</h1>
        <ul className="grid grid-cols-2">
          {filteredComponents.map((fc) => ComponentItem(fc, priortiy, severity, bugType, largest))}
        </ul>
      </main>
    </>
  );
};

async function getBugs(component: string): Promise<Component> {
  const res = await fetch(`https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status,type,severity,priority&component=${component}&product=Fenix&resolution=---`)
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
  const product: string = (context.query.product || 'Fenix') as string
  const res = await fetch(`https://bugzilla.mozilla.org/rest/product?names=${product}`)
  const components = await res.json()
  const cnames: CName[] = components.products[0].components
  const data = await Promise.all(cnames.map((c) => c.name).map(getBugs))
  return {
    props: {
      product: product,
      components: data
    }
  }
}


export default Home;
