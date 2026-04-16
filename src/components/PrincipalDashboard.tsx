import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { DailyReport, Observation, UserProfile } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, Filter, Calendar, Users, BookOpen, CheckCircle, AlertTriangle, 
  ChevronDown, Search, Download, TrendingUp, Clock, MessageSquare, FileText, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import PrincipalAI from './PrincipalAI';

export default function PrincipalDashboard() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState<number | ''>('');
  const [classFilter, setClassFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');

  useEffect(() => {
    const unsubReports = onSnapshot(query(collection(db, 'reports'), orderBy('date', 'desc')), (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyReport)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reports'));

    const unsubObs = onSnapshot(query(collection(db, 'observations'), orderBy('date', 'desc')), (snapshot) => {
      setObservations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Observation)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'observations'));

    const unsubUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      setTeachers(snapshot.docs.map(doc => doc.data() as UserProfile).filter(u => u.role === 'teacher'));
    });

    return () => {
      unsubReports();
      unsubObs();
      unsubUsers();
    };
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (dateFilter && r.date !== dateFilter) return false;
      if (weekFilter && r.week !== weekFilter) return false;
      if (classFilter && !r.className.toLowerCase().includes(classFilter.toLowerCase())) return false;
      if (teacherFilter && r.teacherId !== teacherFilter) return false;
      return true;
    });
  }, [reports, dateFilter, weekFilter, classFilter, teacherFilter]);

  const stats = useMemo(() => {
    if (filteredReports.length === 0) return null;
    const avgCW = filteredReports.reduce((acc, r) => acc + (r.cwCompletion || 0), 0) / filteredReports.length;
    const avgHW = filteredReports.reduce((acc, r) => acc + (r.hwCompletion || 0), 0) / filteredReports.length;
    const totalProxy = filteredReports.reduce((acc, r) => acc + (r.proxyPeriods || 0), 0);
    const notebookCorrections = filteredReports.filter(r => r.notebookCorrection).length;
    
    return { avgCW, avgHW, totalProxy, notebookCorrections };
  }, [filteredReports]);

  const chartData = useMemo(() => {
    // Group by date for trend
    const groups = filteredReports.reduce((acc: any, r) => {
      if (!acc[r.date]) acc[r.date] = { date: r.date, cw: 0, hw: 0, count: 0 };
      acc[r.date].cw += r.cwCompletion || 0;
      acc[r.date].hw += r.hwCompletion || 0;
      acc[r.date].count += 1;
      return acc;
    }, {});

    return Object.values(groups).map((g: any) => ({
      date: g.date,
      CW: Math.round(g.cw / g.count),
      HW: Math.round(g.hw / g.count)
    })).reverse();
  }, [filteredReports]);

  if (loading) return <div className="p-8 text-center">Loading principal dashboard...</div>;

  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Syllabus Pace', value: `${Math.round(stats?.avgCW || 0)}%`, sub: `+${Math.round((stats?.avgCW || 0) * 0.02)}% vs Daily Plan`, icon: CheckCircle, color: 'text-blue-600', progress: stats?.avgCW },
          { label: 'Proxy Periods', value: stats?.totalProxy || 0, sub: 'Managed by Depts', icon: Clock, color: 'text-amber-600' },
          { label: 'Notebook Logs', value: stats?.notebookCorrections || 0, sub: 'Corrections verified today', icon: FileText, color: 'text-slate-600' },
          { label: 'Remedial Plan', value: filteredReports.filter(r => r.remedialPlan).length, sub: 'Students tracked', icon: AlertTriangle, color: 'text-red-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="hd-card"
          >
            <div className="hd-card-title">{stat.label}</div>
            <div className="hd-stat-value">{stat.value}</div>
            <div className={cn("hd-stat-sub", stat.color)}>{stat.sub}</div>
            {stat.progress !== undefined && (
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stat.progress}%` }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Observation Summary */}
        <div className="lg:col-span-2 hd-card">
          <div className="hd-card-title">
            Daily Observation Summary (LO / PO / MT)
            <span className="text-blue-600 cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-1">
            {observations.slice(0, 4).map((obs) => (
              <div key={obs.id} className="grid grid-cols-[120px_1fr_80px] items-center py-2 border-b border-slate-50 last:border-0 text-xs">
                <span className="font-bold text-slate-900 truncate">{obs.targetTeacherName}</span>
                <span className="text-slate-500 truncate px-2 capitalize">{obs.type} Observation: {obs.data.topic || obs.data.skill || 'General'}</span>
                <div className="flex justify-end">
                  <span className={cn(
                    "hd-pill",
                    obs.data.rating === 4 ? "hd-pill-outstanding" :
                    obs.data.rating === 3 ? "hd-pill-good" :
                    obs.data.rating === 2 ? "hd-pill-fair" : "hd-pill-nsi"
                  )}>
                    {obs.data.rating ? `OUT-${obs.data.rating}` : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
            {observations.length === 0 && <div className="py-4 text-center text-slate-400 italic text-xs">No recent observations.</div>}
          </div>
        </div>

        {/* Follow-up / Remedial */}
        <div className="hd-card">
          <div className="hd-card-title">Follow-up Required</div>
          <div className="space-y-3 text-xs">
            {filteredReports.filter(r => r.remedialPlan || r.disciplineIssues).slice(0, 3).map((r, i) => (
              <div key={i} className={cn(
                "pl-2 border-l-4",
                r.disciplineIssues ? "border-red-500" : "border-amber-500"
              )}>
                <p className="font-bold text-slate-900">{r.disciplineIssues ? 'Discipline:' : 'Remedial:'} {r.className}</p>
                <p className="text-slate-500 line-clamp-2">{r.disciplineIssues || r.remedialPlan}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Teacher: {r.teacherName}</p>
              </div>
            ))}
            {filteredReports.filter(r => r.remedialPlan || r.disciplineIssues).length === 0 && (
              <div className="py-4 text-center text-slate-400 italic">No urgent follow-ups.</div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="hd-card overflow-hidden">
        <div className="hd-card-title">Daily Academic Completion Summary</div>
        <div className="overflow-x-auto">
          <table className="hd-table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Class</th>
                <th>Task Done</th>
                <th>CW/HW</th>
                <th>Correction</th>
                <th>Discipline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td className="font-bold">{report.teacherName}</td>
                  <td>{report.className}</td>
                  <td className="max-w-[150px] truncate">{report.classTask || '-'}</td>
                  <td>
                    <div className="flex gap-1">
                      <span className="text-emerald-600 font-bold">{report.cwCompletion}%</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-blue-600 font-bold">{report.hwCompletion}%</span>
                    </div>
                  </td>
                  <td>{report.notebookCorrection ? <span className="text-emerald-600 font-bold">Yes</span> : <span className="text-slate-400">No</span>}</td>
                  <td className="max-w-[100px] truncate">{report.disciplineIssues || '-'}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        report.cwCompletion > 80 ? "bg-emerald-500" : report.cwCompletion > 50 ? "bg-amber-500" : "bg-red-500"
                      )} />
                      <span className="font-bold text-[10px] uppercase">
                        {report.cwCompletion > 80 ? 'Done' : report.cwCompletion > 50 ? 'Partial' : 'Pending'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PrincipalAI reports={filteredReports} />
    </div>
  );
}
