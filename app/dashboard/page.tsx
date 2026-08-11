'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase-browser';
import { useEffect, useState } from 'react';

export default function Dashboard(){const router=useRouter();const supabase=createClient();const [email,setEmail]=useState('');useEffect(()=>{supabase.auth.getUser().then(({data})=>setEmail(data.user?.email||''));},[]);async function logout(){await supabase.auth.signOut();router.push('/auth');}return <main><section className="card"><h1>ClientFlow</h1><p>You are signed in as {email}.</p><button onClick={logout}>Log out</button></section></main>;}
