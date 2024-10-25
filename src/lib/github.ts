import { Survey, SurveyResponse } from '@/types/survey';
import { CSVStorage } from './storage';

export class GitHubStorage {
  private owner: string;
  private repo: string;
  private branch: string;
  private token: string;

  constructor(owner: string, repo: string, branch = 'main') {
    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
    // Use import.meta.env for Vite environment variables
    this.token = import.meta.env.VITE_GITHUB_TOKEN || '';
  }

  private async commitFile(path: string, content: string, message: string) {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    
    // First try to get existing file
    let sha: string | undefined;
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `token ${this.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        sha = data.sha;
      }
    } catch (error) {
      console.log('File does not exist yet');
    }

    // Create or update file
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: btoa(content),
        sha,
        branch: this.branch
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to commit file: ${response.statusText}`);
    }
  }

  private async readFile(path: string): Promise<string> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `token ${this.token}` }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return '';
      }
      throw new Error(`Failed to read file: ${response.statusText}`);
    }

    const data = await response.json();
    return atob(data.content);
  }

  async saveSurvey(survey: Survey): Promise<void> {
    // Save survey metadata
    const surveyCSV = CSVStorage.surveyToCSV(survey);
    await this.commitFile(
      `surveys/${survey.id}/survey.csv`,
      surveyCSV,
      `Update survey ${survey.id} metadata`
    );

    // Save responses
    const responsesCSV = CSVStorage.responsesToCSV(survey);
    await this.commitFile(
      `surveys/${survey.id}/responses.csv`,
      responsesCSV,
      `Update survey ${survey.id} responses`
    );
  }

  async loadSurvey(id: string): Promise<Survey | null> {
    try {
      // Read survey metadata
      const surveyContent = await this.readFile(`surveys/${id}/survey.csv`);
      if (!surveyContent) return null;

      // Parse CSV (skipping header row)
      const [_, dataRow] = surveyContent.split('\n');
      if (!dataRow) return null;

      const [surveyId, title, description, questionsJson] = dataRow.split(',').map(
        cell => cell.replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
      );

      // Read responses
      const responsesContent = await this.readFile(`surveys/${id}/responses.csv`);
      const responses: SurveyResponse[] = [];
      
      if (responsesContent) {
        const rows = responsesContent.split('\n').slice(1); // Skip header
        const questions = JSON.parse(questionsJson);
        
        rows.forEach(row => {
          if (!row.trim()) return;
          
          const values = row.split(',').map(
            cell => cell.replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
          );
          
          const [responseId, ...answers] = values;
          const response: SurveyResponse = { id: responseId };
          
          questions.forEach((question: any, index: number) => {
            const answer = answers[index];
            response[question.id] = question.type === 'checkbox' 
              ? answer.split(';')
              : answer;
          });
          
          responses.push(response);
        });
      }

      return {
        id: surveyId,
        title,
        description,
        questions: JSON.parse(questionsJson),
        responses
      };
    } catch (error) {
      console.error('Error loading survey:', error);
      return null;
    }
  }

  async listSurveys(): Promise<string[]> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/surveys`;
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `token ${this.token}` }
      });
      
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Failed to list surveys: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((item: any) => item.name);
    } catch (error) {
      console.error('Error listing surveys:', error);
      return [];
    }
  }
}
