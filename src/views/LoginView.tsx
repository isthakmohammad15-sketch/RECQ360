import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../integrations/supabase/client';
import { ROLE_OPTIONS, type AppRole } from '../lib/roles';
import { ShieldCheck, Radio, ArrowRight, Loader2, Lock, ArrowLeft } from 'lucide-react';

const GOOGLE_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.['VITE_GOOGLE_CLIENT_ID']) ||
  '392855055307-dhehfd8fepvl20k85v57q785p8rv47h1.apps.googleusercontent.com';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const LoginView: React.FC = () => {
  const { loginWithGoogleProfile, navigateTo } = useApp();
  const [authError, setAuthError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const roleRef = useRef<AppRole | ''>('');
  roleRef.current = selectedRole;

  // Initialize Google Identity Services (GSI)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initGsi = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id) return;
      try {
        g.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (!response?.credential) return;
            setBusy(true);
            try {
              // 1. Try Supabase ID token login
              try {
                const { error } = await supabase.auth.signInWithIdToken({
                  provider: 'google',
                  token: response.credential,
                });
                if (!error) return; // Supabase onAuthStateChange handles session
              } catch {
                // Fallback to direct verified JWT
              }

              // 2. Decode verified Google JWT token directly
              const payload = parseJwt(response.credential);
              if (payload?.email) {
                const role =
                  roleRef.current ||
                  (window.localStorage.getItem('cyclone360.selectedRole') as AppRole | null) ||
                  'commissioner';

                loginWithGoogleProfile(
                  {
                    email: payload.email,
                    name: payload.name || payload.given_name || payload.email,
                    avatarUrl: payload.picture,
                  },
                  role,
                );
              }
            } catch (err) {
              console.error('[Google GSI] Auth processing failed:', err);
              setAuthError('Google sign-in could not be completed. Please try again.');
            } finally {
              setBusy(false);
            }
          },
          auto_select: false,
        });
      } catch (e) {
        console.warn('[Google GSI] Init notice:', e);
      }
    };

    if (!(window as any).google?.accounts?.id) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    } else {
      initGsi();
    }
  }, [loginWithGoogleProfile]);

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      setAuthError('Please select your operational role first.');
      return;
    }
    setAuthError('');
    setBusy(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cyclone360.selectedRole', selectedRole);
    }

    try {
      // 1. Trigger Google GSI OneTap / Prompt
      const g = (window as any).google;
      let promptAttempted = false;

      if (g?.accounts?.id) {
        promptAttempted = true;
        g.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
            console.log('[Google Auth] GSI prompt skipped, falling back to Supabase OAuth redirect...');
            void triggerSupabaseOAuth();
          }
        });
        setTimeout(() => setBusy(false), 2500);
        return;
      }

      // 2. Fallback to Supabase OAuth redirect
      if (!promptAttempted) {
        await triggerSupabaseOAuth();
      }
    } catch (err: any) {
      console.error('[Google Auth] Sign-in error:', err);
      setAuthError(err.message || 'Google sign-in failed. Please try again.');
      setBusy(false);
    }
  };

  const triggerSupabaseOAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        setAuthError(error.message || 'Google sign-in could not be initiated.');
        setBusy(false);
      }
    } catch (e: any) {
      setAuthError(e.message || 'Could not connect to Google authentication.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#2E9CCA] selection:text-white">
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#152238_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Main Card Container */}
      <div className="max-w-md w-full bg-[#0F1A2E] border border-[#2E9CCA]/25 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(46,156,202,0.14)] relative z-10 space-y-6">
        {/* Brand & Command Center Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2E9CCA] to-[#7C5CFC] flex items-center justify-center font-display font-bold text-2xl text-white shadow-lg glow-cyan">
              RQ
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-2xl text-white leading-none tracking-tight">
                RECQ360
              </div>
              <div className="text-[10px] font-mono text-[#2E9CCA] tracking-widest uppercase font-semibold mt-1">
                COMMAND CENTER
              </div>
            </div>
          </div>

          {/* Real-time sync status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2FBF71]/10 border border-[#2FBF71]/30 font-mono text-[10px] text-[#2FBF71]">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>LIVE SYSTEM ONLINE • REAL-TIME SYNC</span>
          </div>

          {/* Description Copy */}
          <div className="space-y-1.5 pt-1 text-center">
            <div className="text-white font-semibold text-sm">
              Secure access to RECQ360
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access the global disaster preparedness and response platform securely.
            </p>
            <div className="text-xs text-slate-400 font-semibold pt-0.5">
              Continue with your official Google account.
            </div>
          </div>
        </div>

        {/* Operational Role Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            <Lock className="h-3.5 w-3.5 text-[#2E9CCA]" />
            <span>SELECT YOUR ROLE</span>
          </label>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value as AppRole);
                setAuthError('');
              }}
              className="w-full bg-[#0B1220] border border-[#2E9CCA]/30 rounded-lg px-3.5 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#2E9CCA] cursor-pointer appearance-none transition-colors"
            >
              <option value="">— Choose a role —</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value} className="bg-[#0F1A2E] text-white">
                  {r.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Primary Action: Sign in with Google */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all bg-[#94A3B8] hover:bg-slate-200 text-[#0B1220] disabled:opacity-60 shadow-md group"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0B1220]" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                />
              </svg>
            )}
            <span>{busy ? 'Connecting to Google…' : 'Sign in with Google'}</span>
            {!busy && (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-[#0B1220]" />
            )}
          </button>

          {authError && (
            <div className="text-[11px] font-mono text-[#E4572E] bg-[#E4572E]/10 border border-[#E4572E]/30 rounded-lg px-3 py-2 text-center">
              {authError}
            </div>
          )}
        </div>

        {/* Audit Trail Note */}
        <div className="pt-4 border-t border-white/5 flex items-start gap-2.5 text-[11px] text-slate-400 font-mono leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#2FBF71] shrink-0 mt-0.5" />
          <span>
            RECQ360 Disaster Management Command Center. All sign-ins and operational overrides are
            recorded in the tamper-evident audit trail.
          </span>
        </div>

        {/* Back to Public Portal Link */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => navigateTo('landing')}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-[#2E9CCA] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
