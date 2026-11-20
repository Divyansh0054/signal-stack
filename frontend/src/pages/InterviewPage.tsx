import React, { useState, useEffect } from 'react';
import { Company, InterviewQuestion, InterviewStatus } from '../types';
import { apiClient } from '../api/client';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  Building,
  ArrowRight,
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
  const [showHistory, setShowHistory] = useState(false);

  const fetchInterview = async () => {
    if (!company) return;
    try {
      const [qData, sData] = await Promise.all([
        apiClient.getInterviewQuestions(company.id),
        apiClient.getInterviewStatus(company.id),
      ]);
      setQuestions(qData);
      setStatus(sData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [company?.id]);

  if (!company) {
    return <div className="p-16 text-center text-slate-500">Please select a company first.</div>;
  }

  const activeQuestion = status?.current_question;
  const answeredCount = status?.answered_count || 0;
  const skippedCount = status?.skipped_count || 0;
  const totalCompleted = answeredCount + skippedCount;
  const isAllComplete = status?.is_completed || totalCompleted >= 10;
  const currentStepNumber = activeQuestion ? activeQuestion.question_order : 10;

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion || !currentAnswer.trim()) return;

    setIsLoading(true);
    try {
      await apiClient.submitAnswer(activeQuestion.id, currentAnswer.trim());
      setCurrentAnswer('');
      await fetchInterview();
      if (onInterviewComplete) onInterviewComplete();
    } catch (err: any) {
      alert(err.message || 'Failed to submit answer.');
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
      alert(err.message || 'Failed to skip question.');
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

  return (
    <div className="p-8 max-w-3xl mx-auto font-sans space-y-10 py-12">
      {/* Top Context Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Executive Discovery
        </span>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Understanding {company.name}
        </h2>
        <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          The engine adapts its questions dynamically based on company research and prior answers to sharpen the Signal Stack.
        </p>

        {/* 10 Progress Dots */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: 10 }).map((_, idx) => {
            const isDone = idx < totalCompleted;
            const isCurrent = idx === totalCompleted && !isAllComplete;
            return (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  isDone
                    ? 'w-6 bg-slate-900'
                    : isCurrent
                    ? 'w-6 bg-emerald-600 animate-pulse'
                    : 'w-2 bg-slate-200'
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Conversational Question Card */}
      {!isAllComplete && activeQuestion ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 md:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Question {currentStepNumber} of 10 · {activeQuestion.question_category.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Confidential Executive Input</span>
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
              "{activeQuestion.question_text}"
            </h3>

            {activeQuestion.context_rationale && (
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                <strong className="text-slate-700 font-medium">Why we ask this:</strong> {activeQuestion.context_rationale}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <textarea
              rows={4}
              required
              placeholder="Type your response here... (e.g. key strategic priorities, competitive differentiators, or pipeline friction)"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-all leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSkipQuestion}
                disabled={isLoading}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                Skip confidential question
              </button>

              <button
                type="submit"
                disabled={isLoading || !currentAnswer.trim()}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-xs"
              >
                <span>{isLoading ? 'Processing...' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Executive Interview Completed</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            All 10 discovery questions have been evaluated. Strategic priorities have been incorporated into the Signal Stack and weekly briefing engine.
          </p>
        </div>
      )}

      {/* Review & Edit Previous Answers Accordion */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-6 py-4 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span>Review Interview Responses ({questions.filter((q) => q.answer).length} Answered)</span>
          {showHistory ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showHistory && (
          <div className="divide-y divide-slate-100 p-6 pt-0 space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="pt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    Q{q.question_order}: {q.question_text}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {q.question_category}
                  </span>
                </div>

                {q.answer ? (
                  editingQuestionId === q.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={2}
                        value={editAnswerText}
                        onChange={(e) => setEditAnswerText(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingQuestionId(null)}
                          className="px-3 py-1 text-slate-500 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateAnswer(q.answer!.id)}
                          className="px-3 py-1 bg-slate-900 text-white rounded-lg font-medium"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <p className="text-slate-700 leading-relaxed">{q.answer.answer_text}</p>
                      <button
                        onClick={() => {
                          setEditingQuestionId(q.id);
                          setEditAnswerText(q.answer!.answer_text);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 ml-2 shrink-0"
                        title="Edit answer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                ) : (
                  <p className="text-slate-400 italic text-[11px]">Question skipped as confidential.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
