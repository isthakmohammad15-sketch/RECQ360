import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ROLE_OPTIONS, type AppRole, getBoundRoleForEmail, bindRoleToEmail, roleLabel } from '../lib/roles';
import { ShieldCheck, Radio, ArrowRight, Loader2, Lock, ArrowLeft } from 'lucide-react';

const GOOGLE_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.['VITE_GOOGLE_CLIENT_ID']) ||
  '392855055307-dhehfd8fepvl20k85v57q785p8rv47h1.apps.googleusercontent.com';

function waitForGoogleOAuth2(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      return resolve((window as any).google.accounts.oauth2);
    }
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if ((window as any).google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve((window as any).google.accounts.oauth2);
      } else if (count > 50) {
        clearInterval(interval);
        reject(
          new Error(
            'Google Sign-In library could not be loaded. Please verify your internet connection.',
          ),
        );
      }
    }, 100);
  });
}

export const LoginView: React.FC = () => {
  const { loginWithGoogleProfile, navigateTo } = useApp();
  const [authError, setAuthError] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const roleRef = useRef<AppRole | ''>('');
  roleRef.current = selectedRole;

  // Ensure Google Identity Services script is present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!(window as any).google?.accounts?.oauth2) {
      const existing = document.getElementById('google-gsi-client');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }
  }, []);

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
      const oauth2 = await waitForGoogleOAuth2();

      // Launch Google OAuth 2.0 Account Chooser Popup (Select Google Account Screen)
      const tokenClient = oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope:
          'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('[Google OAuth] Token error:', tokenResponse);
            setAuthError(
              tokenResponse.error_description ||
                tokenResponse.error ||
                'Google account selection was cancelled.',
            );
            setBusy(false);
            return;
          }

          try {
            // Retrieve verified user profile from Google UserInfo API
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Profile fetch returned status: ${res.status}`);
            }

            const profile = await res.json();

            if (profile?.email) {
              const normalizedEmail = profile.email.toLowerCase().trim();
              const boundRole = getBoundRoleForEmail(normalizedEmail);
              const requestedRole =
                roleRef.current ||
                (window.localStorage.getItem('cyclone360.selectedRole') as AppRole | null) ||
                'commissioner';

              // Security Rule: One email = Only ONE Officer Role. Cannot switch to another role.
              if (boundRole && boundRole !== requestedRole) {
                setAuthError(
                  `Role Access Denied: The account "${profile.email}" is permanently registered as "${roleLabel(boundRole)}". One account cannot be used with a different role. Please choose "${roleLabel(boundRole)}" from the dropdown to continue.`,
                );
                setBusy(false);
                return;
              }

              if (!boundRole) {
                bindRoleToEmail(normalizedEmail, requestedRole);
              }

              loginWithGoogleProfile(
                {
                  email: profile.email,
                  name: profile.name || profile.given_name || profile.email,
                  avatarUrl: profile.picture,
                },
                boundRole || requestedRole,
              );
            } else {
              throw new Error('Google did not provide an email address.');
            }
          } catch (err: any) {
            console.error('[Google OAuth] Failed to get user profile:', err);
            setAuthError(err.message || 'Failed to retrieve profile from Google.');
          } finally {
            setBusy(false);
          }
        },
        error_callback: (err: any) => {
          console.warn('[Google OAuth] Client error:', err);
          setBusy(false);
          if (err?.type === 'popup_blocked') {
            setAuthError(
              'Pop-up window was blocked by your browser. Please allow pop-ups for this site to choose your Google account.',
            );
          } else if (err?.type !== 'popup_closed') {
            setAuthError(err?.message || 'Google Sign-In encountered an issue.');
          }
        },
      });

      // Request Google Account Chooser screen
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      console.error('[Google Auth] Sign-in error:', err);
      setAuthError(err.message || 'Google sign-in could not be initiated.');
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
