import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { useEffect, useState } from 'react'
import { initReactI18next } from 'react-i18next'

interface Props {
  children?: JSX.Element
}

function TranslationGate(props: Props): JSX.Element | null {
  const { children = null } = props
  const [showChildren, setShowChildren] = useState(false)

  useEffect(() => {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: 'en',
        debug: false,
        interpolation: {
          escapeValue: false,
        },
      })
      .then(() => {
        setShowChildren(true)
      })
    i18n.addResourceBundle('en', 'translation', require('../../locales/en.json'))
  }, [])

  return showChildren ? children : null
}

export default TranslationGate
