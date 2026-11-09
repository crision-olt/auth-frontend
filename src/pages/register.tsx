import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AuthCard } from '@/components/auth/auth-card'
import { TextField } from '@/components/auth/text-field'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import { registerUser } from '@/lib/auth-api'
import { registerSchema, type RegisterValues } from '@/lib/auth-schemas'

export function RegisterPage() {
  const navigate = useNavigate()
  const { control, handleSubmit, setError, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
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
      setError('root', { message: 'Could not create the account' })
    }
  }

  return (
    <AuthCard
      title="Create an account"
      description="Enter your details to get started"
      footerText="Already have an account?"
      footerLink="/login"
      footerLabel="Sign in"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <TextField control={control} name="name" label="Name" autoComplete="name" />
          <TextField control={control} name="email" label="Email" type="email" autoComplete="email" />
          <TextField control={control} name="password" label="Password" type="password" autoComplete="new-password" />
          <TextField control={control} name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" />
          {formState.errors.root && <FieldError errors={[formState.errors.root]} />}
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  )
}
