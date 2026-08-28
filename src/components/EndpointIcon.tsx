import type { EndpointIconName } from './endpoints'

export function EndpointIcon({ name }: { name: EndpointIconName }) {
  const paths: Record<EndpointIconName, string> = {
    merge: 'M5 4h8l4 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM13 4v4h4M19 13v7m-3.5-3.5h7',
    split: 'M5 4h8l3 3v10H5V4ZM9 8h8l3 3v9H9V8ZM13 4v3h3M17 8v3h3',
    extract: 'M12 3v12m0 0-4-4m4 4 4-4M5 20h14',
    delete: 'M5 7h14M10 11v5m4-5v5M8 7l1-3h6l1 3m-9 0 1 14h8l1-14',
    rotate: 'M5 9a7 7 0 1 1 2 8M5 9V4m0 5h5',
    reorder: 'M4 7h16M4 12h16M4 17h16M7 4 4 7l3 3',
    copy: 'M8 8V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3M6 8h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z',
  }

  return <svg className="tool-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={paths[name]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}