// src/lib/storage.ts
import { Survey } from '@/types/survey';

export class CSVStorage {
  // Convert survey metadata to CSV
  static surveyToCSV(survey: Survey): string {
    const headers = ['id', 'title', 'description', 'questions'];
    const questionData = JSON.stringify(survey.questions); // Store questions as JSON since they're structured
    const row = [survey.id, survey.title, survey.description, questionData];
    
    return [
      headers.join(','),
      this.escapeCSVRow(row)
    ].join('\n');
  }

  // Convert survey responses to CSV
  static responsesToCSV(survey: Survey): string {
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

  // Helper to properly escape CSV values
  private static escapeCSVRow(row: (string | number)[]): string {
    return row.map(value => {
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  }
}
