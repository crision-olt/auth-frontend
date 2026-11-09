import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from '@/components/auth/auth-card'
import { TextField } from '@/components/auth/text-field'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { login } from '@/lib/auth-api'
import { loginSchema, type LoginValues } from '@/lib/auth-schemas'

export function LoginPage() {
  const navigate = useNavigate()
  const { control, handleSubmit, setError, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values)
      navigate('/')
    } catch {
      setError('root', { message: 'Invalid email or password' })
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account"
      footerText="Don't have an account?"
      footerLink="/register"
      footerLabel="Sign up"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <TextField control={control} name="email" label="Email" type="email" autoComplete="email" />
          <TextField control={control} name="password" label="Password" type="password" autoComplete="current-password" />
          {formState.errors.root && <FieldError errors={[formState.errors.root]} />}
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
