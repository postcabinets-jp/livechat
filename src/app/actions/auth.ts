'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from '@/lib/validations'

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues.map(i => i.message).join(', '))}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    org_name: formData.get('org_name'),
  })
  if (!parsed.success) {
    redirect(`/register?error=${encodeURIComponent(parsed.error.issues.map(i => i.message).join(', '))}`)
  }

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { org_name: parsed.data.org_name },
    },
  })

  if (authError) {
    redirect(`/register?error=${encodeURIComponent(authError.message)}`)
  }

  if (authData.user) {
    const orgName = parsed.data.org_name
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName, slug: `${slug}-${Date.now()}` })
      .select()
      .single()

    if (!orgError && org) {
      await supabase.from('agents').insert({
        organization_id: org.id,
        user_id: authData.user.id,
        display_name: parsed.data.email.split('@')[0],
        role: 'owner',
        status: 'online',
      })

      await supabase.from('inboxes').insert({
        organization_id: org.id,
        name: 'Website Chat',
        channel: 'web_widget',
        welcome_message: `${orgName}へようこそ！何かお手伝いできることはありますか？`,
      })
    }
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function forgotPassword(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })
  if (!parsed.success) {
    redirect(`/forgot-password?error=${encodeURIComponent(parsed.error.issues.map(i => i.message).join(', '))}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings/general`,
  })

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/forgot-password?message=メールを送信しました。スパムフォルダもご確認ください。')
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

// Export this for use in header.tsx (not a form action - just a regular function)
export async function updateAgentStatus() {
  // no-op placeholder - actual implementation in agents.ts
}
