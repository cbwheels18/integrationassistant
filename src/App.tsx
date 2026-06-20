import { useMemo, useState } from 'react'
import './App.css'
import {
  initialIntakeData,
  integrationSteps,
} from './integrationFlow'
import type { Field, IntakeData, Step } from './integrationFlow'
import type { FormEvent } from 'react'

const API_ENDPOINT = '/api/integrationassistant'

function getVisibleSteps(data: IntakeData) {
  return integrationSteps.filter((step) => !step.includeWhen || step.includeWhen(data))
}

function getVisibleFields(step: Step, data: IntakeData) {
  return step.fields.filter((field) => !field.showWhen || field.showWhen(data))
}

function isFieldComplete(field: Field, data: IntakeData) {
  if (!field.required) {
    return true
  }

  const value = data[field.id]

  if (Array.isArray(value)) {
    return value.length > 0
  }

  return value.trim().length > 0
}

function App() {
  const [data, setData] = useState<IntakeData>(initialIntakeData)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [submissionState, setSubmissionState] = useState<
    'idle' | 'submitting' | 'submitted' | 'error'
  >('idle')
  const [backendMessage, setBackendMessage] = useState('')

  const visibleSteps = useMemo(() => getVisibleSteps(data), [data])
  const currentStep = visibleSteps[Math.min(currentStepIndex, visibleSteps.length - 1)]
  const visibleFields = getVisibleFields(currentStep, data)
  const isLastStep = currentStepIndex === visibleSteps.length - 1
  const canContinue = visibleFields.every((field) => isFieldComplete(field, data))

  function updateValue(id: keyof IntakeData, value: string | string[]) {
    setData((current) => ({ ...current, [id]: value }))
    setSubmissionState('idle')
    setBackendMessage('')
  }

  function toggleCheckbox(id: keyof IntakeData, value: string) {
    const currentValue = data[id]

    if (!Array.isArray(currentValue)) {
      return
    }

    updateValue(
      id,
      currentValue.includes(value)
        ? currentValue.filter((item) => item !== value)
        : [...currentValue, value],
    )
  }

  function goBack() {
    setCurrentStepIndex((index) => Math.max(index - 1, 0))
  }

  function goNext() {
    if (!canContinue) {
      return
    }

    setCurrentStepIndex((index) => Math.min(index + 1, visibleSteps.length - 1))
  }

  async function submitIntake() {
    setSubmissionState('submitting')
    setBackendMessage('')

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submittedAt: new Date().toISOString(),
          intake: data,
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const result = await response.json().catch(() => null)
      setSubmissionState('submitted')
      setBackendMessage(
        result?.message ?? 'Your integration intake was sent for analysis.',
      )
    } catch (error) {
      setSubmissionState('error')
      setBackendMessage(
        error instanceof Error
          ? error.message
          : 'The backend request could not be completed.',
      )
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canContinue) {
      return
    }

    if (isLastStep) {
      void submitIntake()
      return
    }

    goNext()
  }

  return (
    <main className="app-shell">
      <section className="wizard">
        <aside className="wizard-sidebar" aria-label="Integration progress">
          <div>
            <p className="app-label">Integrations</p>
            <h1>Integration Intake</h1>
          </div>

          <ol className="step-list">
            {visibleSteps.map((step, index) => (
              <li
                className={[
                  'step-item',
                  index === currentStepIndex ? 'active' : '',
                  index < currentStepIndex ? 'complete' : '',
                ].join(' ')}
                key={step.id}
              >
                <span>{index + 1}</span>
                <div>
                  <strong>{step.eyebrow}</strong>
                  <small>{step.title}</small>
                </div>
              </li>
            ))}
          </ol>
        </aside>

        <form className="wizard-panel" onSubmit={handleSubmit}>
          <div className="step-heading">
            <p>{currentStep.eyebrow}</p>
            <h2>{currentStep.title}</h2>
            {currentStep.description ? <span>{currentStep.description}</span> : null}
          </div>

          <div className="fields">
            {visibleFields.map((field) => (
              <FormField
                data={data}
                field={field}
                key={field.id}
                onChange={updateValue}
                onToggle={toggleCheckbox}
              />
            ))}
          </div>

          {isLastStep ? (
            <section className="review-panel" aria-label="Submission preview">
              <div>
                <strong>Submission preview</strong>
                <span>This is the payload that will be sent to the backend.</span>
              </div>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </section>
          ) : null}

          {backendMessage ? (
            <p className={`submit-message ${submissionState}`}>{backendMessage}</p>
          ) : null}

          <div className="actions">
            <button
              className="secondary-button"
              disabled={currentStepIndex === 0 || submissionState === 'submitting'}
              onClick={goBack}
              type="button"
            >
              Back
            </button>
            <button
              className="primary-button"
              disabled={!canContinue || submissionState === 'submitting'}
              type="submit"
            >
              {submissionState === 'submitting'
                ? 'Sending...'
                : isLastStep
                  ? 'Finish'
                  : 'Next'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

type FormFieldProps = {
  data: IntakeData
  field: Field
  onChange: (id: keyof IntakeData, value: string | string[]) => void
  onToggle: (id: keyof IntakeData, value: string) => void
}

function FormField({ data, field, onChange, onToggle }: FormFieldProps) {
  const value = data[field.id]

  if (field.type === 'checkbox-group') {
    const selectedValues = Array.isArray(value) ? value : []

    return (
      <fieldset className="field-group">
        <legend>
          {field.label}
          {field.required ? <span aria-label="required">*</span> : null}
        </legend>
        {field.helper ? <p>{field.helper}</p> : null}
        <div className="choice-stack">
          {field.options.map((option) => (
            <label className="choice" key={option.value}>
              <input
                checked={selectedValues.includes(option.value)}
                onChange={() => onToggle(field.id, option.value)}
                type="checkbox"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  if (field.type === 'radio') {
    return (
      <fieldset className="field-group">
        <legend>
          {field.label}
          {field.required ? <span aria-label="required">*</span> : null}
        </legend>
        <div className="segmented-options">
          {field.options?.map((option) => (
            <label className="segmented-choice" key={option.value}>
              <input
                checked={value === option.value}
                name={field.id}
                onChange={() => onChange(field.id, option.value)}
                type="radio"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  return (
    <label className="field">
      <span>
        {field.label}
        {field.required ? <small aria-label="required">*</small> : null}
      </span>

      {field.type === 'textarea' ? (
        <textarea
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
          value={typeof value === 'string' ? value : ''}
        />
      ) : field.type === 'select' ? (
        <select
          onChange={(event) => onChange(field.id, event.target.value)}
          value={typeof value === 'string' ? value : ''}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
          type={field.type}
          value={typeof value === 'string' ? value : ''}
        />
      )}
    </label>
  )
}

export default App
