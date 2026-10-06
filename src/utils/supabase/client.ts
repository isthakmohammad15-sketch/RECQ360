import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.['VITE_SUPABASE_URL']) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.['NEXT_PUBLIC_SUPABASE_URL']) ||
  process.env['NEXT_PUBLIC_SUPABASE_URL'] ||
  process.env['SUPABASE_URL'] ||
  'https://hqnaotsiopgjjkoninws.supabase.co';

const supabaseKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.['VITE_SUPABASE_PUBLISHABLE_KEY']) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY']) ||
  process.env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] ||
  process.env['SUPABASE_PUBLISHABLE_KEY'] ||
  'sb_publishable_3dD4v5ezrOhbVkLjCnItnA_PZttv0Xk';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
