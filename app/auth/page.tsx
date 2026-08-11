'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase-browser';

export default function AuthPage() {
  const router = useRouter(); const supabase = createClient();
  const [mode, setMode] = useState<'login'|'signup'>('login'); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); const result = mode === 'signup' ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password }); setBusy(false); if (result.error) return setError(result.error.message); if (mode === 'signup') return router.push(`/auth/verify?email=${encodeURIComponent(email)}`); router.push('/dashboard'); }
  return <main><section className="card"><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p>{mode === 'login' ? 'Log in to continue to ClientFlow.' : 'We will email you a six-digit confirmation code.'}</p><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} /></label>{error && <p className="error">{error}</p>}<button disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}</button></form><button className="secondary" onClick={()=>setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}</button></section></main>;
}
