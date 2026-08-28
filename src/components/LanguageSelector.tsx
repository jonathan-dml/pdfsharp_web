import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '../i18n'

export function LanguageSelector() {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const currentLanguage = i18n.language.startsWith('pt') ? 'pt' : 'en'

  const changeLanguage = (language: keyof typeof supportedLanguages) => {
    void i18n.changeLanguage(language)
    setIsOpen(false)
  }

  return <div className="language-selector"><button className="language-button" type="button" aria-label={t('language')} aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}><span className="language-translate-icon" aria-hidden="true"><span>文</span><span>A</span></span><span className="language-current">{currentLanguage.toUpperCase()}</span></button>{isOpen && <ul className="language-menu" role="listbox" aria-label={t('language')}>{(Object.keys(supportedLanguages) as Array<keyof typeof supportedLanguages>).map((language) => <li key={language}><button className={`language-option${currentLanguage === language ? ' selected' : ''}`} type="button" role="option" aria-selected={currentLanguage === language} onClick={() => changeLanguage(language)}><span>{supportedLanguages[language]}</span><span>{language.toUpperCase()}</span></button></li>)}</ul>}</div>
}