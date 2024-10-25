import * as React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useSurveys } from '@/hooks/useSurveys';
import { AlertCircle, CheckCircle2, Loader2, ClipboardList } from 'lucide-react';
import type { SurveyResponse } from '@/types/survey';

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';
type SurveyState = 'lookup' | 'loading' | 'preview' | 'taking' | 'notFound';

export function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { surveys, submitResponse, loading: surveysLoading } = useSurveys();
  const [surveyId, setSurveyId] = useState(id || '');
  const [surveyState, setSurveyState] = useState<SurveyState>(
    id ? 'loading' : 'lookup'
  );
  const [response, setResponse] = useState<Omit<SurveyResponse, 'id'>>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [error, setError] = useState<string>('');

  const survey = surveys.find(s => s.id === (id || surveyId));

  // Update survey state when data loads
  React.useEffect(() => {
    if (id && !surveysLoading) {
      setSurveyState(survey ? 'preview' : 'notFound');
    }
  }, [id, survey, surveysLoading]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1500,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionState('submitting');
    setError('');

    try {
      await submitResponse(survey!.id, response);
      setSubmissionState('success');
      triggerConfetti();
    } catch (err) {
      setSubmissionState('error');
      setError(err instanceof Error ? err.message : 'Failed to submit survey');
    }
  };

  const handleSurveyIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (surveyId) {
      navigate(`/survey/${surveyId}`);
    }
  };

  if (surveyState === 'loading' || surveysLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading survey...</p>
      </div>
    );
  }

  if (submissionState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-6">Your response has been recorded.</p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/')}>Return Home</Button>
          <Button variant="outline" onClick={() => {
            setSubmissionState('idle');
            setResponse({});
            setSurveyState('lookup');
            navigate('/survey');
          }}>
            Take Another Survey
          </Button>
        </div>
      </div>
    );
  }

  if (submissionState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Submission Failed</h2>
        <p className="text-red-600 mb-6">{error || 'Please try again later.'}</p>
        <div className="space-x-4">
          <Button onClick={() => setSubmissionState('idle')}>Try Again</Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (surveyState === 'lookup') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Take a Survey</h1>
        <form onSubmit={handleSurveyIdSubmit} className="max-w-md space-y-4">
          <div>
            <Label htmlFor="surveyId">Enter Survey ID</Label>
            <Input
              id="surveyId"
              value={surveyId}
              onChange={(e) => setSurveyId(e.target.value)}
              placeholder="Enter the survey ID you received"
              required
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit">Find Survey</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
          </div>
          {surveyId && !survey && !surveysLoading && (
            <p className="text-red-500">Survey not found</p>
          )}
        </form>
      </div>
    );
  }

  if (surveyState === 'notFound' || !survey) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Survey Not Found</h1>
        <p className="text-gray-600 mt-2 mb-6">
          The survey you're looking for doesn't exist or has been removed.
        </p>
        <div className="space-x-4">
          <Button onClick={() => {
            setSurveyState('lookup');
            navigate('/survey');
          }}>Try Another Survey ID</Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (surveyState === 'preview') {
    return (
      <Card className="max-w-2xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <ClipboardList className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{survey.title}</h1>
            <p className="text-gray-500">Survey ID: {survey.id}</p>
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          <div>
            <h2 className="font-medium text-gray-700">Description</h2>
            <p className="text-gray-600">{survey.description}</p>
          </div>
          
          <div>
            <h2 className="font-medium text-gray-700">Questions</h2>
            <p className="text-gray-600">{survey.questions.length} questions to answer</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-medium text-gray-700 mb-2">Question Types:</h2>
            <ul className="list-disc list-inside text-gray-600">
              {Array.from(new Set(survey.questions.map(q => q.type))).map(type => (
                <li key={type} className="capitalize">{type} Response</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => {
            setSurveyState('lookup');
            navigate('/survey');
          }}>
            Cancel
          </Button>
          <Button onClick={() => setSurveyState('taking')}>
            Start Survey
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{survey.title}</h1>
        <p className="text-gray-600">{survey.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {survey.questions.map((question) => (
          <Card key={question.id} className="p-4 space-y-2">
            <Label>{question.text}</Label>
            
            {question.type === 'text' && (
              <Input
                value={response[question.id] as string || ''}
                onChange={(e) => setResponse({ 
                  ...response, 
                  [question.id]: e.target.value 
                })}
                required
              />
            )}

            {question.type === 'textarea' && (
              <Textarea
                value={response[question.id] as string || ''}
                onChange={(e) => setResponse({ 
                  ...response, 
                  [question.id]: e.target.value 
                })}
                required
              />
            )}

            {question.type === 'radio' && question.options && (
              <RadioGroup
                value={response[question.id] as string}
                onValueChange={(value) => setResponse({ 
                  ...response, 
                  [question.id]: value 
                })}
                required
              >
                {question.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                    <Label htmlFor={`${question.id}-${idx}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'checkbox' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.id}-${idx}`}
                      checked={(response[question.id] as string[] || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const currentValues = (response[question.id] as string[]) || [];
                        setResponse({
                          ...response,
                          [question.id]: checked
                            ? [...currentValues, option]
                            : currentValues.filter((v) => v !== option)
                        });
                      }}
                    />
                    <Label htmlFor={`${question.id}-${idx}`}>{option}</Label>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            onClick={() => setSurveyState('preview')}
            disabled={submissionState === 'submitting'}
          >
            Back to Preview
          </Button>
          <Button 
            type="submit"
            disabled={submissionState === 'submitting'}
          >
            {submissionState === 'submitting' ? 'Submitting...' : 'Submit Response'}
          </Button>
        </div>
      </form>
    </div>
  );
}
