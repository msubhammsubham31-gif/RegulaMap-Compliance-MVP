import { useMemo, useState, createContext, useContext, type ReactNode, type FormEvent } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import {
  Activity, AlertCircle, ArrowRight, BookOpen, Building2, CalendarDays, Check, ChevronLeft, CircleHelp,
  ClipboardCheck, Clock3, Download, FileText, Globe2, Leaf, ListTodo, LockKeyhole, Map,
  Menu, MessageSquareText, Network, Plus, Printer, RefreshCw, Search, Settings, ShieldAlert, ShieldCheck,
  Sparkles, X, Zap
} from 'lucide-react';
import {
  getGetRegulaMapOverviewQueryKey, useCreateComplianceAction, useGetRegulaMapOverview,
  useQueryComplianceAssistant, useUpdateComplianceAction
} from '@workspace/api-client-react';
import type {
  ActionPriority, ActionStatus, ComplianceAction, Facility, RegulaMapOverview, RiskAssessment
} from '@workspace/api-client-react';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });
type Overview = RegulaMapOverview;
const DataContext = createContext<Overview | null>(null);
const useWorkspace = () => {
  const data = useContext(DataContext);
  if (!data) throw new Error('Workspace data is unavailable');
  return data;
};

const navGroups = [
  { label: 'WORKSPACE', links: [
    { href: '/app/dashboard', label: 'Overview', icon: Activity },
    { href: '/app/map', label: 'Jurisdiction map', icon: Map },
    { href: '/app/regulations', label: 'Regulations', icon: BookOpen },
    { href: '/app/changes', label: 'Change feed', icon: Zap },
  ] },
  { label: 'EXECUTION', links: [
    { href: '/app/facilities', label: 'Facilities', icon: Building2 },
    { href: '/app/risks', label: 'Risk assessments', icon: ShieldAlert },
    { href: '/app/actions', label: 'Actions', icon: ClipboardCheck },
    { href: '/app/deadlines', label: 'Deadlines', icon: CalendarDays },
  ] },
  { label: 'INTELLIGENCE', links: [
    { href: '/app/assistant', label: 'Workspace assistant', icon: MessageSquareText },
    { href: '/app/reports', label: 'Reports', icon: FileText },
  ] },
];
const allLinks = navGroups.flatMap(g => g.links);

function Logo() {
  return <div className="brand"><span className="brand-mark"><Network /></span><span>RegulaMap</span></div>;
}

function Landing() {
  return <div className="landing">
    <header className="landing-nav">
      <Link href="/" className="brand"><span className="brand-mark"><Network /></span><span>RegulaMap</span></Link>
      <nav className="landing-links">
        <a href="#platform">Platform</a><a href="#method">How it works</a>
        <Link href="/login" className="btn ghost">Explore Demo <ArrowRight /></Link>
      </nav>
    </header>
    <main>
      <section className="landing-hero">
        <div className="hero-grid-bg" /><div className="orbital"><div className="orbit-core"><Network /></div><i className="orbit-node n1" /><i className="orbit-node n2" /><i className="orbit-node n3" /><i className="orbit-node n4" /></div>
        <div className="hero-copy">
          <div className="eyebrow">ENVIRONMENTAL REGULATORY INTELLIGENCE</div>
          <h1 className="hero-title">Know What Changed.<br /><span>Know What It Means.</span></h1>
          <p>RegulaMap helps organizations detect regulatory changes, understand business impact, and act before compliance deadlines.</p>
          <div className="hero-ctas"><Link href="/login" className="btn primary">Explore Demo <ArrowRight /></Link><Link href="/app/dashboard" className="btn ghost">View Dashboard</Link></div>
          <div className="proofline">Evidence first. Decisions with context. No black boxes.</div>
        </div>
      </section>
      <div className="landing-stats">
        {[['01','One evidence trail'],['02','Facility-level context'],['03','Risk you can explain'],['04','Action before due dates']].map(([n,t])=><div className="landing-stat" key={n}><strong>{n}</strong><span>{t}</span></div>)}
      </div>
      <section className="landing-section" id="platform">
        <div className="section-heading"><div className="eyebrow">FROM SIGNAL TO RESPONSE</div><h2>Regulatory change is only useful when you can see its reach.</h2><p>RegulaMap connects the original text to the rules, places, and work it may affect—so your team can move with confidence.</p></div>
        <div className="value-grid">
          <article className="value-card featured"><div className="value-icon"><Network /></div><h3>Regulatory Change Detection</h3><p>Compare previous and updated regulatory text, trace effective dates, and see which jurisdictions and facilities may be affected.</p></article>
          <article className="value-card"><div className="value-icon"><ShieldCheck /></div><h3>AI Impact Analysis</h3><p>Review a deterministic, evidence-linked summary and recommended next step without relying on an external AI service.</p></article>
          <article className="value-card"><div className="value-icon"><ListTodo /></div><h3>Compliance Risk Tracking</h3><p>Connect risk assessments to an accountable owner, priority, facility, and due date.</p></article>
        </div>
      </section>
      <LandingPreview />
      <section className="steps-band" id="method"><div className="landing-section">
        <div className="section-heading"><div className="eyebrow">A CLEAR PATH THROUGH CHANGE</div><h2>From published text to accountable work.</h2></div>
        <div className="step-list">{[['01','Detect','Bring material regulatory movement into view with dates, jurisdictions, and source context.'],['02','Assess','Connect the change to the facilities and operations in your workspace.'],['03','Act','Create follow-through that has an owner, a priority, and a deadline.']].map(([n,title,desc])=><article className="step" key={n}><span className="step-num">{n} / PROCESS</span><h3>{title}</h3><p>{desc}</p></article>)}</div>
      </div></section>
      <section className="landing-section"><div className="section-heading"><div className="eyebrow">BUILT FOR ACCOUNTABILITY</div><h2>Clarity for the people who own the outcome.</h2><p>Environmental compliance teams need a working picture—not another alert stream. RegulaMap puts evidence and response in the same frame.</p></div>
        <div className="value-grid">
          <article className="value-card"><div className="value-icon"><Globe2 /></div><h3>Jurisdiction-aware</h3><p>Review obligations by regulator and geography, then focus on the sites operating there.</p></article>
          <article className="value-card"><div className="value-icon"><Clock3 /></div><h3>Deadline-led</h3><p>Surface the dates that need attention alongside the actions and regulations behind them.</p></article>
        </div>
      </section>
    </main>
    <footer className="landing-footer"><span>REGULAMAP · ENVIRONMENTAL COMPLIANCE INTELLIGENCE</span><span>Demonstration data only · Not authoritative legal advice</span></footer>
  </div>;
}

function LandingPreview() {
  const query=useGetRegulaMapOverview();
  const d=query.data;
  const highRisk=d?.risks.filter(r=>r.level==='HIGH'||r.level==='CRITICAL').length||0;
  const openActions=d?.actions.filter(a=>a.status!=='COMPLETED').length||0;
  return <section className="landing-preview" id="preview"><div className="landing-section">
    <div className="preview-heading"><div className="section-heading"><div className="eyebrow">LIVE DEMO WORKSPACE</div><h2>A working view of regulatory exposure.</h2><p>Explore current demo records, upcoming deadlines, and the actions connected to them.</p></div><Link href="/app/dashboard" className="btn">View Dashboard <ArrowRight/></Link></div>
    {query.isPending?<div className="panel-body"><div className="skeleton"/></div>:query.isError?<div className="error-state">The live workspace preview is unavailable. Open the demo to retry.</div>:d&&<div className="preview-frame">
      <div className="preview-topline"><span>{d.organization.toUpperCase()}</span><span>DEMO · LIVE DATA</span></div>
      <div className="preview-kpis">{[['REGULATIONS',d.regulations.length],['RECENT CHANGES',d.changes.length],['HIGH RISK',highRisk],['OPEN ACTIONS',openActions],['DEADLINES',d.deadlines.length]].map(([label,value])=><div className="preview-kpi" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <div className="preview-columns"><div><div className="preview-section-title">RECENT REGULATORY CHANGES</div>{d.changes.slice(0,3).map(c=><div className="preview-row" key={c.id}><div><strong>{c.regulationTitle}</strong><span>{c.jurisdiction} · {c.changeType}</span></div><Severity level={c.riskLevel}/></div>)}</div><div><div className="preview-section-title">NEXT DEADLINES</div>{[...d.deadlines].sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).slice(0,3).map(x=><div className="preview-row" key={x.id}><div><strong>{x.title}</strong><span>{x.regulationTitle}</span></div><span className="deadline-date">{shortDate(x.dueDate)}</span></div>)}</div></div>
    </div>}
  </div></section>;
}

function Login() {
  const [, setLocation] = useLocation();
  return <main className="login-wrap">
    <section className="login-aside"><Link href="/" className="brand"><span className="brand-mark"><Network /></span><span>RegulaMap</span></Link>
      <div className="login-message"><div className="eyebrow">DEMONSTRATION WORKSPACE</div><h1>Start with the evidence.</h1><p>Explore a seeded environmental compliance workspace with regulations, facilities, regulatory changes, risks, and actions.</p></div>
      <div className="login-meta">A product demonstration · No account or password required</div>
    </section>
    <section className="login-main"><div className="login-card"><div className="eyebrow">REGULAMAP / DEMO</div><h2>Enter the workspace</h2><p>This demo opens directly into a sample organization. It does not create an account or represent a secure authentication flow.</p>
      <div className="demo-credentials"><div><span>Email</span><strong>demo@regulamap.com</strong></div><div><span>Password</span><strong>demo123</strong></div></div>
      <button className="btn primary" data-testid="button-demo-entry" onClick={()=>setLocation('/app/dashboard')}>Continue with Demo Account <ArrowRight /></button>
      <div className="login-note"><LockKeyhole /><span>Demo access is unprotected. Data shown in this workspace is illustrative and is not authoritative legal advice.</span></div>
      <div style={{marginTop:20}}><Link href="/" className="secondary-line">← Back to RegulaMap</Link></div>
    </div></section>
  </main>;
}

function Shell({ children }: { children: ReactNode }) {
  const [path] = useLocation();
  const [menuOpen,setMenuOpen] = useState(false);
  const query = useGetRegulaMapOverview();
  const active = allLinks.find(l => path === l.href || (l.href !== '/app/dashboard' && path.startsWith(l.href + '/')));
  const name = query.data?.organization || 'Demo workspace';
  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/app/dashboard" className="brand"><span className="brand-mark"><Network /></span><span>RegulaMap</span></Link>
      <div className="nav-list">{navGroups.map(group=><div key={group.label}><div className="nav-label">{group.label}</div>{group.links.map(item=><Link key={item.href} href={item.href} className={`nav-link ${active?.href===item.href?'active':''}`}><item.icon /><span>{item.label}</span></Link>)}</div>)}</div>
      <div className="side-bottom"><Link href="/app/settings" className={`nav-link ${path==='/app/settings'?'active':''}`}><Settings /><span>Settings</span></Link>
        <div className="demo-stamp"><strong>DEMO DATASET</strong>Illustrative regulatory content. Not authoritative legal advice.</div>
        <div className="profile"><div className="profile-avatar">EM</div><div className="profile-copy"><strong>Elena Marlow</strong><span>Compliance lead</span></div></div>
      </div>
    </aside>
    <div className="main-area">
      <header className="mobile-head"><Link href="/app/dashboard" className="brand"><span className="brand-mark"><Network /></span><span>RegulaMap</span></Link><button className="mobile-toggle" aria-label="Toggle navigation" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?<X/>:<Menu/>}</button></header>
      {menuOpen&&<nav className="mobile-menu">{allLinks.map(item=><Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)} className="nav-link"><item.icon/><span>{item.label}</span></Link>)}<Link href="/app/settings" className="nav-link" onClick={()=>setMenuOpen(false)}><Settings/><span>Settings</span></Link></nav>}
      <header className="topbar"><div className="crumb">Workspace&nbsp; / &nbsp;<strong>{active?.label || (path.includes('/regulations/')?'Regulation detail':path.includes('/changes/')?'Change detail':path.includes('/facilities/')?'Facility detail':'Overview')}</strong></div><div className="top-right"><span className="workspace-tag">{name}</span><span className="top-time">DEMO · LIVE DATA</span></div></header>
      {query.isLoading?<main className="content"><div className="page-head"><div><div className="eyebrow">WORKSPACE INITIALIZING</div><h1>Loading your compliance view</h1><p>Gathering regulations, facilities, and active work.</p></div></div><div className="metric-grid">{[1,2,3,4].map(n=><div className="skeleton" key={n}/>)}</div><div className="skeleton" style={{height:260}}/></main>
      :query.isError||!query.data?<main className="content"><div className="error-state"><div className="empty-mark"><AlertCircle/></div><h2>Workspace data could not load</h2><p>Check the connection and try again.</p><button className="btn" onClick={()=>query.refetch()}><RefreshCw/> Retry</button></div></main>
      :<DataContext.Provider value={query.data}>{children}</DataContext.Provider>}
    </div>
  </div>;
}
function Workspace({ children }: { children: ReactNode }) { return <Shell>{children}</Shell>; }
function Head({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="page-head"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>;
}
function Severity({ level }: { level: string }) {
  return <span className={`badge ${level.toLowerCase()}`}>{level}</span>;
}
function StatusBadge({ status }: { status: string }) { return <span className={`badge status-${status.toLowerCase()}`}>{status.replace('_',' ')}</span>; }
function RiskMeter({ score }: { score: number }) {
  const safe = Math.max(0,Math.min(100,score));
  return <span className="risk-meter"><span className="meter-track"><span className="meter-fill" style={{width:`${safe}%`}} /></span><span className="risk-num">{safe}</span></span>;
}
function Empty({ title, detail }: { title: string; detail: string }) { return <div className="empty"><div className="empty-mark"><Search/></div><strong>{title}</strong><p>{detail}</p></div>; }
function date(value?: string) { if (!value) return '—'; const d=new Date(value); return Number.isNaN(d.getTime())?value:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }
function shortDate(value?: string) { if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?value:d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); }
function getReg(data: Overview,id?: string) { return data.regulations.find(r=>r.id===id); }
function getFacility(data: Overview,id?: string|null) { return data.facilities.find(f=>f.id===id); }
function Panel({ title, subtitle, action, children, className='' }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-head"><div><div className="panel-title">{title}</div>{subtitle&&<div className="panel-subtitle">{subtitle}</div>}</div>{action}</div>{children}</section>;
}

function Dashboard() {
  const d=useWorkspace();
  const today=new Date().toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase();
  const highChanges=d.changes.filter(c=>['HIGH','CRITICAL'].includes(c.riskLevel)).length;
  const highRisks=d.risks.filter(r=>r.level==='HIGH'||r.level==='CRITICAL').length;
  const openActions=d.actions.filter(a=>a.status!=='COMPLETED').length;
  const nearest=[...d.deadlines].sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).slice(0,5);
  const max=Math.max(1,...d.changeTrend.map(t=>t.changes));
  const riskLevels=['CRITICAL','HIGH','MEDIUM','LOW'] as const;
  const riskCounts=riskLevels.map(level=>({level,count:d.risks.filter(r=>r.level===level).length}));
  const riskMax=Math.max(1,...riskCounts.map(x=>x.count));
  return <main className="content">
    <Head eyebrow={`${today} / OVERVIEW`} title={`Good morning, Elena`} subtitle={`A clear view of ${d.organization}'s regulatory exposure and the work ahead.`} action={<Link href="/app/reports" className="btn"><Download/> Export overview</Link>} />
    <div className="metric-grid">
      <Metric icon={<BookOpen/>} label="Tracked regulations" value={d.regulations.length} note="Across active jurisdictions"/>
      <Metric icon={<Zap/>} label="Changes to review" value={d.changes.length} note={<><span className="up">{highChanges} high priority</span> · identified in workspace</>}/>
      <Metric icon={<ShieldAlert/>} label="High risk items" value={highRisks} note="Critical and high assessments"/>
      <Metric icon={<ClipboardCheck/>} label="Open actions" value={openActions} note={`${d.actions.filter(a=>a.status==='COMPLETED').length} completed in this workspace`}/>
      <Metric icon={<CalendarDays/>} label="Upcoming deadlines" value={d.deadlines.length} note="Linked to open actions"/>
    </div>
    <div className="two-col">
      <Panel title="Regulatory movement" subtitle="Monthly changes and current risk distribution" action={<span className="badge informational">6 MONTHS</span>}>
        <div className="panel-body"><div className="chart-area">{d.changeTrend.map((t,i)=><div className="chart-bar-wrap" key={`${t.month}-${i}`} title={`${t.changes} changes`}><div className="chart-bar" style={{height:`${Math.max(8,t.changes/max*90)}%`}}/></div>)}</div><div className="chart-labels">{d.changeTrend.map((t,i)=><span key={i}>{t.month.slice(0,3)}</span>)}</div>
          <div className="risk-distribution"><div className="eyebrow">Risk distribution · {d.risks.length} assessments</div>{riskCounts.map(({level,count})=><div className="distribution-row" key={level}><span>{level}</span><div className="distribution-track"><div className={`distribution-fill ${level.toLowerCase()}`} style={{width:`${count/riskMax*100}%`}}/></div><strong>{count}</strong></div>)}</div>
        </div>
      </Panel>
      <Panel title="Upcoming deadlines" subtitle="Dates connected to actions and obligations" action={<Link href="/app/deadlines" className="secondary-line">View calendar →</Link>}>
        <div className="panel-body mini-list">{nearest.length?nearest.map(dl=><Link href={dl.actionId?'/app/actions':'/app/regulations/'+dl.regulationId} className="mini-row" key={dl.id}><div><div className="main">{dl.title}</div><div className="sub">{dl.regulationTitle}</div></div><div style={{textAlign:'right'}}><div className="deadline-date">{shortDate(dl.dueDate)}</div><Severity level={dl.riskLevel}/></div></Link>):<Empty title="No deadlines listed" detail="Due dates will appear here when provided in workspace data."/>}</div>
      </Panel>
    </div>
    <div className="two-col">
      <Panel title="Recent regulatory changes" subtitle="Evidence-backed updates to review" action={<Link href="/app/changes" className="secondary-line">All changes →</Link>}>
        {d.changes.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>Change</th><th>Jurisdiction</th><th>Risk</th><th>Effective</th></tr></thead><tbody>{d.changes.slice(0,5).map(c=><tr key={c.id}><td><Link href={`/app/changes/${c.id}`} className="link-title">{c.regulationTitle}</Link><span className="secondary-line">{c.changeType} · {shortDate(c.detectedDate)}</span></td><td>{c.jurisdiction}</td><td><Severity level={c.riskLevel}/></td><td>{date(c.effectiveDate)}</td></tr>)}</tbody></table></div>:<Empty title="No change records yet" detail="The change feed will appear here once data is available."/>}
      </Panel>
      <Panel title="Actions needing attention" subtitle="Current work across facilities" action={<Link href="/app/actions" className="secondary-line">Manage actions →</Link>}>
        <div className="panel-body mini-list">{d.actions.filter(a=>a.status!=='COMPLETED').slice(0,5).map(a=><div className="mini-row" key={a.id}><div><div className="main">{a.title}</div><div className="sub">{a.assignedTo} · due {shortDate(a.dueDate)}</div></div><StatusBadge status={a.status}/></div>)}</div>
      </Panel>
    </div>
    <div className="secondary-line">Demonstration content only. Confirm obligations with the official source and qualified counsel.</div>
  </main>;
}
function Metric({ icon,label,value,note }: { icon: ReactNode;label: string;value: ReactNode;note: ReactNode }) { return <div className="metric"><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></div>; }

function RegulationDirectory() {
  const d=useWorkspace();const [search,setSearch]=useState('');const [jurisdiction,setJurisdiction]=useState('All jurisdictions');const [category,setCategory]=useState('All categories');const [risk,setRisk]=useState('All risk levels');
  const jurisdictions=useMemo(()=>['All jurisdictions',...new Set(d.regulations.map(r=>r.jurisdiction))],[d.regulations]);
  const categories=useMemo(()=>['All categories',...new Set(d.regulations.map(r=>r.category))],[d.regulations]);
  const rows=d.regulations.filter(r=>(`${r.title} ${r.shortTitle} ${r.regulator} ${r.category}`.toLowerCase().includes(search.toLowerCase()))&&(jurisdiction==='All jurisdictions'||r.jurisdiction===jurisdiction)&&(category==='All categories'||r.category===category)&&(risk==='All risk levels'||r.riskLevel===risk));
  return <main className="content"><Head eyebrow="REGULATORY LIBRARY" title="Regulations" subtitle="Search and review tracked requirements, applicability, and source information."/>
    <div className="toolbar"><div className="searchbox"><Search/><input className="field" placeholder="Search title, regulator, category…" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search regulations" data-testid="input-regulation-search"/></div><select className="select" value={jurisdiction} onChange={e=>setJurisdiction(e.target.value)} aria-label="Filter jurisdiction">{jurisdictions.map(j=><option key={j}>{j}</option>)}</select><select className="select" value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter category">{categories.map(c=><option key={c}>{c}</option>)}</select><select className="select" value={risk} onChange={e=>setRisk(e.target.value)} aria-label="Filter risk"><option>All risk levels</option>{['CRITICAL','HIGH','MEDIUM','LOW','INFORMATIONAL'].map(v=><option key={v}>{v}</option>)}</select><span className="secondary-line">{rows.length} results</span></div>
    <Panel title="Tracked regulations" subtitle="Workspace directory · demonstration data">
      {rows.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>Regulation</th><th>Jurisdiction / regulator</th><th>Category</th><th>Risk</th><th>Effective</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><Link className="link-title" href={`/app/regulations/${r.id}`}>{r.shortTitle||r.title}</Link><span className="secondary-line">{r.title}</span></td><td>{r.jurisdiction}<span className="secondary-line">{r.regulator}</span></td><td>{r.category}</td><td><div className="risk-meter"><Severity level={r.riskLevel}/><span className="risk-num">{r.riskScore}</span></div></td><td>{date(r.effectiveDate)}</td><td>{r.status}</td></tr>)}</tbody></table></div>:<Empty title="No regulations match" detail="Adjust your search or filters to see tracked requirements."/>}
    </Panel>
    <p className="secondary-line" style={{marginTop:14}}>All regulatory records are demonstration data and are not authoritative legal advice.</p>
  </main>;
}

function RegulationDetail() {
  const d=useWorkspace();const {id}=useParams<{id:string}>();const r=getReg(d,id);const [versionA,setVersionA]=useState('');const [versionB,setVersionB]=useState('');
  if(!r)return <main className="content"><Head eyebrow="REGULATION" title="Record not found" subtitle="This regulation is not present in the demonstration workspace."/><Link href="/app/regulations" className="btn"><ChevronLeft/> Return to regulations</Link></main>;
  const related=d.changes.filter(c=>c.regulationId===r.id);
  const older=r.versions.find(v=>v.id===(versionA||r.versions[0]?.id))||r.versions[0];
  const newer=r.versions.find(v=>v.id===(versionB||r.versions[1]?.id))||r.versions[1];
  return <main className="content"><Head eyebrow={`${r.jurisdiction} / ${r.regulator}`} title={r.shortTitle||r.title} subtitle={r.title}/>
    <div className="regulation-hero"><div className="eyebrow">DEMONSTRATION REGULATION · {r.category}</div><h2>At a glance</h2><p>{r.description}</p></div>
    <div className="detail-grid"><div>
      <Panel title="Applicability" subtitle="Workspace interpretation · verify against official text"><div className="panel-body"><p className="detail-copy">{r.applicability}</p><div className="info-grid"><Info label="Jurisdiction" value={r.jurisdiction}/><Info label="Regulator" value={r.regulator}/><Info label="Publication date" value={date(r.publicationDate)}/><Info label="Effective date" value={date(r.effectiveDate)}/><Info label="Status" value={r.status}/><Info label="Risk score" value={`${r.riskScore} / 100 · ${r.riskLevel}`}/></div></div></Panel>
      <Panel title="Version history" subtitle="Compare recorded versions"><div className="panel-body">{r.versions.length?r.versions.map(v=><div className="version-row" key={v.id}><div className="version-number">v{v.version}</div><div className="version-date">{date(v.publishedAt)}</div><div><p>{v.summary}</p><p className="secondary-line" style={{whiteSpace:'pre-wrap',marginTop:8}}>{v.text}</p></div></div>):<Empty title="No versions recorded" detail="Version comparison is not available for this record."/>}</div></Panel>
      {r.versions.length>1&&<Panel title="Compare versions" subtitle="Select two recorded versions to review their text side by side"><div className="panel-body">
        <div className="toolbar"><label className="secondary-line">Earlier version <select className="select" value={older?.id||''} onChange={e=>setVersionA(e.target.value)}>{r.versions.map(v=><option value={v.id} key={v.id}>v{v.version} · {date(v.publishedAt)}</option>)}</select></label><label className="secondary-line">Later version <select className="select" value={newer?.id||''} onChange={e=>setVersionB(e.target.value)}>{r.versions.map(v=><option value={v.id} key={v.id}>v{v.version} · {date(v.publishedAt)}</option>)}</select></label></div>
        {older&&newer?<TextComparison before={older.text} after={newer.text} leftLabel={`VERSION ${older.version} · ${older.summary}`} rightLabel={`VERSION ${newer.version} · ${newer.summary}`}/>:<Empty title="Select versions to compare" detail="Two version records are required for a comparison."/>}
      </div></Panel>}
    </div><div>
      <Panel title="Source information" subtitle="Demonstration record"><div className="panel-body"><p className="detail-copy">{r.source}</p><p className="secondary-line" style={{marginTop:10}}>No authoritative publication is attached to this sample record.</p></div></Panel>
      <Panel title="Risk assessment" subtitle="Deterministic workspace score"><div className="panel-body"><div className="risk-summary"><div className="risk-score-big">{r.riskScore}</div><div><Severity level={r.riskLevel}/><p style={{marginTop:8}}>Score supplied by demonstration data. Review official source before decisions.</p></div></div></div></Panel>
      <Panel title="Related changes" subtitle={`${related.length} change records`}><div className="panel-body mini-list">{related.length?related.map(c=><Link href={`/app/changes/${c.id}`} className="mini-row" key={c.id}><div><div className="main">{c.changeType}</div><div className="sub">{c.summary}</div></div><Severity level={c.riskLevel}/></Link>):<Empty title="No related changes" detail="No changes are linked to this regulation."/>}</div></Panel>
    </div></div>
    <div style={{marginTop:14}}><Link href="/app/regulations" className="secondary-line">← All regulations</Link></div>
  </main>;
}
function Info({label,value}:{label:string;value:ReactNode}){return <div className="info-item"><span>{label}</span><strong>{value||'—'}</strong></div>}
type DiffPart={text:string;kind:'same'|'removed'|'added'};
function diffText(before:string,after:string){
  const tokenize=(text:string)=>text.match(/\s+|[A-Za-z0-9]+(?:[.'’-][A-Za-z0-9]+)*|[^\sA-Za-z0-9]/g)||[];
  const oldTokens=tokenize(before),newTokens=tokenize(after);
  const table:number[][]=Array.from({length:oldTokens.length+1},()=>Array(newTokens.length+1).fill(0));
  for(let i=oldTokens.length-1;i>=0;i--)for(let j=newTokens.length-1;j>=0;j--)table[i]![j]=oldTokens[i]===newTokens[j]?1+table[i+1]![j+1]!:Math.max(table[i+1]![j]!,table[i]![j+1]!);
  const oldParts:DiffPart[]=[],newParts:DiffPart[]=[];
  const append=(parts:DiffPart[],text:string,kind:DiffPart['kind'])=>{const last=parts[parts.length-1];if(last?.kind===kind)last.text+=text;else parts.push({text,kind});};
  let i=0,j=0;
  while(i<oldTokens.length||j<newTokens.length){
    if(i<oldTokens.length&&j<newTokens.length&&oldTokens[i]===newTokens[j]){append(oldParts,oldTokens[i]!,'same');append(newParts,newTokens[j]!,'same');i++;j++;}
    else if(i<oldTokens.length&&(j===newTokens.length||table[i+1]![j]!>=table[i]![j+1]!)){append(oldParts,oldTokens[i]!,'removed');i++;}
    else{append(newParts,newTokens[j]!,'added');j++;}
  }
  return {oldParts,newParts};
}
function TextComparison({before,after,leftLabel,rightLabel}:{before:string;after:string;leftLabel:string;rightLabel:string}){
  const {oldParts,newParts}=diffText(before,after);
  const render=(parts:DiffPart[])=>parts.map((part,index)=><span key={`${part.kind}-${index}`} className={part.kind==='same'?'':`diff-mark-${part.kind}`}>{part.text}</span>);
  return <><div className="diff-legend"><span><i className="diff-swatch removed"/>Removed</span><span><i className="diff-swatch added"/>Added</span></div><div className="diff-block"><div className="diff-col old"><div className="diff-label">{leftLabel}</div><div className="diff-text">{render(oldParts)}</div></div><div className="diff-col new"><div className="diff-label">{rightLabel}</div><div className="diff-text">{render(newParts)}</div></div></div></>;
}

function ChangeFeed() {
  const d=useWorkspace();const [search,setSearch]=useState('');const [risk,setRisk]=useState('All risk levels');const [type,setType]=useState('All change types');
  const types=useMemo(()=>['All change types',...new Set(d.changes.map(c=>c.changeType))],[d.changes]);
  const rows=d.changes.filter(c=>(`${c.regulationTitle} ${c.summary} ${c.jurisdiction}`.toLowerCase().includes(search.toLowerCase()))&&(risk==='All risk levels'||c.riskLevel===risk)&&(type==='All change types'||c.changeType===type));
  return <main className="content"><Head eyebrow="REGULATORY MONITORING" title="Change feed" subtitle="New and updated requirements, with source-linked context and operational relevance."/>
    <div className="toolbar"><div className="searchbox"><Search/><input className="field" placeholder="Search changes…" value={search} onChange={e=>setSearch(e.target.value)} data-testid="input-change-search"/></div><select className="select" value={risk} onChange={e=>setRisk(e.target.value)}><option>All risk levels</option>{['CRITICAL','HIGH','MEDIUM','LOW','INFORMATIONAL'].map(v=><option key={v}>{v}</option>)}</select><select className="select" value={type} onChange={e=>setType(e.target.value)}>{types.map(v=><option key={v}>{v}</option>)}</select><span className="secondary-line">{rows.length} changes</span></div>
    <Panel title="Detected regulatory changes" subtitle="Ordered by detection date">
      {rows.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>Change / regulation</th><th>Jurisdiction</th><th>Detected</th><th>Effective</th><th>Risk</th><th>Confidence</th></tr></thead><tbody>{[...rows].sort((a,b)=>b.detectedDate.localeCompare(a.detectedDate)).map(c=><tr key={c.id}><td><Link href={`/app/changes/${c.id}`} className="link-title">{c.regulationTitle}</Link><span className="secondary-line">{c.changeType} · {c.summary}</span></td><td>{c.jurisdiction}</td><td>{date(c.detectedDate)}</td><td>{date(c.effectiveDate)}</td><td><Severity level={c.riskLevel}/></td><td>{Math.round(c.confidence*100)}%</td></tr>)}</tbody></table></div>:<Empty title="No changes match" detail="Try a different search or remove filters."/>}
    </Panel>
  </main>;
}
function ChangeDetail() {
  const d=useWorkspace();const {id}=useParams<{id:string}>();const c=d.changes.find(x=>x.id===id);
  if(!c)return <main className="content"><Head eyebrow="CHANGE RECORD" title="Change not found" subtitle="This record is not present in the demonstration workspace."/><Link href="/app/changes" className="btn"><ChevronLeft/> Back to changes</Link></main>;
  const delta=Math.abs(c.riskScore-(getReg(d,c.regulationId)?.riskScore||0));
  return <main className="content">
    <Head eyebrow={`${c.jurisdiction} / ${c.changeType}`} title={c.regulationTitle} subtitle={`Detected ${date(c.detectedDate)} · Effective ${date(c.effectiveDate)}`} action={<Link href={`/app/regulations/${c.regulationId}`} className="btn">View regulation <ArrowRight/></Link>}/>
    <div className="detail-grid"><div>
      <Panel title="Text comparison" subtitle="Recorded prior text and updated text · demonstration excerpt">
        <div className="panel-body"><TextComparison before={c.oldText||'No previous text excerpt was supplied.'} after={c.newText||'No updated text excerpt was supplied.'} leftLabel="PREVIOUS TEXT" rightLabel="UPDATED TEXT"/>
        <p className="detail-copy" style={{margin:'17px 0 0'}}><strong>Why it matters</strong><br/>{c.whyItMatters}</p></div>
      </Panel>
      <Panel title="Potential operational reach" subtitle="Related entities provided with this change"><div className="panel-body">
        {[['Facilities',c.facilities],['Products',c.products],['Processes',c.processes],['Suppliers',c.suppliers]].map(([label,values])=><div style={{marginBottom:13}} key={label as string}><div className="eyebrow">{label as string}</div><div className="impact-list">{(values as string[]).length?(values as string[]).map(v=><span className="impact-chip" key={v}>{v}</span>):<span className="secondary-line">None listed</span>}</div></div>)}
      </div></Panel>
    </div><div>
      <Panel title="Risk assessment" subtitle="Deterministic from supplied score"><div className="panel-body"><div className="risk-summary"><div className="risk-score-big">{c.riskScore}</div><div><Severity level={c.riskLevel}/><p style={{marginTop:8}}>Risk score supplied with this record. Change-to-regulation score difference: {delta} points.</p></div></div><div style={{marginTop:17}} className="info-grid"><Info label="Confidence" value={`${Math.round(c.confidence*100)}%`}/><Info label="Detected" value={date(c.detectedDate)}/><Info label="Effective" value={date(c.effectiveDate)}/><Info label="Change type" value={c.changeType}/></div></div></Panel>
      <Panel title="Recommended action" subtitle="Workspace suggestion"><div className="panel-body"><p className="detail-copy">{c.recommendedAction}</p><Link href="/app/actions" className="btn primary">Review actions <ArrowRight/></Link></div></Panel>
      <Panel title="Evidence source"><div className="panel-body"><p className="detail-copy">{c.source}</p><div className="secondary-line" style={{marginTop:11}}>No authoritative publication is attached to this sample change. Verify material obligations against official sources.</div></div></Panel>
    </div></div>
    <p className="secondary-line" style={{marginTop:16}}>AI-generated regulatory analysis is not legal advice. Verify material obligations against authoritative sources and qualified professionals.</p>
  </main>;
}

function MapPage() {
  const d=useWorkspace();const [selected,setSelected]=useState<string|null>(null);const [filter,setFilter]=useState('All');
  const jurisdictions=useMemo(()=>[...new Set(d.regulations.map(r=>r.jurisdiction))],[d.regulations]);
  const visibleJurisdictions=jurisdictions.filter(j=>{
    const regulations=d.regulations.filter(r=>r.jurisdiction===j);
    const changes=d.changes.filter(c=>c.jurisdiction===j);
    if(filter==='High Risk')return regulations.some(r=>r.riskLevel==='HIGH'||r.riskLevel==='CRITICAL')||changes.some(c=>c.riskLevel==='HIGH'||c.riskLevel==='CRITICAL');
    if(filter==='Recent Changes')return changes.some(c=>Date.now()-new Date(c.detectedDate).getTime()<=90*86400000);
    return true;
  });
  const selectedName=visibleJurisdictions.includes(selected||'')?selected:visibleJurisdictions[0]||null;
  const regulations=selectedName?d.regulations.filter(r=>r.jurisdiction===selectedName):[];
  const changes=selectedName?[...d.changes.filter(c=>c.jurisdiction===selectedName)].sort((a,b)=>b.detectedDate.localeCompare(a.detectedDate)):[];
  const highRiskChanges=changes.filter(c=>c.riskLevel==='HIGH'||c.riskLevel==='CRITICAL');
  const points=['19%','48%','72%','34%','59%','83%','44%','14%'];
  return <main className="content"><Head eyebrow="GEOGRAPHIC EXPOSURE" title="Jurisdiction map" subtitle="Explore regulatory activity by jurisdiction and see the workspace records behind each summary."/>
    <div className="toolbar"><select className="select" aria-label="Filter map jurisdictions" value={filter} onChange={e=>setFilter(e.target.value)}>{['All','High Risk','Recent Changes'].map(value=><option key={value}>{value}</option>)}</select><span className="secondary-line">{visibleJurisdictions.length} jurisdictions</span></div>
    <div className="map-layout"><div className="map-canvas"><div className="map-grid"/><div className="map-land"/>
      <div className="map-points">{visibleJurisdictions.map((j,i)=><button key={j} aria-pressed={selectedName===j} onClick={()=>setSelected(j)} className={`map-pin ${selectedName===j?'selected':''}`} style={{left:points[(i*2)%points.length],top:points[(i*3+1)%points.length]}}>{j}</button>)}</div><div className="map-caption">JURISDICTIONS IN DEMONSTRATION WORKSPACE</div>
    </div>
    <Panel title={selectedName||'Jurisdiction overview'} subtitle="Selected jurisdiction summary"><div className="panel-body">
      {selectedName?<><div className="metric-grid" style={{gridTemplateColumns:'repeat(3,minmax(0,1fr))'}}><Metric icon={<BookOpen/>} label="Regulations" value={regulations.length} note="Tracked here"/><Metric icon={<Zap/>} label="Changes" value={changes.length} note="Linked changes"/><Metric icon={<ShieldAlert/>} label="High-risk changes" value={highRiskChanges.length} note="Critical and high"/></div>
      <div className="eyebrow" style={{marginTop:14}}>REGULATIONS</div><div className="mini-list">{regulations.length?regulations.slice(0,5).map(r=><Link className="mini-row" href={`/app/regulations/${r.id}`} key={r.id}><div><div className="main">{r.shortTitle||r.title}</div><div className="sub">{r.regulator}</div></div><Severity level={r.riskLevel}/></Link>):<div className="secondary-line">No regulations listed for this jurisdiction.</div>}</div>
      <div className="eyebrow" style={{marginTop:16}}>RECENT CHANGES</div><div className="mini-list">{changes.length?changes.slice(0,4).map(c=><Link className="mini-row" href={`/app/changes/${c.id}`} key={c.id}><div><div className="main">{c.changeType}</div><div className="sub">{c.summary}</div></div><Severity level={c.riskLevel}/></Link>):<div className="secondary-line">No changes listed for this jurisdiction.</div>}</div></>:<div className="empty"><div className="empty-mark"><Globe2/></div>No jurisdictions match this filter.</div>}
    </div></Panel></div>
    <p className="secondary-line" style={{marginTop:13}}>Schematic jurisdiction view; boundaries are illustrative and not geographic data.</p>
  </main>;
}

function Facilities() {
  const d=useWorkspace();const [search,setSearch]=useState('');const [risk,setRisk]=useState('All risk levels');
  const rows=d.facilities.filter(f=>(`${f.name} ${f.city} ${f.country} ${f.facilityType}`.toLowerCase().includes(search.toLowerCase()))&&(risk==='All risk levels'||f.riskLevel===risk));
  return <main className="content"><Head eyebrow="OPERATIONAL FOOTPRINT" title="Facilities" subtitle="Understand operational context and the regulations connected to each site."/>
    <div className="toolbar"><div className="searchbox"><Search/><input className="field" placeholder="Search facilities…" value={search} onChange={e=>setSearch(e.target.value)}/></div><select className="select" value={risk} onChange={e=>setRisk(e.target.value)}><option>All risk levels</option>{['CRITICAL','HIGH','MEDIUM','LOW','INFORMATIONAL'].map(v=><option key={v}>{v}</option>)}</select><span className="secondary-line">{rows.length} facilities</span></div>
    <Panel title="Facility directory" subtitle="Sites connected to the organization">
      {rows.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>Facility</th><th>Location</th><th>Type</th><th>Risk</th><th>Emissions</th><th>Water</th><th>Energy</th></tr></thead><tbody>{rows.map(f=><tr key={f.id}><td><Link href={`/app/facilities/${f.id}`} className="link-title">{f.name}</Link><span className="secondary-line">{f.regulationIds.length} linked regulations</span></td><td>{f.city}, {f.country}</td><td>{f.facilityType}</td><td><div className="risk-meter"><Severity level={f.riskLevel}/><span className="risk-num">{f.riskScore}</span></div></td><td>{f.emissions.toLocaleString()} tCO₂e</td><td>{f.waterUsage.toLocaleString()} m³</td><td>{f.energy.toLocaleString()} MWh</td></tr>)}</tbody></table></div>:<Empty title="No facilities match" detail="Change your search or filters."/>}
    </Panel>
  </main>;
}
function FacilityDetail() {
  const d=useWorkspace();const {id}=useParams<{id:string}>();const f=d.facilities.find(x=>x.id===id);
  if(!f)return <main className="content"><Head eyebrow="FACILITY" title="Facility not found" subtitle="This facility is not present in the demonstration workspace."/><Link href="/app/facilities" className="btn"><ChevronLeft/> Facilities</Link></main>;
  const regs=d.regulations.filter(r=>f.regulationIds.includes(r.id));const relatedActions=d.actions.filter(a=>a.facilityId===f.id);
  return <main className="content"><Head eyebrow={`${f.city}, ${f.country} / ${f.facilityType}`} title={f.name} subtitle="Facility operational context and related compliance work." action={<Link href="/app/actions" className="btn primary"><Plus/> Create action</Link>}/>
    <div className="metric-grid"><Metric icon={<ShieldAlert/>} label="Risk score" value={f.riskScore} note={<Severity level={f.riskLevel}/>}/><Metric icon={<Leaf/>} label="Emissions" value={f.emissions.toLocaleString()} note="tCO₂e"/><Metric icon={<Activity/>} label="Water usage" value={f.waterUsage.toLocaleString()} note="m³"/><Metric icon={<Zap/>} label="Energy" value={f.energy.toLocaleString()} note="MWh"/></div>
    <div className="detail-grid"><Panel title="Operational context" subtitle="Facility details"><div className="panel-body"><div className="info-grid"><Info label="Facility type" value={f.facilityType}/><Info label="Location" value={`${f.city}, ${f.country}`}/><Info label="Risk level" value={<Severity level={f.riskLevel}/>}/><Info label="Risk score" value={`${f.riskScore} / 100`}/></div>
      <div className="eyebrow" style={{marginTop:22}}>PROCESSES</div><div className="impact-list">{f.processes.map(p=><span className="impact-chip" key={p}>{p}</span>)}</div><div className="eyebrow" style={{marginTop:17}}>PRODUCTS</div><div className="impact-list">{f.products.map(p=><span className="impact-chip" key={p}>{p}</span>)}</div></div></Panel>
      <div><Panel title="Related regulations" subtitle={`${regs.length} linked`}><div className="panel-body mini-list">{regs.length?regs.map(r=><Link href={`/app/regulations/${r.id}`} className="mini-row" key={r.id}><div><div className="main">{r.shortTitle||r.title}</div><div className="sub">{r.jurisdiction}</div></div><Severity level={r.riskLevel}/></Link>):<Empty title="No linked regulations" detail="No regulation IDs were provided for this site."/>}</div></Panel>
      <Panel title="Open actions" subtitle={`${relatedActions.length} linked actions`}><div className="panel-body mini-list">{relatedActions.length?relatedActions.map(a=><div className="mini-row" key={a.id}><div><div className="main">{a.title}</div><div className="sub">Due {date(a.dueDate)}</div></div><StatusBadge status={a.status}/></div>):<Empty title="No linked actions" detail="Create an action from the Actions workspace."/>}</div></Panel></div>
    </div><div style={{marginTop:14}}><Link href="/app/facilities" className="secondary-line">← All facilities</Link></div>
  </main>;
}

function Risks() {
  const d=useWorkspace();const [level,setLevel]=useState('All risk levels');const [entity,setEntity]=useState('All entities');
  const rows=d.risks.filter(r=>(level==='All risk levels'||r.level===level)&&(entity==='All entities'||r.entityType===entity));
  const entities=[...new Set(d.risks.map(r=>r.entityType))];
  return <main className="content"><Head eyebrow="EXPOSURE REVIEW" title="Risk assessments" subtitle="Prioritize potential impact with a transparent score, entity, and recommended next step."/>
    <div className="toolbar"><select className="select" value={level} onChange={e=>setLevel(e.target.value)}><option>All risk levels</option>{['CRITICAL','HIGH','MEDIUM','LOW','INFORMATIONAL'].map(v=><option key={v}>{v}</option>)}</select><select className="select" value={entity} onChange={e=>setEntity(e.target.value)}><option>All entities</option>{entities.map(v=><option key={v}>{v}</option>)}</select><span className="secondary-line">{rows.length} assessments</span></div>
    <div className="risk-engine-note">Demo score = Scope 15% + Severity 25% + Proximity 20% + Obligation 15% + Exposure 25%. Bands: 0–20 informational · 21–40 low · 41–60 medium · 61–80 high · 81–100 critical. Scores are illustrative.</div>
    <Panel title="Risk register" subtitle="Scores and impact narratives supplied by the demonstration workspace">
      {rows.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>Entity</th><th>Type</th><th>Score</th><th>Level</th><th>Potential impact</th><th>Recommended action</th></tr></thead><tbody>{rows.map(r=><RiskRow key={r.id} risk={r}/>)}</tbody></table></div>:<Empty title="No risk assessments match" detail="Adjust the filters to review more assessments."/>}
    </Panel>
  </main>;
}
function RiskRow({risk:r}:{risk:RiskAssessment}) {
  const href=r.entityType.toLowerCase()==='regulation'?`/app/regulations/${r.entityId}`:`/app/facilities/${r.entityId}`;
  const factors=[['Scope',r.factorScores.scope],['Severity',r.factorScores.severity],['Proximity',r.factorScores.proximity],['Obligation',r.factorScores.obligation],['Exposure',r.factorScores.exposure]] as const;
  return <tr><td><Link href={href} className="link-title">{r.name}</Link></td><td>{r.entityType}</td><td><RiskMeter score={r.score}/></td><td><Severity level={r.level}/></td><td>{r.impact}<details className="risk-factor-details"><summary>Scoring factors</summary><div className="risk-factor-grid">{factors.map(([name,value])=><span key={name}>{name}<strong>{value}</strong></span>)}</div></details></td><td>{r.recommendedAction}</td></tr>;
}

function ActionCreateModal({onClose}:{onClose:()=>void}) {
  const d=useWorkspace();const qc=useQueryClient();const create=useCreateComplianceAction();const [error,setError]=useState('');
  const [form,setForm]=useState({title:'',description:'',regulationId:d.regulations[0]?.id||'',facilityId:'',assignedTo:'Elena Marlow',priority:'MEDIUM' as ActionPriority,status:'OPEN' as ActionStatus,dueDate:''});
  const submit=(e:FormEvent)=>{e.preventDefault();setError('');create.mutate({data:{...form,facilityId:form.facilityId||null}}, {onSuccess:()=>{qc.invalidateQueries({queryKey:getGetRegulaMapOverviewQueryKey()});onClose();},onError:()=>setError('The action could not be created. Review required fields and retry.')});};
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-action-title"><div className="modal-head"><h2 id="create-action-title">Create compliance action</h2><button className="btn ghost" aria-label="Close" onClick={onClose}><X/></button></div>
    <form className="modal-body" onSubmit={submit}><div className="form-grid">
      <div className="form-field wide"><label>Action title</label><input className="field" required minLength={3} maxLength={140} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Review updated monitoring threshold"/></div>
      <div className="form-field wide"><label>Description</label><textarea required minLength={3} maxLength={1000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the work to be completed."/></div>
      <div className="form-field"><label>Regulation</label><select className="select" required value={form.regulationId} onChange={e=>setForm({...form,regulationId:e.target.value})}>{d.regulations.map(r=><option value={r.id} key={r.id}>{r.shortTitle||r.title}</option>)}</select></div>
      <div className="form-field"><label>Facility</label><select className="select" value={form.facilityId} onChange={e=>setForm({...form,facilityId:e.target.value})}><option value="">Organization-wide</option>{d.facilities.map(f=><option value={f.id} key={f.id}>{f.name}</option>)}</select></div>
      <div className="form-field"><label>Assigned to</label><input className="field" required minLength={2} maxLength={80} value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})}/></div>
      <div className="form-field"><label>Due date</label><input className="field" type="date" required value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
      <div className="form-field"><label>Priority</label><select className="select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as ActionPriority})}>{['LOW','MEDIUM','HIGH','CRITICAL'].map(v=><option key={v}>{v}</option>)}</select></div>
    </div>{error&&<div className="toast-inline" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={create.isPending}>{create.isPending?'Creating…':'Create action'} <ArrowRight/></button></div></form>
  </section></div>;
}
function ActionDetailModal({action,onClose}:{action:ComplianceAction;onClose:()=>void}) {
  const d=useWorkspace();const qc=useQueryClient();const update=useUpdateComplianceAction();const [status,setStatus]=useState<ActionStatus>(action.status);const [error,setError]=useState('');
  const regulation=getReg(d,action.regulationId);const facility=getFacility(d,action.facilityId);
  const save=()=>{setError('');update.mutate({id:action.id,data:{status}},{onSuccess:()=>{qc.invalidateQueries({queryKey:getGetRegulaMapOverviewQueryKey()});onClose();},onError:()=>setError('Could not update action status. Retry the change.')});};
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal action-detail-modal" role="dialog" aria-modal="true" aria-labelledby="action-detail-title">
    <div className="modal-head"><div><div className="eyebrow">COMPLIANCE ACTION</div><h2 id="action-detail-title">{action.title}</h2></div><button className="btn ghost" aria-label="Close action details" onClick={onClose}><X/></button></div>
    <div className="modal-body"><p className="action-description">{action.description}</p><div className="info-grid">
      <Info label="Regulation" value={regulation?<Link href={`/app/regulations/${regulation.id}`}>{regulation.shortTitle||regulation.title}</Link>:action.regulationId}/>
      <Info label="Facility" value={facility?<Link href={`/app/facilities/${facility.id}`}>{facility.name}</Link>:'Organization-wide'}/>
      <Info label="Owner" value={action.assignedTo}/><Info label="Priority" value={<Severity level={action.priority}/>}/>
      <Info label="Due date" value={date(action.dueDate)}/><Info label="Created" value={date(action.createdAt)}/>
    </div><div className="form-field action-status-field"><label htmlFor="action-detail-status">Status</label><select id="action-detail-status" className="select" value={status} onChange={e=>setStatus(e.target.value as ActionStatus)}>{['OPEN','IN_PROGRESS','BLOCKED','COMPLETED'].map(value=><option key={value}>{value}</option>)}</select></div>
    {error&&<div className="toast-inline" role="alert">{error}</div>}<div className="modal-actions"><button className="btn ghost" onClick={onClose}>Close</button><button className="btn primary" disabled={update.isPending||status===action.status} onClick={save} data-testid="button-save-action-status">{update.isPending?'Saving…':'Save status'}</button></div></div>
  </section></div>;
}
function Actions() {
  const d=useWorkspace();const qc=useQueryClient();const update=useUpdateComplianceAction();const [,setLocation]=useLocation();const [modal,setModal]=useState(false);const [status,setStatus]=useState('All statuses');const [err,setErr]=useState('');
  const [viewing,setViewing]=useState<ComplianceAction|null>(()=>{const actionId=new URLSearchParams(window.location.search).get('view');return d.actions.find(action=>action.id===actionId)||null;});
  const closeDetail=()=>{setViewing(null);if(new URLSearchParams(window.location.search).has('view'))setLocation('/app/actions');};
  const rows=d.actions.filter(a=>status==='All statuses'||a.status===status);
  const changeStatus=(a:ComplianceAction,value:ActionStatus)=>{setErr('');update.mutate({id:a.id,data:{status:value}},{onSuccess:()=>qc.invalidateQueries({queryKey:getGetRegulaMapOverviewQueryKey()}),onError:()=>setErr('Could not update action status. Retry the change.')});};
  return <main className="content"><Head eyebrow="COMPLIANCE WORKFLOW" title="Actions" subtitle="Assign, prioritize, and track the work that closes your compliance gaps." action={<button className="btn primary" onClick={()=>setModal(true)} data-testid="button-create-action"><Plus/> New action</button>}/>
    <div className="toolbar"><select className="select" value={status} onChange={e=>setStatus(e.target.value)}><option>All statuses</option>{['OPEN','IN_PROGRESS','BLOCKED','COMPLETED'].map(v=><option key={v}>{v}</option>)}</select><span className="secondary-line">{rows.length} actions</span></div>
    {err&&<div className="toast-inline" role="alert">{err}</div>}
    <Panel title="Action register" subtitle="Changes are saved to the demonstration workspace">
       {rows.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>Action</th><th>Regulation / facility</th><th>Owner</th><th>Priority</th><th>Due date</th><th>Status</th></tr></thead><tbody>{rows.map(a=>{const reg=getReg(d,a.regulationId),fac=getFacility(d,a.facilityId);return <tr key={a.id}><td><button type="button" className="link-title action-title" onClick={()=>setViewing(a)} aria-label={`View action: ${a.title}`}>{a.title}</button><span className="secondary-line">{a.description}</span></td><td>{reg?.shortTitle||reg?.title||a.regulationId}<span className="secondary-line">{fac?.name||'Organization-wide'}</span></td><td>{a.assignedTo}</td><td><Severity level={a.priority}/></td><td>{date(a.dueDate)}</td><td><select aria-label={`Update status for ${a.title}`} className="select" value={a.status} disabled={update.isPending} onChange={e=>changeStatus(a,e.target.value as ActionStatus)}>{['OPEN','IN_PROGRESS','BLOCKED','COMPLETED'].map(v=><option key={v}>{v}</option>)}</select></td></tr>})}</tbody></table></div>:<Empty title="No actions in this view" detail="Create a compliance action to give the next step an owner and due date."/>}
    </Panel>
    {modal&&<ActionCreateModal onClose={()=>setModal(false)}/>}
    {viewing&&<ActionDetailModal action={viewing} onClose={closeDetail}/>}
  </main>;
}

function Deadlines() {
  const d=useWorkspace();const [range,setRange]=useState('All dates');
  const today=new Date();const todayNumber=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())/86400000;
  const daysUntil=(value:string)=>{const [year,month,day]=value.split('-').map(Number);return Date.UTC(year!,month!-1,day!)/86400000-todayNumber;};
  const sorted=[...d.deadlines].sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).filter(x=>range==='All dates'||(daysUntil(x.dueDate)>=0&&daysUntil(x.dueDate)<=(range==='Next 30 days'?30:90)));
  return <main className="content"><Head eyebrow="TIME-BOUND OBLIGATIONS" title="Deadlines" subtitle="Upcoming regulatory due dates connected to action and source records."/>
    <div className="toolbar"><select className="select" value={range} onChange={e=>setRange(e.target.value)}>{['All dates','Next 30 days','Next 90 days'].map(x=><option key={x}>{x}</option>)}</select><span className="secondary-line">{sorted.length} dates</span></div>
    <Panel title="Deadline register" subtitle="Ordered by due date">
      {sorted.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>Deadline</th><th>Due date</th><th>Regulation</th><th>Related action</th><th>Risk</th><th>Open</th></tr></thead><tbody>{sorted.map(dl=>{const days=daysUntil(dl.dueDate);const urgency=days<0?'OVERDUE':days<=14?'DUE SOON':'UPCOMING';return <tr key={dl.id}><td className="link-title">{dl.title}</td><td><div>{date(dl.dueDate)}</div><span className={`deadline-urgency ${urgency.toLowerCase().replace(' ','-')}`}>{urgency}{days>=0?` · ${days} days`:''}</span></td><td><Link href={`/app/regulations/${dl.regulationId}`} className="link-title">{dl.regulationTitle}</Link></td><td>{dl.actionTitle||'—'}</td><td><Severity level={dl.riskLevel}/></td><td>{dl.actionId?<Link href={`/app/actions?view=${dl.actionId}`} className="btn">View action <ArrowRight/></Link>:<Link href={`/app/regulations/${dl.regulationId}`} className="btn">View regulation <ArrowRight/></Link>}</td></tr>})}</tbody></table></div>:<Empty title="No deadlines in this range" detail="Change the date filter or check again when workspace data is available."/>}
    </Panel>
  </main>;
}

type ChatLine={role:'assistant'|'user';text:string;sources?:string[];insufficient?:boolean};
function Assistant() {
  const ask=useQueryComplianceAssistant();const [question,setQuestion]=useState('');const [lines,setLines]=useState<ChatLine[]>([{role:'assistant',text:'Ask about regulations, changes, facilities, actions, or deadlines in this workspace. I will answer only from the available demonstration data.'}]);const [error,setError]=useState('');
  const submit=(e:FormEvent)=>{e.preventDefault();const q=question.trim();if(q.length<3)return;setLines(v=>[...v,{role:'user',text:q}]);setQuestion('');setError('');ask.mutate({data:{question:q}},{onSuccess:res=>setLines(v=>[...v,{role:'assistant',text:res.answer,sources:res.sources,insufficient:res.insufficientEvidence}]),onError:()=>setError('The workspace assistant is unavailable right now. Try again.')});};
  return <main className="content"><Head eyebrow="EVIDENCE-BOUND ASSISTANCE" title="Workspace assistant" subtitle="Ask a question about the records in your demonstration workspace."/>
    <div className="assistant-layout"><section className="panel"><div className="panel-head"><div><div className="panel-title">Ask RegulaMap</div><div className="panel-subtitle">Answers are limited to workspace data</div></div><span className="badge informational"><Sparkles size={11}/> WORKSPACE ONLY</span></div>
      <div className="assistant-feed">{lines.map((l,i)=><div className={`chat-msg ${l.role==='user'?'user':''}`} key={`${i}-${l.role}`}><div>{l.text}</div>{l.insufficient&&<div className="source-list">Insufficient evidence in this workspace. Confirm with an authoritative source.</div>}{l.sources&&l.sources.length>0&&<div className="source-list">SOURCES · {l.sources.join(' · ')}</div>}</div>)}{ask.isPending&&<div className="chat-msg"><div className="skeleton" style={{height:38,width:210}}/></div>}</div>
      {error&&<div className="toast-inline" role="alert" style={{padding:'0 14px 8px'}}>{error}</div>}
      <form className="chat-input" onSubmit={submit}><input className="field" minLength={3} maxLength={500} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask about an obligation, facility, or deadline…" aria-label="Ask the workspace assistant" data-testid="input-assistant-question"/><button className="btn primary" disabled={ask.isPending||question.trim().length<3}>{ask.isPending?'Thinking…':'Ask'} <ArrowRight/></button></form>
    </section>
     <Panel title="Try a question" subtitle="Examples grounded in workspace data"><div className="panel-body mini-list">{['Which regulations are high risk?','Which facility has the highest risk?','Show me recent emission changes'].map(q=><button className="mini-row" style={{width:'100%',textAlign:'left',background:'transparent',border:0,color:'inherit'}} key={q} onClick={()=>setQuestion(q)}><span className="main">{q}</span><ArrowRight size={13}/></button>)}</div></Panel></div>
    <p className="secondary-line" style={{marginTop:14}}>Assistant responses are informational demonstration output, not authoritative legal advice.</p>
  </main>;
}

function Reports() {
  const d=useWorkspace();const critical=d.risks.filter(r=>r.level==='CRITICAL'||r.level==='HIGH').length;
  return <main className="content"><Head eyebrow="WORKSPACE SUMMARY" title="Reports" subtitle="A printable snapshot of regulatory exposure, facilities, and action status." action={<button className="btn primary" onClick={()=>window.print()}><Printer/> Print report</button>}/>
    <div className="print-only"><div className="eyebrow">REGULAMAP · DEMONSTRATION REPORT</div><h1>{d.organization} compliance overview</h1><p>Generated {new Date().toLocaleDateString()} · Illustrative data only; not authoritative legal advice.</p></div>
    <div className="metric-grid"><Metric icon={<BookOpen/>} label="Regulations" value={d.regulations.length} note="Tracked in workspace"/><Metric icon={<Zap/>} label="Regulatory changes" value={d.changes.length} note="Available change records"/><Metric icon={<ShieldAlert/>} label="High / critical risks" value={critical} note="Review recommended"/><Metric icon={<ClipboardCheck/>} label="Open actions" value={d.actions.filter(a=>a.status!=='COMPLETED').length} note="Not yet completed"/></div>
    <div className="two-col"><Panel title="Risk profile" subtitle="Assessment levels"><div className="panel-body mini-list">{['CRITICAL','HIGH','MEDIUM','LOW','INFORMATIONAL'].map(level=><div className="mini-row" key={level}><div className="main">{level}</div><div className="deadline-date">{d.risks.filter(r=>r.level===level).length}</div></div>)}</div></Panel>
      <Panel title="Action status" subtitle="Current execution"><div className="panel-body mini-list">{['OPEN','IN_PROGRESS','BLOCKED','COMPLETED'].map(status=><div className="mini-row" key={status}><StatusBadge status={status}/><span className="deadline-date">{d.actions.filter(a=>a.status===status).length} actions</span></div>)}</div></Panel></div>
    <Panel title="Facility exposure overview" subtitle="Operational footprint and assigned risk"><div className="table-wrap"><table className="data-table"><thead><tr><th>Facility</th><th>Location</th><th>Risk score</th><th>Emissions</th><th>Water usage</th><th>Energy</th></tr></thead><tbody>{d.facilities.map(f=><tr key={f.id}><td className="link-title">{f.name}</td><td>{f.city}, {f.country}</td><td><RiskMeter score={f.riskScore}/></td><td>{f.emissions.toLocaleString()} tCO₂e</td><td>{f.waterUsage.toLocaleString()} m³</td><td>{f.energy.toLocaleString()} MWh</td></tr>)}</tbody></table></div></Panel>
    <p className="secondary-line" style={{marginTop:13}}>Report content is based on demonstration workspace data and is not authoritative legal advice.</p>
  </main>;
}
function SettingsPage() {
  const d=useWorkspace();const [email,setEmail]=useState(true);const [weekly,setWeekly]=useState(false);const [saved,setSaved]=useState(false);
  const flip=(setter:(value:boolean)=>void,value:boolean)=>{setter(!value);setSaved(false);};
  return <main className="content"><Head eyebrow="WORKSPACE CONFIGURATION" title="Settings" subtitle="Demo organization details and local preference controls."/>
    <div className="detail-grid"><div><Panel title="Organization" subtitle="Demonstration workspace profile"><div className="panel-body"><div className="info-grid"><Info label="Organization" value={d.organization}/><Info label="Workspace mode" value="Demonstration"/><Info label="Tracked regulations" value={d.regulations.length}/><Info label="Connected facilities" value={d.facilities.length}/></div></div></Panel>
      <Panel title="User profile" subtitle="Current demo user"><div className="panel-body"><div className="info-grid"><Info label="Name" value="Elena Marlow"/><Info label="Role" value="Compliance lead"/><Info label="Access" value="Unprotected demo entry"/><Info label="Organization" value={d.organization}/></div></div></Panel></div>
      <Panel title="Notification preferences" subtitle="Preferences apply in this browser session"><div className="panel-body">
        <Setting label="Email change summaries" desc="Receive a digest when workspace regulatory changes are added." checked={email} toggle={()=>flip(setEmail,email)}/>
        <Setting label="Weekly deadline review" desc="Show a weekly summary of approaching dates." checked={weekly} toggle={()=>flip(setWeekly,weekly)}/>
        <button className="btn primary" style={{marginTop:15}} onClick={()=>setSaved(true)}>{saved?<><Check/> Preferences saved</>:<>Save preferences <ArrowRight/></>}</button>
      </div></Panel></div>
    <p className="secondary-line" style={{marginTop:14}}>This is a demo workspace. These local preferences do not configure secure account or notification services.</p>
  </main>;
}
function Setting({label,desc,checked,toggle}:{label:string;desc:string;checked:boolean;toggle:()=>void}) {return <div className="settings-row"><div><strong>{label}</strong><p>{desc}</p></div><button className={`switch ${checked?'on':''}`} role="switch" aria-checked={checked} aria-label={label} onClick={toggle}/></div>}

function NotFound() {
  return <main className="content"><div className="error-state"><div className="empty-mark"><CircleHelp/></div><h2>That route is not part of this workspace</h2><p>Choose a working area to continue.</p><Link href="/app/dashboard" className="btn primary">Go to overview <ArrowRight/></Link></div></main>;
}
function RoutedErrorBoundary({children}:{children:ReactNode}) {const [location]=useLocation();return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>}
function WorkspacePage({children}:{children:ReactNode}){return <Workspace>{children}</Workspace>}
function Router() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/" component={Landing}/>
    <Route path="/login" component={Login}/>
    <Route path="/app"><WorkspacePage><Dashboard/></WorkspacePage></Route>
    <Route path="/app/dashboard"><WorkspacePage><Dashboard/></WorkspacePage></Route>
    <Route path="/app/map"><WorkspacePage><MapPage/></WorkspacePage></Route>
    <Route path="/app/regulations"><WorkspacePage><RegulationDirectory/></WorkspacePage></Route>
    <Route path="/app/regulations/:id"><WorkspacePage><RegulationDetail/></WorkspacePage></Route>
    <Route path="/app/changes"><WorkspacePage><ChangeFeed/></WorkspacePage></Route>
    <Route path="/app/changes/:id"><WorkspacePage><ChangeDetail/></WorkspacePage></Route>
    <Route path="/app/facilities"><WorkspacePage><Facilities/></WorkspacePage></Route>
    <Route path="/app/facilities/:id"><WorkspacePage><FacilityDetail/></WorkspacePage></Route>
    <Route path="/app/risks"><WorkspacePage><Risks/></WorkspacePage></Route>
    <Route path="/app/actions"><WorkspacePage><Actions/></WorkspacePage></Route>
    <Route path="/app/deadlines"><WorkspacePage><Deadlines/></WorkspacePage></Route>
    <Route path="/app/assistant"><WorkspacePage><Assistant/></WorkspacePage></Route>
    <Route path="/app/reports"><WorkspacePage><Reports/></WorkspacePage></Route>
    <Route path="/app/settings"><WorkspacePage><SettingsPage/></WorkspacePage></Route>
    <Route component={NotFound}/>
  </Switch></RoutedErrorBoundary>;
}
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}
export default App;
