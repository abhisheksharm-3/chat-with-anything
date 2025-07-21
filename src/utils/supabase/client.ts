import { TypeDatabase } from "@/types/TypeSupabase";
import { createBrowserClient } from "@supabase/ssr";

export const supabaseBrowserClient = () =>
  createBrowserClient<TypeDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
