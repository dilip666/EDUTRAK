import React, { useState } from 'react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { DailyReport } from '../types';
import { Sparkles, Loader2, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface PrincipalAIProps {
  reports: DailyReport[];
}

export default function PrincipalAI({ reports }: PrincipalAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeReports = async () => {
    if (reports.length === 0) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const reportSummary = reports.map(r => `
        Date: ${r.date}, Teacher: ${r.teacherName}, Class: ${r.className}
        Syllabus: ${r.syllabusStatus}
        CW/HW: ${r.cwCompletion}% / ${r.hwCompletion}%
        Remedial: ${r.remedialPlan}
        Issues: ${r.disciplineIssues}
        Support: ${r.principalSupport}
      `).join('\n---\n');

      const prompt = `
        You are an expert school principal's assistant. Analyze the following daily academic reports from teachers and provide a concise, high-level summary.
        Highlight:
        1. Overall academic progress and syllabus completion.
        2. Any recurring discipline or student issues.
        3. Specific teachers or classes that need immediate attention or support.
        4. Trends in classwork/homework completion.
        5. Actionable recommendations for the principal.

        Reports:
        ${reportSummary}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      setAnalysis(response.text);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAnalysis('Sorry, I encountered an error while analyzing the reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl border border-indigo-100 w-[400px] max-h-[600px] overflow-hidden flex flex-col mb-4"
          >
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold">AI Principal Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 p-1 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow bg-slate-50">
              {!analysis && !loading ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Analyze Reports</h3>
                  <p className="text-xs text-slate-500 mb-6">Get AI-powered insights and summaries from the current filtered reports.</p>
                  <button
                    onClick={analyzeReports}
                    className="px-6 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Start Analysis
                  </button>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                  <p className="text-xs font-bold text-blue-600 animate-pulse">Analyzing reports...</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-[13px]">
                    {analysis}
                  </div>
                  <button
                    onClick={() => { setAnalysis(null); analyzeReports(); }}
                    className="mt-6 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Refresh Analysis
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded flex items-center justify-center shadow-2xl transition-all active:scale-95 group",
          isOpen ? "bg-white text-blue-600" : "bg-blue-600 text-white"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 group-hover:animate-pulse" />}
      </button>
    </div>
  );
}
