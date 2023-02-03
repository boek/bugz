import { type NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from 'react';
import Link from "next/link";

type BugType = 'defect' | 'enhancement' | 'task'
type Status = 'UNCONFIRMED' | 'NEW' | 'ASSIGNED' | 'RESOLVED'
type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | '--'
type Severity = 'S1' | 'S2' | 'S3' | 'S4'

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

const withBugsFiltered = (component : Component, priority : PrioritySelection) => {
  return {
    name: component.name,
    bugs: component.bugs.filter((b) => priority == 'All' ? true : b.priority == priority)
  }
}

const ComponentItem = ({ name, bugs }: Component, priority: PrioritySelection) => {
  const total = bugs.length

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

  const url = `https://bugzilla.mozilla.org/buglist.cgi?product=Fenix&component=${name}&resolution=---&list_id=16395189${priority == 'All' ? '': '&priority=' + priority}`

  return (
    <a
      key={name}
      className="p-2 bg-white/25 backdrop-blur-sm border border-white/20 rounded-lg m-2 shadow-sm cursor-pointer"
      href={url}
    >
      <span className="font-mono text-xl">{name}</span>

      <div className="flex items-center">
        <span className="text-xs pr-2 font-mono">{bugs.length}</span>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 shadow-gray-400/50 flex">
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

const Home: NextPage<HomePageProps> = ({ product, components }: HomePageProps) => {
  const [priortiy, setPriority] = useState<PrioritySelection>('All');
  const filteredComponents = components.map((c) => withBugsFiltered(c, priortiy))
  const isFenix = product == 'Fenix'
  const isFocus = product == 'Focus'
  const isGeckoView = product == 'GeckoView'
  console.log(filteredComponents.map(fc => fc.bugs.length))
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
        <div className="flex p-8 font-bold cursor-pointer">
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
        <h1 className="p-2 text-xl font-bold">{filteredComponents.map(fc => fc.bugs.length).reduce((x, y) => x + y, 0)}</h1>
        <ul className="grid grid-cols-2">
          {filteredComponents.map((fc) => ComponentItem(fc, priortiy))}
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
