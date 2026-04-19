import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { TopicPlan } from '../types';
import { Plus, Save, CheckCircle2, AlertCircle, Clock, Calendar, BookOpen, User as UserIcon, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TopicTracker() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<TopicPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<TopicPlan>>({
    className: '',
    subject: '',
    topicName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    plannedPeriods: 1,
    completedPeriods: 0
  });

  useEffect(() => {
    if (!profile) return;

    const q = profile.role === 'teacher' 
      ? query(collection(db, 'topicPlans'), where('teacherId', '==', profile.uid), orderBy('createdAt', 'desc'))
      : query(collection(db, 'topicPlans'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TopicPlan));
      setPlans(data);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'topicPlans');
    });

    return unsubscribe;
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const newPlan: TopicPlan = {
        ...formData as TopicPlan,
        teacherId: profile.uid,
        teacherName: profile.name,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'topicPlans'), newPlan);
      setShowAddForm(false);
      setFormData({
        className: '',
        subject: '',
        topicName: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        plannedPeriods: 1,
        completedPeriods: 0
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'topicPlans');
    }
  };

  const updateProgress = async (id: string, current: number, delta: number) => {
    try {
      const newCount = Math.max(0, current + delta);
      await updateDoc(doc(db, 'topicPlans', id), { completedPeriods: newCount });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'topicPlans');
    }
  };

  const getStatus = (plan: TopicPlan) => {
    const today = new Date().toISOString().split('T')[0];
    if (plan.completedPeriods >= plan.plannedPeriods) return 'Completed';
    if (plan.endDate && today > plan.endDate) return 'Delayed';
    return 'Ongoing';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Delayed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading tracking data...</div>;

  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Topic & Period Tracking</h1>
              <p className="text-xs text-slate-500">Monitor syllabus progress across classes</p>
            </div>
          </div>
          {profile?.role === 'teacher' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Topic Plan
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="hd-card mb-6 animate-in fade-in slide-in-from-top-4">
            <div className="hd-card-title">Create New Topic Plan</div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Class</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10-A"
                  value={formData.className}
                  onChange={e => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trigonometry"
                  value={formData.topicName}
                  onChange={e => setFormData({ ...formData, topicName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Planned Periods</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.plannedPeriods}
                  onChange={e => setFormData({ ...formData, plannedPeriods: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="hd-card overflow-hidden">
          <div className="hd-card-title">Syllabus Progress Overview</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {profile?.role === 'principal' && <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Teacher</th>}
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Class & Subject</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Topic</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Timeline</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Periods</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                  {profile?.role === 'teacher' && <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((plan) => {
                  const status = getStatus(plan);
                  const progress = Math.min(100, (plan.completedPeriods / plan.plannedPeriods) * 100);
                  
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                      {profile?.role === 'principal' && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                              {plan.teacherName.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-slate-700">{plan.teacherName}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-slate-900">{plan.className}</div>
                        <div className="text-[10px] text-slate-500">{plan.subject}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-slate-700">{plan.topicName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {plan.startDate} to {plan.endDate}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 w-32">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>{plan.completedPeriods} / {plan.plannedPeriods}</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all duration-500",
                                status === 'Completed' ? 'bg-emerald-500' : status === 'Delayed' ? 'bg-red-500' : 'bg-blue-500'
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border", getStatusColor(status))}>
                          {status}
                        </span>
                      </td>
                      {profile?.role === 'teacher' && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => updateProgress(plan.id!, plan.completedPeriods, 1)}
                              className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                              title="Add Period"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateProgress(plan.id!, plan.completedPeriods, -1)}
                              className="p-1 hover:bg-slate-100 text-slate-400 rounded transition-colors"
                              title="Remove Period"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {plans.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">
                      No topic plans found. {profile?.role === 'teacher' ? 'Start by adding a new plan!' : ''}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
