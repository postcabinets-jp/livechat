'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const orgName = formData.get('org_name') as string

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { org_name: orgName },
    },
  })

  if (authError) {
    redirect(`/register?error=${encodeURIComponent(authError.message)}`)
  }

  if (authData.user) {
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
        display_name: email.split('@')[0],
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
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
