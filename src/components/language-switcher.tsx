import { useLingui } from '@lingui/react/macro'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { activateLocale, LOCALES, type Locale } from '@/i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useLingui()

  return (
    <Select
      value={i18n.locale}
      onValueChange={(value) => activateLocale(value as Locale)}
    >
      <SelectTrigger aria-label={t`Language`} className="w-32">
        <SelectValue>{LOCALES[i18n.locale as Locale]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LOCALES).map(([code, label]) => (
          <SelectItem key={code} value={code}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
