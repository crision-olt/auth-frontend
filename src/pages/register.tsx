import { zodResolver } from '@hookform/resolvers/zod'
import { useLingui } from '@lingui/react/macro'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from '@/components/auth/auth-card'
import { TextField } from '@/components/auth/text-field'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { registerUser } from '@/lib/auth-api'
import { getRegisterSchema, type RegisterValues } from '@/lib/auth-schemas'

export function RegisterPage() {
  const navigate = useNavigate()
  const { i18n, t } = useLingui()
  const schema = getRegisterSchema(i18n)
  const { control, handleSubmit, setError, formState } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      navigate('/login')
    } catch {
      setError('root', { message: t`Could not create the account` })
    }
  }

  return (
    <AuthCard
      title={t`Create an account`}
      description={t`Enter your details to get started`}
      footerText={t`Already have an account?`}
      footerLink="/login"
      footerLabel={t`Sign in`}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <TextField control={control} name="name" label={t`Name`} autoComplete="name" />
          <TextField control={control} name="email" label={t`Email`} type="email" autoComplete="email" />
          <TextField control={control} name="password" label={t`Password`} type="password" autoComplete="new-password" />
          <TextField control={control} name="confirmPassword" label={t`Confirm password`} type="password" autoComplete="new-password" />
          {formState.errors.root && <FieldError errors={[formState.errors.root]} />}
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? t`Creating account…` : t`Create account`}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
