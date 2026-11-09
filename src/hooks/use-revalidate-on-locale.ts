import { useLingui } from '@lingui/react/macro'
import { useEffect, useRef } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

// Validation messages are produced by the resolver at validation time, so
// errors already on screen keep the old language. Re-run validation for the
// fields that currently show an error whenever the locale changes.
export function useRevalidateOnLocale<T extends FieldValues>({
  formState,
  trigger,
}: Pick<UseFormReturn<T>, 'formState' | 'trigger'>) {
  const { i18n } = useLingui()
  const previous = useRef(i18n.locale)
  const { errors } = formState

  useEffect(() => {
    if (previous.current === i18n.locale) return
    previous.current = i18n.locale
    const fields = Object.keys(errors).filter((name) => name !== 'root')
    if (fields.length) void trigger(fields as never)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.locale])
}
