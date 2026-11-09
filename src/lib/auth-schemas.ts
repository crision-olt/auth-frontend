import { t } from '@lingui/core/macro'
import type { I18n } from '@lingui/core'
import { z } from 'zod'

// Schema factories: pass the i18n instance so messages follow the active locale.
export const getLoginSchema = (i18n: I18n) =>
  z.object({
    email: z.email(t(i18n)`Enter a valid email`),
    password: z.string().min(1, t(i18n)`Password is required`),
  })

export const getRegisterSchema = (i18n: I18n) =>
  z
    .object({
      name: z.string().trim().min(2, t(i18n)`Name must be at least 2 characters`),
      email: z.email(t(i18n)`Enter a valid email`),
      password: z.string().min(8, t(i18n)`Password must be at least 8 characters`),
      confirmPassword: z.string().min(1, t(i18n)`Confirm your password`),
    })
    .refine((v) => v.password === v.confirmPassword, {
      path: ['confirmPassword'],
      message: t(i18n)`Passwords do not match`,
    })

export type LoginValues = z.infer<ReturnType<typeof getLoginSchema>>
export type RegisterValues = z.infer<ReturnType<typeof getRegisterSchema>>
