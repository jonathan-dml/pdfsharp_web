import type { Endpoint } from './endpoints'
import { useTranslation } from 'react-i18next'

export function EndpointContent({ endpoint }: { endpoint: Endpoint }) {
  const { t } = useTranslation()
  return <section className="tool-content" aria-labelledby="tool-title"><h1 id="tool-title">{t(`endpoints.${endpoint.translationKey}.name`)}</h1><p className="tool-description">{t(`endpoints.${endpoint.translationKey}.description`)}</p><div className="empty-panel" aria-label={t('endpointWorkspace')}><span className="empty-panel-mark">+</span><span>{t('workspaceReady')}</span></div></section>
}