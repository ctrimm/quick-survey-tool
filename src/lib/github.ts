import { Survey, SurveyResponse } from '@/types/survey';

export class GitHubStorage {
  private owner: string;
  private repo: string;
  private branch: string;
  private token: string;
  // Add initialized flag
  private initialized: boolean = false;

  constructor() {
    // Initialize with empty strings to avoid undefined
    this.owner = '';
    this.repo = '';
    this.token = '';
    this.branch = 'gh-pages';
  }

  private async initialize() {
    // Access the injected environment variables
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (window as any).ENV;
    if (!env) {
      throw new Error('Environment variables not found');
    }
    
    this.owner = env.GITHUB_OWNER;
    this.repo = env.GITHUB_REPO;
    this.token = env.GITHUB_TOKEN;
    
    if (!this.owner || !this.repo || !this.token) {
      throw new Error('Missing required GitHub configuration');
    }
    
    this.initialized = true;
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private async readFile(path: string): Promise<string> {
    await this.ensureInitialized();
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
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

  private async createDirectory(path: string) {
    await this.ensureInitialized();
    try {
      // Try to create an empty .gitkeep file in the directory
      await this.commitFile(
        `${path}/.gitkeep`,
        '',
        `Create ${path} directory`
      );
    } catch {
      console.log(`Directory ${path} might already exist or creation failed`);
    }
  }

  private async commitFile(path: string, content: string, message: string) {
    await this.ensureInitialized();
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    
    try {
      // First try to get existing file
      let sha: string | undefined;
      try {
        const response = await fetch(url, {
          headers: { 
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          sha = data.sha;
        }
      } catch {
        // File doesn't exist yet, which is fine
        console.log(`Directory or file does not yet exist`);
      }

      // Create or update file
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
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
        const errorData = await response.json();
        throw new Error(`Failed to commit file: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error committing file:', error);
      throw error;
    }
  }

  private static surveyToCSV(survey: Survey): string {
    const headers = ['id', 'title', 'description', 'questions'];
    const questionData = JSON.stringify(survey.questions); // Store questions as JSON since they're structured
    const row = [survey.id, survey.title, survey.description, questionData];
    
    return [
      headers.join(','),
      this.escapeCSVRow(row)
    ].join('\n');
  }

  private static responsesToCSV(survey: Survey): string {
    // Create headers from question texts
    const headers = ['response_id', ...survey.questions.map(q => q.text)];
    
    // Convert each response to a row
    const rows = survey.responses.map(response => {
      return [
        response.id,
        ...survey.questions.map(question => {
          const value = response[question.id];
          if (Array.isArray(value)) {
            // For checkbox questions, join multiple values
            return value.join(';');
          }
          return value || '';
        })
      ];
    });

    return [
      headers.join(','),
      ...rows.map(row => this.escapeCSVRow(row))
    ].join('\n');
  }

  private static escapeCSVRow(row: (string | number)[]): string {
    return row.map(value => {
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  }

  async saveSurvey(survey: Survey): Promise<void> {
    await this.ensureInitialized();
    try {
      // Create surveys directory if it doesn't exist
      await this.createDirectory('surveys');
      
      // Create survey-specific directory
      await this.createDirectory(`surveys/${survey.id}`);

      // Save survey metadata
      const surveyCSV = GitHubStorage.surveyToCSV(survey);
      await this.commitFile(
        `surveys/${survey.id}/survey.csv`,
        surveyCSV,
        `Update survey ${survey.id} metadata`
      );

      // Save responses
      const responsesCSV = GitHubStorage.responsesToCSV(survey);
      await this.commitFile(
        `surveys/${survey.id}/responses.csv`,
        responsesCSV,
        `Update survey ${survey.id} responses`
      );
    } catch (error) {
      console.error('Error saving survey:', error);
      throw error;
    }
  }

  async loadSurvey(id: string): Promise<Survey | null> {
    await this.ensureInitialized();
    try {
      // Read survey metadata
      const surveyContent = await this.readFile(`surveys/${id}/survey.csv`);
      if (!surveyContent) return null;

      // Parse CSV (skipping header row)
      const [, dataRow] = surveyContent.trim().split('\n');
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

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    await this.ensureInitialized();
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/surveys`;
    try {
      // Try to create surveys directory if it doesn't exist
      await this.createDirectory('surveys');

      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Failed to list surveys: ${response.statusText}`);
      }

      const data = await response.json();

      // Filter out .gitkeep and only return directory names
      interface GithubDirectoryItem {
        type: string;
        name: string;
      }
      
      return data
        .filter((item: GithubDirectoryItem) => item.type === 'dir')
        .map((item: GithubDirectoryItem) => item.name);
    } catch (error) {
      console.error('Error listing surveys:', error);
      return [];
    }
  }
}
