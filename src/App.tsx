import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LogOut, LayoutDashboard, FileText, ClipboardList, User as UserIcon, Menu, X, Users, BookOpen } from 'lucide-react';
import { cn } from './lib/utils';
import { motion } from 'motion/react';
import TeacherDashboard from './components/TeacherDashboard';
import PrincipalDashboard from './components/PrincipalDashboard';
import DailyReportForm from './components/DailyReportForm';
import ObservationForm from './components/ObservationForm';
import TopicTracker from './components/TopicTracker';

function Navbar() {
  const { profile, logout, toggleRole } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!profile) return null;

  const navItems = profile.role === 'teacher' ? [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Daily Report', path: '/report', icon: FileText },
    { name: 'Topic Tracker', path: '/topics', icon: BookOpen },
    { name: 'Observations', path: '/observe', icon: ClipboardList },
  ] : [
    { name: 'Executive Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Topic Progress', path: '/topics', icon: BookOpen },
    { name: 'Lesson Observations', path: '/observations', icon: ClipboardList },
    { name: 'Peer Review (A/B)', path: '/peer-review', icon: Users },
    { name: 'Notebook Logs', path: '/notebooks', icon: FileText },
  ];

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-[200px] bg-slate-800 text-slate-100 flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-5 font-extrabold text-lg tracking-tighter text-sky-400">
          EDUTRAK 2.0
        </div>
        <nav className="flex-grow mt-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="flex items-center px-5 py-3 text-[13px] opacity-70 hover:opacity-100 hover:bg-slate-700 transition-all border-l-4 border-transparent hover:border-sky-400"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-5 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold">
              {profile.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{profile.name}</p>
              <p className="text-[10px] opacity-50 uppercase">{profile.role}</p>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => toggleRole()}
              className="w-full flex items-center gap-2 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-wider"
            >
              <UserIcon className="w-3 h-3" />
              Switch to {profile.role === 'principal' ? 'Teacher' : 'Principal'}
            </button>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="h-[60px] bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-[200px] z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-slate-500">
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold text-slate-900 hidden sm:block">
            {profile.role === 'principal' ? `Principal: ${profile.name}` : `Teacher: ${profile.name}`}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded text-[12px] text-slate-500 hover:bg-slate-50">Date: Today</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded text-[12px] text-slate-500 hover:bg-slate-50">Week 4</button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] lg:hidden" onClick={() => setIsOpen(false)}>
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            className="w-[200px] h-full bg-slate-800 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 font-extrabold text-lg tracking-tighter text-sky-400">
              EDUTRAK 2.0
            </div>
            <nav className="mt-4 flex-grow">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-5 py-3 text-[13px] text-slate-100 opacity-70 hover:opacity-100 hover:bg-slate-700"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-5 border-t border-slate-700">
              <div className="flex items-center gap-3 mb-4 text-slate-100">
                <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold">
                  {profile.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{profile.name}</p>
                  <p className="text-[10px] opacity-50 uppercase">{profile.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    toggleRole();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-wider"
                >
                  <UserIcon className="w-3 h-3" />
                  Switch to {profile.role === 'principal' ? 'Teacher' : 'Principal'}
                </button>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function Login() {
  const { user, login } = useAuth();
  if (user) return <Navigate to="/" />;
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-100">
            <FileText className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">EduTrak 2.0</h1>
          <p className="mt-2 text-slate-500 font-medium">Executive School Monitoring System</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <button
            onClick={login}
            className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all active:scale-95"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <PrivateRoute>
                <div className="flex w-full">
                  <Navbar />
                  <div className="flex-grow lg:pl-[200px] pt-[60px]">
                    <main className="h-full">
                      <Routes>
                        <Route path="/" element={<DashboardRouter />} />
                        <Route path="/report" element={<DailyReportForm />} />
                        <Route path="/topics" element={<TopicTracker />} />
                        <Route path="/observe" element={<ObservationForm />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function DashboardRouter() {
  const { profile } = useAuth();
  if (!profile) return null;
  return profile.role === 'principal' ? <PrincipalDashboard /> : <TeacherDashboard />;
}
