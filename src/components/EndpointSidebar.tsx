import { EndpointIcon } from './EndpointIcon'
import type { Endpoint } from './endpoints'
import { useTranslation } from 'react-i18next'

type EndpointSidebarProps = { endpoints: Endpoint[]; selectedEndpoint: string; onSelect: (id: string) => void }

export function EndpointSidebar({ endpoints, selectedEndpoint, onSelect }: EndpointSidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className="sidebar">
      <div className="sidebar-heading"><span className="eyebrow">{t('tools')}</span><span className="tool-count">{String(endpoints.length).padStart(2, '0')}</span></div>
      <nav aria-label={t('pdfOperations')}>
        <ul className="tool-list">
          {endpoints.map((endpoint) => {
            const isSelected = endpoint.id === selectedEndpoint
            return <li key={endpoint.id}><button className={`tool-button${isSelected ? ' selected' : ''}`} type="button" aria-current={isSelected ? 'page' : undefined} onClick={() => onSelect(endpoint.id)}><EndpointIcon name={endpoint.icon} /><span className="tool-label">{t(`endpoints.${endpoint.translationKey}.name`)}</span></button></li>
          })}
        </ul>
      </nav>
    </aside>
  )
}