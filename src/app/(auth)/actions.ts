"use server";

import { supabaseServerClient } from "@/utils/supabase/server";

/**
 * Extracts form data safely with type casting
 */
const extractFormData = (formData: FormData, fields: string[]) => {
  return fields.reduce((acc, field) => {
    acc[field] = formData.get(field) as string;
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Handles authentication errors consistently
 */
const handleAuthError = (error: unknown): string => {
  return `${error}`;
};

/**
 * Signs in a user using their email and password credentials.
 * This function is a Next.js Server Action.
 * @param {FormData} formData - The form data submitted by the user. Expected to contain 'email' and 'password'.
 * @returns {Promise<string | void>} Returns an error message as a string if sign-in fails, otherwise returns nothing on success.
 */
export const signIn = async (formData: FormData) => {
  const { email, password } = extractFormData(formData, ["email", "password"]);
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
    return handleAuthError(error);
  }
};

/**
 * Creates a new user account with the provided details.
 * This function is a Next.js Server Action.
 * @param {FormData} formData - The form data for the new account. Expected to contain 'full-name', 'email', and 'password'.
 * @returns {Promise<string | void>} Returns an error message as a string if sign-up fails, otherwise returns nothing on success.
 */
export const signUp = async (formData: FormData) => {
  const {
    "full-name": fullName,
    email,
    password,
  } = extractFormData(formData, ["full-name", "email", "password"]);
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
    return handleAuthError(error);
  }
};
