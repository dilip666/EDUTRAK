import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { DailyReport, Observation } from '../types';
import { Plus, FileText, ClipboardList, ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const reportsQuery = query(
      collection(db, 'reports'),
      where('teacherId', '==', profile.uid),
      orderBy('date', 'desc'),
      limit(5)
    );

    const obsQuery = query(
      collection(db, 'observations'),
      where('targetTeacherId', '==', profile.uid),
      orderBy('date', 'desc'),
      limit(5)
    );

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyReport)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reports'));

    const unsubObs = onSnapshot(obsQuery, (snapshot) => {
      setObservations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Observation)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'observations'));

    return () => {
      unsubReports();
      unsubObs();
    };
  }, [profile]);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Teacher Dashboard</h1>
          <p className="text-xs text-slate-500">Welcome back, {profile?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/report"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Daily Report
          </Link>
          <Link
            to="/observe"
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            New Observation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="hd-card">
            <div className="hd-card-title">Recent Daily Reports</div>
            <div className="overflow-x-auto">
              <table className="hd-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Class</th>
                    <th>CW/HW</th>
                    <th>Correction</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="font-bold">{report.date}</td>
                      <td>{report.className}</td>
                      <td>{report.cwCompletion}% / {report.hwCompletion}%</td>
                      <td>{report.notebookCorrection ? 'Yes' : 'No'}</td>
                      <td>
                        <span className={cn(
                          "hd-pill",
                          report.cwCompletion > 80 ? "hd-pill-good" : "hd-pill-fair"
                        )}>
                          {report.cwCompletion > 80 ? 'SUBMITTED' : 'PARTIAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">No reports submitted yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Observations About You */}
        <div className="space-y-4">
          <div className="hd-card">
            <div className="hd-card-title">Observations Received</div>
            <div className="space-y-3">
              {observations.map((obs) => (
                <div key={obs.id} className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{obs.type}</span>
                    <span className={cn(
                      "hd-pill",
                      obs.data.rating === 4 ? "hd-pill-outstanding" :
                      obs.data.rating === 3 ? "hd-pill-good" : "hd-pill-fair"
                    )}>
                      {obs.data.rating ? `Rating: ${obs.data.rating}` : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{obs.data.topic || obs.data.skill || 'General Observation'}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Observer: {obs.observerName}</p>
                </div>
              ))}
              {observations.length === 0 && (
                <div className="py-8 text-center text-slate-400 italic text-xs">No observations received yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
