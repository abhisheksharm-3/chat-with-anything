'use server';

import { supabaseServerClient } from '@/utils/supabase/server';

export const signIn = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await supabaseServerClient();

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    return `${error}`;
  }
};

export const signUp = async (formData: FormData) => {
  const fullName = formData.get('full-name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await supabaseServerClient();

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    return `${error}`;
  }
};
