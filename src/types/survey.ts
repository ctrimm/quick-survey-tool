export interface Question {
  id: string
  type: 'text' | 'textarea' | 'radio' | 'checkbox'
  text: string
  options?: string[]
}

export interface Survey {
  id: string
  title: string
  description: string
  questions: Question[]
  responses: SurveyResponse[]
}

export interface SurveyResponse {
  id: string
  [key: string]: string | string[]
}
