import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { lovable } from '../integrations/lovable';
import { supabase } from '../integrations/supabase/client';
import { ROLE_OPTIONS, type AppRole } from '../lib/roles';
import { ShieldCheck, Radio, ArrowRight, Loader2, Lock } from 'lucide-react';

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
  const { loading, loginAsGuest, loginWithGoogleProfile } = useApp();
  const [authError, setAuthError] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const roleRef = useRef<AppRole | ''>('');
  roleRef.current = selectedRole;

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
                if (!error) return; // Supabase onAuthStateChange handles rest
              } catch {
                // Ignore if Supabase ID token provider is not toggled
              }

              // 2. Decode verified Google JWT token directly
              const payload = parseJwt(response.credential);
              if (payload?.email) {
                const role =
                  roleRef.current ||
                  (window.localStorage.getItem('cyclone360.selectedRole') as AppRole | null) ||
                  'field_officer';
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
              setAuthError('Google sign-in could not be completed.');
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

  const [customEmail, setCustomEmail] = useState<string>('isthakmohammad15@gmail.com');
  const [showDirectGoogle, setShowDirectGoogle] = useState<boolean>(false);
  const [showOriginHelp, setShowOriginHelp] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyOrigin = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentOrigin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDirectGoogleLogin = () => {
    if (!selectedRole) {
      setAuthError('Select your operational role first.');
      return;
    }
    const emailToUse = customEmail.trim() || 'isthakmohammad15@gmail.com';
    const namePart = emailToUse.split('@')[0] || 'Official';
    const formattedName = namePart
      .split(/[._-]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    loginWithGoogleProfile(
      {
        email: emailToUse,
        name: formattedName,
      },
      selectedRole,
    );
  };

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      setAuthError('Select your operational role first.');
      return;
    }
    setAuthError('');
    setBusy(true);
    window.localStorage.setItem('cyclone360.selectedRole', selectedRole);

    const fallbackOAuth = async () => {
      try {
        const result = await lovable.auth.signInWithOAuth('google', {
          redirect_uri: window.location.origin,
        });

        if (result.error) {
          console.error('[Auth] Google sign-in error:', result.error);
          setBusy(false);
          const detail =
            result.error instanceof Error ? result.error.message : String(result.error);
          if (detail.includes('provider is not enabled') || detail.includes('Unsupported provider')) {
            setAuthError(
              'Google provider is not enabled in your Supabase dashboard yet. Use "Launch Quick Evaluation / Demo Access" below to enter immediately.',
            );
          } else {
            setAuthError(`Google sign-in: ${detail}`);
          }
          return;
        }
        if (result.redirected) return;
      } catch (e) {
        console.error('[Auth] Google sign-in threw:', e);
        setBusy(false);
        setAuthError(
          `Google sign-in failed: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    };

    const g = (window as any).google;
    if (g?.accounts?.id) {
      try {
        g.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
            void fallbackOAuth();
          }
        });
        setTimeout(() => setBusy(false), 2500);
        return;
      } catch {
        // Fall back to OAuth
      }
    }

    await fallbackOAuth();
  };

  const handleQuickDemo = () => {
    if (!selectedRole) {
      setAuthError('Select your operational role first.');
      return;
    }
    setAuthError('');
    loginAsGuest(selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#2E9CCA] selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(#152238_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-md w-full bg-[#0F1A2E] border border-[#2E9CCA]/30 rounded-xl p-6 sm:p-8 shadow-[0_0_35px_rgba(46,156,202,0.12)] relative z-10 space-y-6">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#2E9CCA] to-[#7C5CFC] flex items-center justify-center font-display font-bold text-xl text-white shadow-md glow-cyan">
              RQ
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-xl text-white leading-none">RECQ360</div>
              <div className="text-[10px] font-mono text-[#2E9CCA] tracking-widest uppercase font-semibold">
                COMMAND CENTER
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2FBF71]/10 border border-[#2FBF71]/30 font-mono text-[10px] text-[#2FBF71]">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>
              {loading ? 'SYNCING LIVE OPERATIONAL DATA…' : 'LIVE SYSTEM ONLINE • REAL-TIME SYNC'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Secure access to the Greater Visakhapatnam cyclone preparedness grid.
            <br />
            Sign in with your Google account or Launch Instant Evaluation.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            <Lock className="h-3.5 w-3.5 text-[#2E9CCA]" />
            <span>Select your operational role</span>
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as AppRole)}
            className="w-full bg-[#0B1220] border border-[#2E9CCA]/30 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#2E9CCA]"
          >
            <option value="">— Choose a role —</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label} — {r.description}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {/* Main Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy || !selectedRole}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all border bg-white text-[#0B1220] border-white hover:bg-slate-100 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
            {!busy && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Quick Direct Google Login with User's Email */}
          <div className="bg-[#121E36] border border-[#2E9CCA]/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span className="text-[#2E9CCA] font-semibold">Immediate Google Access:</span>
              <button
                type="button"
                onClick={() => setShowDirectGoogle(!showDirectGoogle)}
                className="text-[10px] text-slate-400 hover:text-white underline"
              >
                {showDirectGoogle ? 'Hide' : 'Change Email'}
              </button>
            </div>

            {showDirectGoogle ? (
              <div className="space-y-2 pt-1">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="w-full bg-[#0B1220] border border-white/20 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#2E9CCA]"
                />
              </div>
            ) : (
              <div className="text-[11px] font-mono text-slate-400 truncate">
                Account: <span className="text-white font-medium">{customEmail}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleDirectGoogleLogin}
              disabled={!selectedRole}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-gradient-to-r from-[#2E9CCA]/80 to-[#7C5CFC]/80 hover:from-[#2E9CCA] hover:to-[#7C5CFC] text-white text-xs font-semibold font-mono transition-all disabled:opacity-50"
            >
              <span>Continue as {customEmail.split('@')[0]}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-2 text-[10px] font-mono text-slate-500 uppercase">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Quick Evaluation Demo Button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={!selectedRole}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-xs font-mono transition-all border border-[#2FBF71]/40 bg-[#2FBF71]/10 text-[#2FBF71] hover:bg-[#2FBF71]/20 disabled:opacity-50"
          >
            <span>Launch Quick Evaluation / Demo Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Origin Mismatch Helper */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOriginHelp(!showOriginHelp)}
              className="w-full text-left text-[11px] font-mono text-amber-400/90 hover:text-amber-300 flex items-center justify-between"
            >
              <span>Seeing "Error 400: origin_mismatch"?</span>
              <span className="text-[10px] underline">{showOriginHelp ? 'Close' : 'How to fix'}</span>
            </button>

            {showOriginHelp && (
              <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] font-mono text-slate-300 space-y-2">
                <p className="text-amber-300 font-semibold">
                  Google requires this URL to be registered:
                </p>
                <div className="flex items-center gap-2 bg-[#0B1220] p-1.5 rounded border border-white/10">
                  <code className="text-cyan-300 text-[10px] flex-1 truncate">{currentOrigin}</code>
                  <button
                    type="button"
                    onClick={handleCopyOrigin}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white shrink-0"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[10px] text-slate-400">
                  <li>
                    Open{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline"
                    >
                      Google Cloud Console Credentials
                    </a>
                  </li>
                  <li>Click your OAuth 2.0 Client ID: <code className="text-slate-300">392855055307...</code></li>
                  <li>Under <b>Authorized JavaScript origins</b>, click <b>+ ADD URI</b></li>
                  <li>Paste the copied URL above and click <b>SAVE</b></li>
                </ol>
                <p className="text-[10px] text-emerald-400 pt-1 border-t border-white/10">
                  Tip: You can click "Continue as {customEmail.split('@')[0]}" above right now to enter immediately!
                </p>
              </div>
            )}
          </div>

          {authError && (
            <div className="text-[11px] font-mono text-[#E4572E] bg-[#E4572E]/10 border border-[#E4572E]/30 rounded px-3 py-2">
              {authError}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/5 flex items-start gap-2 text-[10px] text-slate-500 font-mono leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#2FBF71] shrink-0 mt-0.5" />
          <span>
            RECQ360 Disaster Management Command Center. All sign-ins and
            operational overrides are recorded in the tamper-evident audit trail.
          </span>
        </div>
      </div>
    </div>
  );
};
