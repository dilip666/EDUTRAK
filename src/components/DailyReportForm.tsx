import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { DailyReport } from '../types';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function DailyReportForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<DailyReport>>({
    date: new Date().toISOString().split('T')[0],
    week: 1,
    className: '',
    syllabusStatus: '',
    dailyPlanReview: '',
    notebookCorrection: false,
    proxyPeriods: 0,
    cwCompletion: 0,
    hwCompletion: 0,
    classTask: '',
    followUp: '',
    remedialPlan: '',
    remedialReview: '',
    studentAnecdote: '',
    disciplineIssues: '',
    assemblyRecord: '',
    principalSupport: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setError(null);

    try {
      const report: DailyReport = {
        ...formData as DailyReport,
        teacherId: profile.uid,
        teacherName: profile.name,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'reports'), report);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reports');
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-600 mb-6">Your daily academic report has been successfully recorded.</p>
          <div className="text-sm text-gray-400">Redirecting to dashboard...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Daily Academic Report</h1>
            <p className="text-xs text-slate-500">Submit your daily progress and observations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="hd-card">
              <div className="hd-card-title">Basic Info</div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Week</label>
                  <input
                    type="number"
                    name="week"
                    required
                    min="1"
                    max="52"
                    value={formData.week}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Class</label>
                  <input
                    type="text"
                    name="className"
                    required
                    placeholder="e.g. X-A"
                    value={formData.className}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="hd-card md:col-span-2">
              <div className="hd-card-title">Academic Progress</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Syllabus Status</label>
                  <textarea
                    name="syllabusStatus"
                    rows={2}
                    placeholder="Topics covered today..."
                    value={formData.syllabusStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Daily Plan Review</label>
                  <textarea
                    name="dailyPlanReview"
                    rows={2}
                    placeholder="Plan vs actual..."
                    value={formData.dailyPlanReview}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="hd-card">
              <div className="hd-card-title">Completion Tracking</div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">CW Completion %</label>
                    <input
                      type="number"
                      name="cwCompletion"
                      min="0"
                      max="100"
                      value={formData.cwCompletion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">HW Completion %</label>
                    <input
                      type="number"
                      name="hwCompletion"
                      min="0"
                      max="100"
                      value={formData.hwCompletion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="notebookCorrection"
                      checked={formData.notebookCorrection}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Notebook Correction Done</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="hd-card">
              <div className="hd-card-title">Admin & Discipline</div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Proxy Periods</label>
                  <input
                    type="number"
                    name="proxyPeriods"
                    min="0"
                    value={formData.proxyPeriods}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Discipline Issues</label>
                  <input
                    type="text"
                    name="disciplineIssues"
                    placeholder="Any incidents..."
                    value={formData.disciplineIssues}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hd-card">
            <div className="hd-card-title">Remedial & Follow-up</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Remedial Plan</label>
                <textarea
                  name="remedialPlan"
                  rows={2}
                  placeholder="Plan for struggling students..."
                  value={formData.remedialPlan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Student Anecdotes</label>
                <textarea
                  name="studentAnecdote"
                  rows={2}
                  placeholder="Notable student behavior..."
                  value={formData.studentAnecdote}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-slate-200 text-slate-600 rounded text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
