'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase-browser';

type Client = { id: string; name: string; email: string | null; company: string | null };
type Project = { id: string; name: string; status: string; due_date: string | null; client_id: string | null; clients?: { name: string }[] | null };

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [clientForm, setClientForm] = useState({ name: '', email: '', company: '' });
  const [projectForm, setProjectForm] = useState({ name: '', client_id: '', status: 'active', due_date: '' });
  const [savingClient, setSavingClient] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  async function loadWorkspace() {
    setLoading(true); setError('');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) { router.push('/auth'); return; }
    setEmail(user.email || '');
    const [clientsResult, projectsResult] = await Promise.all([
      supabase.from('clients').select('id,name,email,company').order('created_at', { ascending: false }),
      supabase.from('projects').select('id,name,status,due_date,client_id,clients(name)').order('created_at', { ascending: false })
    ]);
    if (clientsResult.error || projectsResult.error) setError(clientsResult.error?.message || projectsResult.error?.message || 'Could not load your workspace.');
    setClients((clientsResult.data || []) as Client[]);
    setProjects((projectsResult.data || []) as unknown as Project[]);
    setLoading(false);
  }

  useEffect(() => { loadWorkspace(); }, []);

  const activeProjects = useMemo(() => projects.filter(project => project.status === 'active').length, [projects]);
  const completedProjects = useMemo(() => projects.filter(project => project.status === 'completed').length, [projects]);

  async function addClient(event: FormEvent) {
    event.preventDefault(); setSavingClient(true); setError(''); setNotice('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/auth');
    const { error } = await supabase.from('clients').insert({ owner_id: user.id, name: clientForm.name, email: clientForm.email || null, company: clientForm.company || null });
    setSavingClient(false);
    if (error) return setError(error.message);
    setClientForm({ name: '', email: '', company: '' }); setNotice('Client added successfully.'); await loadWorkspace();
  }

  async function addProject(event: FormEvent) {
    event.preventDefault(); setSavingProject(true); setError(''); setNotice('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/auth');
    const { error } = await supabase.from('projects').insert({ owner_id: user.id, name: projectForm.name, client_id: projectForm.client_id || null, status: projectForm.status, due_date: projectForm.due_date || null });
    setSavingProject(false);
    if (error) return setError(error.message);
    setProjectForm({ name: '', client_id: '', status: 'active', due_date: '' }); setNotice('Project added successfully.'); await loadWorkspace();
  }

  async function logout() { await supabase.auth.signOut(); router.push('/auth'); }

  if (loading) return <main><section className="card"><p>Loading your workspace…</p></section></main>;
  return <main className="workspace"><header className="topbar"><button className="secondary compact" onClick={logout}>Log out</button><div><span className="eyebrow">CLIENTFLOW</span><h1>Your workspace</h1><p>{email}</p></div></header>
    {error && <div className="alert error">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    <section className="stats"><div className="stat"><span>Clients</span><strong>{clients.length}</strong></div><div className="stat"><span>Active projects</span><strong>{activeProjects}</strong></div><div className="stat"><span>Completed</span><strong>{completedProjects}</strong></div></section>
    <section className="grid two-col"><div className="panel"><div className="panel-heading"><div><span className="eyebrow">DIRECTORY</span><h2>Clients</h2></div></div>{clients.length === 0 ? <p className="muted">No clients yet. Add your first client below.</p> : <div className="records">{clients.map(client => <div className="record" key={client.id}><div><strong>{client.name}</strong><span>{client.company || client.email || 'No details added'}</span></div></div>)}</div>}<form className="inline-form" onSubmit={addClient}><input required placeholder="Client name" value={clientForm.name} onChange={event => setClientForm({ ...clientForm, name: event.target.value })} /><input type="email" placeholder="Email" value={clientForm.email} onChange={event => setClientForm({ ...clientForm, email: event.target.value })} /><input placeholder="Company" value={clientForm.company} onChange={event => setClientForm({ ...clientForm, company: event.target.value })} /><button disabled={savingClient}>{savingClient ? 'Adding…' : 'Add client'}</button></form></div>
      <div className="panel"><div className="panel-heading"><div><span className="eyebrow">WORK</span><h2>Projects</h2></div></div>{projects.length === 0 ? <p className="muted">No projects yet. Add your first project below.</p> : <div className="records">{projects.map(project => <div className="record" key={project.id}><div><strong>{project.name}</strong><span>{project.clients?.[0]?.name || 'No client assigned'}{project.due_date ? ` · Due ${project.due_date}` : ''}</span></div><span className={`badge ${project.status}`}>{project.status}</span></div>)}</div>}<form className="stack-form" onSubmit={addProject}><input required placeholder="Project name" value={projectForm.name} onChange={event => setProjectForm({ ...projectForm, name: event.target.value })} /><div className="form-row"><select value={projectForm.client_id} onChange={event => setProjectForm({ ...projectForm, client_id: event.target.value })}><option value="">No client</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select><select value={projectForm.status} onChange={event => setProjectForm({ ...projectForm, status: event.target.value })}><option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select><input type="date" value={projectForm.due_date} onChange={event => setProjectForm({ ...projectForm, due_date: event.target.value })} /></div><button disabled={savingProject}>{savingProject ? 'Adding…' : 'Add project'}</button></form></div></section>
  </main>;
}
