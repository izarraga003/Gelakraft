'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Stage = 'lehen' | 'dbh' | 'batxilergoa' | 'lh' | 'unibertsitatea' | 'beste'

export async function createClassroom(
  formData: FormData
): Promise<{ success: false; error: string } | never> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Saioa hasi behar duzu.' }
  }

  const name = (formData.get('name') as string)?.trim()
  const stage = (formData.get('stage') as Stage) ?? 'beste'

  if (!name || name.length < 2) {
    return { success: false, error: 'Eman ikasgelari izen bat (gutxienez 2 karaktere).' }
  }

  const validStages: Stage[] = [
    'lehen',
    'dbh',
    'batxilergoa',
    'lh',
    'unibertsitatea',
    'beste',
  ]
  if (!validStages.includes(stage)) {
    return { success: false, error: 'Maila baliogabea.' }
  }

  const { data, error } = await supabase
    .from('classrooms')
    .insert({
      teacher_id: user.id,
      name,
      stage,
    })
    .select('id')
    .single()

  if (error || !data) {
    return {
      success: false,
      error: `Ezin izan da ikasgela sortu: ${error?.message ?? 'errore ezezaguna'}`,
    }
  }

  revalidatePath('/panela')
  redirect(`/panela/ikasgela/${data.id}`)
}
