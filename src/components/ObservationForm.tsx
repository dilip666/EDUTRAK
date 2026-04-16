import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Observation, ObservationType, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, CheckCircle2, AlertCircle, User, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

export default function ObservationForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);

  const [type, setType] = useState<ObservationType>('lesson');
  const [targetTeacherId, setTargetTeacherId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [obsData, setObsData] = useState<any>({});

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
        const snapshot = await getDocs(q);
        setTeachers(snapshot.docs.map(doc => doc.data() as UserProfile));
      } catch (err) {
        console.error('Error fetching teachers:', err);
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !targetTeacherId) return;
    setLoading(true);
    setError(null);

    try {
      const targetTeacher = teachers.find(t => t.uid === targetTeacherId);
      const observation: Observation = {
        type,
        observerId: profile.uid,
        observerName: profile.name,
        targetTeacherId,
        targetTeacherName: targetTeacher?.name || 'Unknown',
        date,
        data: obsData,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'observations'), observation);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'observations');
      setError('Failed to submit observation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateData = (field: string, value: any) => {
    setObsData((prev: any) => ({ ...prev, [field]: value }));
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Observation Recorded!</h2>
          <p className="text-gray-600 mb-6">The observation has been successfully submitted.</p>
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
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Observation Form</h1>
            <p className="text-xs text-slate-500">Record lesson, peer, or micro teaching observations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="hd-card">
              <div className="hd-card-title">Observation Details</div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Observation Type</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as ObservationType);
                      setObsData({});
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="lesson">Lesson Observation</option>
                    <option value="peer">Peer Observation</option>
                    <option value="micro">Micro Teaching</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Target Teacher</label>
                  <select
                    required
                    value={targetTeacherId}
                    onChange={(e) => setTargetTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t.uid} value={t.uid}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="hd-card">
              <div className="hd-card-title">Specific Metrics</div>
              <div className="space-y-3">
                {type === 'lesson' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject</label>
                      <input
                        type="text"
                        onChange={(e) => updateData('subject', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Topic</label>
                      <input
                        type="text"
                        onChange={(e) => updateData('topic', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}
                {type === 'micro' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Skill Focused</label>
                    <input
                      type="text"
                      placeholder="e.g. Questioning Skill"
                      onChange={(e) => updateData('skill', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Rating Scale</label>
                  <div className="flex gap-2">
                    {[
                      { val: 1, label: 'NSI-1' },
                      { val: 2, label: 'Fair-2' },
                      { val: 3, label: 'Good-3' },
                      { val: 4, label: 'Outstanding-4' }
                    ].map(r => (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => updateData('rating', r.val)}
                        className={cn(
                          "flex-1 py-2 rounded text-[10px] font-bold border transition-all",
                          obsData.rating === r.val 
                            ? "bg-blue-600 border-blue-600 text-white" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hd-card">
            <div className="hd-card-title">{type === 'micro' ? 'Micro Teaching Notes' : 'Observation Feedback'}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type === 'micro' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Before Notes</label>
                    <textarea
                      rows={3}
                      onChange={(e) => updateData('beforeNotes', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">During Notes</label>
                    <textarea
                      rows={3}
                      onChange={(e) => updateData('duringNotes', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                </>
              ) : (
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Detailed Feedback</label>
                  <textarea
                    rows={4}
                    placeholder="Enter your observations here..."
                    onChange={(e) => updateData('feedback', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              )}
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
              disabled={loading || !targetTeacherId}
              className="px-8 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Submit Observation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
