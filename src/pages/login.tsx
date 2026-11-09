import { zodResolver } from '@hookform/resolvers/zod'
import { useLingui } from '@lingui/react/macro'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRevalidateOnLocale } from '@/hooks/use-revalidate-on-locale'
import { AuthCard } from '@/components/auth/auth-card'
import { TextField } from '@/components/auth/text-field'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { login } from '@/lib/auth-api'
import { getLoginSchema, type LoginValues } from '@/lib/auth-schemas'
import { getRedirectParam, buildLinkWithRedirect } from '@/lib/redirect'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n, t } = useLingui()
  const redirect = getRedirectParam(location)
  const schema = getLoginSchema(i18n)
  const { control, handleSubmit, setError, trigger, formState } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  useRevalidateOnLocale({ formState, trigger })

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values)
      navigate(redirect || '/')
    } catch {
      setError('root', { type: 'server' })
    }
  }

  return (
    <AuthCard
      title={t`Welcome back`}
      description={t`Sign in to your account`}
      footerText={t`Don't have an account?`}
      footerLink={buildLinkWithRedirect('/register', redirect)}
      footerLabel={t`Sign up`}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <TextField control={control} name="email" label={t`Email`} type="email" autoComplete="email" />
          <TextField control={control} name="password" label={t`Password`} type="password" autoComplete="current-password" />
          {formState.errors.root && <FieldError>{t`Invalid email or password`}</FieldError>}
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? t`Signing in…` : t`Sign in`}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
