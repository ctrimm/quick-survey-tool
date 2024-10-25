import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useSurveys } from '@/hooks/useSurveys'
import { Link } from 'react-router-dom'
import type { Question } from '@/types/survey'

export function AdminDashboard() {
  const { surveys, createSurvey } = useSurveys()
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    questions: [] as Question[]
  })

  const addQuestion = (type: Question['type']) => {
    setNewSurvey({
      ...newSurvey,
      questions: [
        ...newSurvey.questions,
        {
          id: Date.now().toString(),
          type,
          text: '',
          options: type === 'radio' || type === 'checkbox' ? [''] : undefined
        }
      ]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createSurvey(newSurvey)
    setNewSurvey({
      title: '',
      description: '',
      questions: []
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link to="/">
          <Button>Logout</Button>
        </Link>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Create New Survey</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Survey Title</Label>
            <Input
              id="title"
              value={newSurvey.title}
              onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newSurvey.description}
              onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-4">
            {newSurvey.questions.map((question, idx) => (
              <Card key={question.id} className="p-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Question Text"
                    value={question.text}
                    onChange={(e) => {
                      const questions = [...newSurvey.questions]
                      questions[idx].text = e.target.value
                      setNewSurvey({ ...newSurvey, questions })
                    }}
                    required
                  />
                  
                  {(question.type === 'radio' || question.type === 'checkbox') && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex gap-2">
                          <Input
                            placeholder={`Option ${optIdx + 1}`}
                            value={option}
                            onChange={(e) => {
                              const questions = [...newSurvey.questions]
                              questions[idx].options![optIdx] = e.target.value
                              setNewSurvey({ ...newSurvey, questions })
                            }}
                            required
                          />
                          {question.options!.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => {
                                const questions = [...newSurvey.questions]
                                questions[idx].options = questions[idx].options!.filter(
                                  (_, i) => i !== optIdx
                                )
                                setNewSurvey({ ...newSurvey, questions })
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => {
                          const questions = [...newSurvey.questions]
                          questions[idx].options!.push('')
                          setNewSurvey({ ...newSurvey, questions })
                        }}
                      >
                        Add Option
                      </Button>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={() => {
                      setNewSurvey({
                        ...newSurvey,
                        questions: newSurvey.questions.filter((_, i) => i !== idx)
                      })
                    }}
                  >
                    Remove Question
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={() => addQuestion('text')}>
              Add Text Question
            </Button>
            <Button type="button" onClick={() => addQuestion('textarea')}>
              Add Long Answer
            </Button>
            <Button type="button" onClick={() => addQuestion('radio')}>
              Add Multiple Choice
            </Button>
            <Button type="button" onClick={() => addQuestion('checkbox')}>
              Add Checkbox Question
            </Button>
          </div>

          <Button type="submit" disabled={!newSurvey.title || newSurvey.questions.length === 0}>
            Create Survey
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Surveys</h2>
        {surveys.map((survey) => (
          <Card key={survey.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{survey.title}</h3>
                <p className="text-sm text-gray-500">
                  {survey.responses.length} responses | ID: {survey.id}
                </p>
              </div>
              <div className="space-x-2">
                <Link to={`/results/${survey.id}`}>
                  <Button>View Results</Button>
                </Link>
                <Link to={`/survey/${survey.id}`}>
                  <Button>Take Survey</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
