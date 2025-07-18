'use server';

import { supabaseServerClient } from '@/utils/supabase/server';

/**
 * Signs in a user using their email and password credentials.
 * This function is a Next.js Server Action.
 * @param {FormData} formData - The form data submitted by the user. Expected to contain 'email' and 'password'.
 * @returns {Promise<string | void>} Returns an error message as a string if sign-in fails, otherwise returns nothing on success.
 */
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
    // Return the error message to be displayed on the client.
    return `${error}`;
  }
};

/**
 * Creates a new user account with the provided details.
 * This function is a Next.js Server Action.
 * @param {FormData} formData - The form data for the new account. Expected to contain 'full-name', 'email', and 'password'.
 * @returns {Promise<string | void>} Returns an error message as a string if sign-up fails, otherwise returns nothing on success.
 */
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
        // Add custom user metadata here.
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    // Return the error message to be displayed on the client.
    return `${error}`;
  }
};