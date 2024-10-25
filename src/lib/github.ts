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
      console.log('File does not exist yet', error);
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
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) return '';
        throw new Error(`Failed to read file: ${response.statusText}`);
      }

      const data = await response.json();
      return atob(data.content);
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
      throw error;
    }
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
      const [dataRow] = surveyContent.trim().split('\n');
      if (!dataRow) return null;

      // Parse the CSV row, handling quoted values properly
      const parseCSVRow = (row: string): string[] => {
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"') {
            if (insideQuotes && row[i + 1] === '"') {
              // Handle escaped quotes
              currentValue += '"';
              i++;
            } else {
              // Toggle quote state
              insideQuotes = !insideQuotes;
            }
          } else if (char === ',' && !insideQuotes) {
            // End of value
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue); // Add the last value
        return values;
      };

      const [surveyId, title, description, questionsJson] = parseCSVRow(dataRow);

      // Parse the questions JSON that was stored in the CSV
      let questions;
      try {
        questions = JSON.parse(questionsJson.replace(/^"(.*)"$/, '$1').replace(/""/g, '"'));
      } catch (error) {
        console.error('Error parsing questions JSON:', error);
        questions = [];
      }

      // Read responses
      const responsesContent = await this.readFile(`surveys/${id}/responses.csv`);
      const responses: SurveyResponse[] = [];

      if (responsesContent) {
        const rows = responsesContent.trim().split('\n').slice(1); // Skip header
        
        rows.forEach(row => {
          if (!row.trim()) return;

          const values = parseCSVRow(row);
          const [responseId, ...answers] = values;

          const response: SurveyResponse = { 
            id: responseId,
          };

          questions.forEach((question: any, index: number) => {
            const answer = answers[index];
            if (question.type === 'checkbox' && answer) {
              response[question.id] = answer.split(';').filter(Boolean);
            } else {
              response[question.id] = answer || '';
            }
          });

          responses.push(response);
        });
      }

      return {
        id: surveyId,
        title,
        description,
        questions,
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
