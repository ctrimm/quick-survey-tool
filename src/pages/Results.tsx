import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSurveys } from '@/hooks/useSurveys'

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { surveys } = useSurveys()
  const survey = surveys.find(s => s.id === id)

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

  const getResponseSummary = (questionId: string) => {
    const responses = survey.responses.map(r => r[questionId])
    
    if (Array.isArray(responses[0])) {
      // For checkbox questions
      const options = survey.questions.find(q => q.id === questionId)?.options || []
      return options.map(option => ({
        option,
        count: responses.filter(r => (r as string[]).includes(option)).length
      }))
    } else {
      // For other question types
      const counts: Record<string, number> = {}
      responses.forEach(r => {
        counts[r as string] = (counts[r as string] || 0) + 1
      })
      return Object.entries(counts).map(([option, count]) => ({
        option,
        count
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{survey.title} - Results</h1>
          <p className="text-gray-600">Total Responses: {survey.responses.length}</p>
        </div>
        <Button onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {survey.questions.map((question) => (
        <Card key={question.id} className="p-4">
          <h2 className="font-bold mb-4">{question.text}</h2>
          
          {(question.type === 'text' || question.type === 'textarea') ? (
            <div className="space-y-2">
              {survey.responses.map((response, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded">
                  {response[question.id] as string}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {getResponseSummary(question.id).map(({ option, count }, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{option}</span>
                  <span className="font-medium">
                    {count} ({Math.round((count / survey.responses.length) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
