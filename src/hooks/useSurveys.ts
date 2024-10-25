import { useState, useEffect } from 'react';
import { GitHubStorage } from '@/lib/github';
import type { Survey, SurveyResponse } from '@/types/survey';

const storage = new GitHubStorage();

export function useSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  async function loadSurveys() {
    setLoading(true);
    try {
      const surveyIds = await storage.listSurveys();
      const loadedSurveys = await Promise.all(
        surveyIds.map(id => storage.loadSurvey(id))
      );
      setSurveys(loadedSurveys.filter((s): s is Survey => s !== null));
    } catch (error) {
      console.error('Failed to load surveys:', error);
      setError('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  }

  const createSurvey = async (surveyData: Omit<Survey, 'id' | 'responses'>) => {
    const newSurvey: Survey = {
      id: Date.now().toString(),
      ...surveyData,
      responses: []
    };

    await storage.saveSurvey(newSurvey);
    setSurveys([...surveys, newSurvey]);
    return newSurvey;
  };

  const submitResponse = async (surveyId: string, response: Omit<SurveyResponse, 'id'>) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    const updatedSurvey = {
      ...survey,
      responses: [...survey.responses, { id: Date.now().toString(), ...response }]
    };

    await storage.saveSurvey(updatedSurvey);
    setSurveys(surveys.map(s => s.id === surveyId ? updatedSurvey : s));
  };

  return {
    surveys,
    loading,
    createSurvey,
    submitResponse,
    reloadSurveys: loadSurveys
  };
}

