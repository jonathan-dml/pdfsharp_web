export type EndpointIconName = 'merge' | 'split' | 'extract' | 'delete' | 'rotate' | 'reorder' | 'copy'

export type Endpoint = {
  id: string
  route: string
  translationKey: string
  icon: EndpointIconName
}

export const endpoints: Endpoint[] = [
  { id: 'merge', route: '/merge', translationKey: 'merge', icon: 'merge' },
  { id: 'split', route: '/split', translationKey: 'split', icon: 'split' },
  { id: 'extract', route: '/extract', translationKey: 'extract', icon: 'extract' },
  { id: 'delete', route: '/delete', translationKey: 'delete', icon: 'delete' },
  { id: 'rotate', route: '/rotate', translationKey: 'rotate', icon: 'rotate' },
  { id: 'reorder', route: '/reorder', translationKey: 'reorder', icon: 'reorder' },
  { id: 'copy', route: '/copy', translationKey: 'copy', icon: 'copy' },
]