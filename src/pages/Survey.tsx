import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { useSurveys } from '@/hooks/useSurveys'
import type { SurveyResponse } from '@/types/survey'

export function SurveyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { surveys, submitResponse } = useSurveys()
  const [surveyId, setSurveyId] = useState(id || '')
  const [response, setResponse] = useState<Omit<SurveyResponse, 'id'>>({})

  const survey = surveys.find(s => s.id === surveyId)

  if (!id) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Take a Survey</h1>
        <div className="max-w-md">
          <Label htmlFor="surveyId">Enter Survey ID</Label>
          <Input
            id="surveyId"
            value={surveyId}
            onChange={(e) => setSurveyId(e.target.value)}
          />
          {surveyId && !survey && (
            <p className="text-red-500 mt-2">Survey not found</p>
          )}
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Survey Not Found</h1>
        <Button onClick={() => navigate('/')} className="mt-4">
          Go Home
        </Button>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitResponse(survey.id, response)
    navigate('/')
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
                onChange={(e) =>
                  setResponse({ ...response, [question.id]: e.target.value })
                }
                required
              />
            )}

            {question.type === 'textarea' && (
              <Textarea
                value={response[question.id] as string || ''}
                onChange={(e) =>
                  setResponse({ ...response, [question.id]: e.target.value })
                }
                required
              />
            )}

            {question.type === 'radio' && question.options && (
              <RadioGroup
                value={response[question.id] as string}
                onValueChange={(value) =>
                  setResponse({ ...response, [question.id]: value })
                }
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
                        const currentValues = (response[question.id] as string[]) || []
                        setResponse({
                          ...response,
                          [question.id]: checked
                            ? [...currentValues, option]
                            : currentValues.filter((v) => v !== option)
                        })
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
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit">Submit Response</Button>
        </div>
      </form>
    </div>
  )
}
