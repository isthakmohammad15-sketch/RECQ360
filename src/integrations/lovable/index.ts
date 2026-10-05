import { supabase } from "../supabase/client";

export type OAuthProvider = "google" | "github" | "gitlab" | "bitbucket";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: OAuthProvider, opts?: SignInOptions) => {
      const redirectUri =
        opts?.redirect_uri ||
        (typeof window !== "undefined" ? window.location.origin : undefined);

      try {
        const queryParams: Record<string, string> = {
          ...opts?.extraParams,
        };
        const googleClientId =
          (typeof import.meta !== "undefined" && import.meta.env?.["VITE_GOOGLE_CLIENT_ID"]) ||
          "392855055307-dhehfd8fepvl20k85v57q785p8rv47h1.apps.googleusercontent.com";
        if (googleClientId) {
          queryParams["client_id"] = googleClientId;
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: provider as "google",
          options: {
            redirectTo: redirectUri,
            queryParams,
          },
        });
        if (error) {
          return { error };
        }
        if (data?.url) {
          if (typeof window !== "undefined") {
            window.location.href = data.url;
          }
          return { error: null, redirected: true };
        }
        return { error: null, redirected: false };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
    },
  },
};
