import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { lovable } from '../integrations/lovable';
import { ROLE_OPTIONS, type AppRole } from '../lib/roles';
import { ShieldCheck, Radio, ArrowRight, Loader2, Lock } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loading, loginAsGuest } = useApp();
  const [authError, setAuthError] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      setAuthError('Select your operational role first.');
      return;
    }
    setAuthError('');
    setBusy(true);
    window.localStorage.setItem('cyclone360.selectedRole', selectedRole);

    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        // Surface the real provider/auth error for debugging.
        console.error('[Auth] Google sign-in failed:', result.error);
        setBusy(false);
        const detail =
          result.error instanceof Error ? result.error.message : String(result.error);
        setAuthError(`Google sign-in failed: ${detail}`);
        return;
      }
      if (result.redirected) return; // browser is navigating to Google
      // Session set — AppContext picks it up via onAuthStateChange.
    } catch (e) {
      console.error('[Auth] Google sign-in threw:', e);
      setBusy(false);
      setAuthError(
        `Google sign-in failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
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
            Continue with your official Google account.
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            <Lock className="h-3.5 w-3.5 text-[#2E9CCA]" />
            <span>Select your role</span>
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

        <div className="space-y-2">
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
            <span>{busy ? 'Opening Google…' : 'Sign in with Google'}</span>
            {!busy && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-2 text-[10px] font-mono text-slate-500 uppercase">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={!selectedRole}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-xs font-mono transition-all border border-[#2E9CCA]/40 bg-[#2E9CCA]/10 text-[#2E9CCA] hover:bg-[#2E9CCA]/20 disabled:opacity-50"
          >
            <span>Launch Quick Evaluation / Demo Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

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
