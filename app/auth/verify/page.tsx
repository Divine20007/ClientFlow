'use client';
import { Suspense, FormEvent, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase-browser';

function VerifyForm() {
  const params = useSearchParams(); const router = useRouter(); const email = params.get('email') || ''; const supabase = createClient();
  const [token, setToken] = useState(''); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false); const [resending, setResending] = useState(false);
  async function verify(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); setNotice(''); const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' }); setBusy(false); if (error) return setError(error.message); router.push('/dashboard'); }
  async function resend() { setResending(true); setError(''); setNotice(''); const { error } = await supabase.auth.resend({ type: 'signup', email }); setResending(false); if (error) return setError(error.message); setNotice('A new six-digit confirmation code has been sent.'); }
  return <main><section className="card"><h1>Enter your code</h1><p>We sent a six-digit confirmation code to <strong>{email}</strong>.</p><form onSubmit={verify}><label>Confirmation code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={token} onChange={e => setToken(e.target.value.replace(/\D/g, ''))} /></label>{error && <p className="error">{error}</p>}{notice && <p className="success">{notice}</p>}<button disabled={busy}>{busy ? 'Verifying…' : 'Verify email'}</button></form><button className="secondary" disabled={resending} onClick={resend}>{resending ? 'Sending…' : 'Resend code'}</button></section></main>;
}

export default function VerifyPage() { return <Suspense fallback={<main><section className="card"><p>Loading verification…</p></section></main>}><VerifyForm /></Suspense>; }
