import React, { useState, useEffect } from 'react';
import { Company, InterviewQuestion, InterviewStatus } from '../types';
import { apiClient } from '../api/client';
import {
  MessageSquare,
  Send,
  SkipForward,
  CheckCircle2,
  Edit3,
  HelpCircle,
  Sparkles,
  Lock,
} from 'lucide-react';

interface InterviewPageProps {
  company: Company | null;
  onInterviewComplete?: () => void;
}

export const InterviewPage: React.FC<InterviewPageProps> = ({ company, onInterviewComplete }) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [status, setStatus] = useState<InterviewStatus | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editAnswerText, setEditAnswerText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterview = async () => {
    if (!company) return;
    try {
      const [qData, sData] = await Promise.all([
        apiClient.getInterviewQuestions(company.id),
        apiClient.getInterviewStatus(company.id),
      ]);
      setQuestions(qData);
      setStatus(sData);
    } catch (err: any) {
      setError(err.message || 'Failed to load interview.');
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [company?.id]);

  if (!company) {
    return <div className="p-8 text-center text-slate-400">Select a company first.</div>;
  }

  const activeQuestion = status?.current_question;

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion || !currentAnswer.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await apiClient.submitAnswer(activeQuestion.id, currentAnswer.trim());
      setCurrentAnswer('');
      await fetchInterview();
      if (onInterviewComplete) onInterviewComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (!activeQuestion) return;
    setIsLoading(true);
    try {
      await apiClient.skipQuestion(activeQuestion.id);
      await fetchInterview();
    } catch (err: any) {
      setError(err.message || 'Failed to skip question.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAnswer = async (answerId: string) => {
    if (!editAnswerText.trim()) return;
    try {
      await apiClient.updateAnswer(answerId, editAnswerText.trim());
      setEditingQuestionId(null);
      await fetchInterview();
    } catch (err: any) {
      alert(err.message || 'Failed to update answer.');
    }
  };

  const progressPct = status ? Math.round(((status.answered_count + status.skipped_count) / 10) * 100) : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Dynamic Context Interview Engine</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
          Adaptive 10-Question Founder Interview
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Questions are dynamically synthesized for {company.name} based on its industry, products, customer segments, and verified public research.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
          <span>
            Progress: {status?.answered_count || 0} Answered, {status?.skipped_count || 0} Skipped of 10 Questions
          </span>
          <span className="font-bold text-emerald-400">{progressPct}% Complete</span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Active Question Box (One at a time) */}
      {!status?.is_completed && activeQuestion ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              Question {activeQuestion.question_order} of 10 • {activeQuestion.question_category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Confidentiality Option Available
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white leading-snug">
            {activeQuestion.question_text}
          </h3>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300 font-sans">Why this question was generated:</strong>{' '}
              {activeQuestion.context_rationale}
            </div>
          </div>

          <form onSubmit={handleSubmitAnswer} className="space-y-3 pt-2">
            <textarea
              rows={4}
              required
              placeholder="Provide your executive answer here. This will be used to calibrate source relevance and weighting..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />

            {error && <div className="text-xs text-rose-400">{error}</div>}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleSkipQuestion}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip as Confidential</span>
              </button>

              <button
                type="submit"
                disabled={isLoading || !currentAnswer.trim()}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Saving...' : 'Submit Answer'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-2 shadow-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Adaptive Interview Completed!</h3>
          <p className="text-xs text-slate-300 max-w-xl mx-auto">
            All 10 questions have been addressed. The structured intelligence profile is active and has calibrated the Signal Stack sources, competitor monitoring priorities, and Monday Morning Brief parameters.
          </p>
        </div>
      )}

      {/* Review & Edit Previous Answers */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Interview History & Editable Records ({questions.filter((q) => q.answer || q.is_skipped).length}/10)</span>
        </h3>

        <div className="space-y-3">
          {questions
            .filter((q) => q.answer || q.is_skipped)
            .map((q) => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-slate-300">
                    Q{q.question_order}: {q.question_category}
                  </span>
                  {q.is_skipped ? (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      Skipped (Confidential)
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingQuestionId(q.id);
                        setEditAnswerText(q.answer?.answer_text || '');
                      }}
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Answer</span>
                    </button>
                  )}
                </div>

                <div className="text-xs font-semibold text-white">{q.question_text}</div>

                {editingQuestionId === q.id ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={3}
                      value={editAnswerText}
                      onChange={(e) => setEditAnswerText(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-emerald-500 rounded-lg text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateAnswer(q.answer!.id)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingQuestionId(null)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  q.answer && (
                    <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                      <strong className="text-emerald-400 font-mono text-[10px] block mb-1">
                        Recorded Answer:
                      </strong>
                      {q.answer.answer_text}
                    </div>
                  )
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
