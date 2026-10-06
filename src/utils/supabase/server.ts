import { createServerClient } from '@supabase/ssr';
import { createSupabaseContext, withSupabase } from '@supabase/server';

const supabaseUrl =
  process.env['SUPABASE_URL'] ||
  process.env['NEXT_PUBLIC_SUPABASE_URL'] ||
  'https://hqnaotsiopgjjkoninws.supabase.co';

const supabasePublishableKey =
  process.env['SUPABASE_PUBLISHABLE_KEY'] ||
  process.env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] ||
  'sb_publishable_3dD4v5ezrOhbVkLjCnItnA_PZttv0Xk';

const supabaseSecretKey =
  process.env['SUPABASE_SECRET_KEY'] ||
  'sb_secret_xi7Q_Xt4pKnEoJLBW_gDXg_rdVkpZNK';

/**
 * Creates a server-side Supabase client with custom cookie handlers.
 */
export const createClient = (cookieStore?: {
  getAll?: () => Array<{ name: string; value: string }>;
  setAll?: (cookies: Array<{ name: string; value: string; options?: any }>) => void;
}) => {
  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore?.getAll ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet) {
          if (cookieStore?.setAll) {
            try {
              cookieStore.setAll(cookiesToSet);
            } catch {
              // Ignore if called from read-only context
            }
          }
        },
      },
    },
  );
};

export { createSupabaseContext, withSupabase, supabaseUrl, supabasePublishableKey, supabaseSecretKey };
