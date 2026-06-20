export type IntakeData = {
  name: string
  email: string
  crm: string
  hasApiSpecialist: string
  apiSpecialistName: string
  dataFlow: string[]
  dataFlowNotes: string
  companyToCrmObjects: string[]
  companyToCrmFrequency: string
  companyToCrmNotes: string
  crmToCompanyObjects: string[]
  crmToCompanyTrigger: string[]
  crmToCompanyNotes: string
  timeline: string
  successCriteria: string
}

export type Option = {
  label: string
  value: string
}

export type Field =
  | {
      id: keyof IntakeData
      label: string
      type: 'text' | 'email' | 'select' | 'textarea' | 'radio'
      placeholder?: string
      required?: boolean
      options?: Option[]
      showWhen?: (data: IntakeData) => boolean
    }
  | {
      id: keyof IntakeData
      label: string
      type: 'checkbox-group'
      helper?: string
      required?: boolean
      options: Option[]
      showWhen?: (data: IntakeData) => boolean
    }

export type Step = {
  id: string
  title: string
  eyebrow: string
  description?: string
  fields: Field[]
  includeWhen?: (data: IntakeData) => boolean
}

export const initialIntakeData: IntakeData = {
  name: '',
  email: '',
  crm: '',
  hasApiSpecialist: '',
  apiSpecialistName: '',
  dataFlow: [],
  dataFlowNotes: '',
  companyToCrmObjects: [],
  companyToCrmFrequency: '',
  companyToCrmNotes: '',
  crmToCompanyObjects: [],
  crmToCompanyTrigger: [],
  crmToCompanyNotes: '',
  timeline: '',
  successCriteria: '',
}

export const integrationSteps: Step[] = [
  {
    id: 'contact',
    eyebrow: 'Start',
    title: 'Tell us who is involved',
    description: 'Basic account details help route the integration request.',
    fields: [
      {
        id: 'name',
        label: 'Name',
        type: 'text',
        placeholder: 'Jane Smith',
        required: true,
      },
      {
        id: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'jane@company.com',
        required: true,
      },
      {
        id: 'crm',
        label: 'CRM',
        type: 'select',
        required: true,
        options: [
          { label: 'Select CRM', value: '' },
          { label: 'Salesforce', value: 'salesforce' },
          { label: 'HubSpot', value: 'hubspot' },
          { label: 'JobNimbus', value: 'jobnimbus' },
          { label: 'GoHighLevel', value: 'gohighlevel' },
          { label: 'Monday.com', value: 'monday' },
          { label: 'NetSuite', value: 'netsuite' },
          { label: 'Zoho', value: 'zoho' },
          { label: 'Microsoft Dynamics', value: 'dynamics' },
          { label: 'Other / custom CRM', value: 'other' },
        ],
      },
      {
        id: 'hasApiSpecialist',
        label: 'Do you have a dedicated API specialist?',
        type: 'radio',
        required: true,
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
      },
      {
        id: 'apiSpecialistName',
        label: 'API specialist contact email',
        type: 'email',
        placeholder: 'email',
        showWhen: (data) => data.hasApiSpecialist === 'yes',
      },
    ],
  },
  {
    id: 'data-flow',
    eyebrow: 'Direction',
    title: 'How is data flowing?',
    description: 'Check all that apply.',
    fields: [
      {
        id: 'dataFlow',
        label: 'Integration direction',
        type: 'checkbox-group',
        required: true,
        options: [
          {
            label: 'Looking to get data to CRM from Company',
            value: 'company-to-crm',
          },
          {
            label: 'Looking to send data to Company from CRM',
            value: 'crm-to-company',
          },
        ],
      },
      {
        id: 'dataFlowNotes',
        label: 'Additional notes',
        type: 'textarea',
        placeholder: 'Share anything important about the desired data flow.',
      },
    ],
  },
  {
    id: 'company-to-crm',
    eyebrow: 'Company to CRM',
    title: 'What should Company send to the CRM?',
    includeWhen: (data) => data.dataFlow.includes('company-to-crm'),
    fields: [
      {
        id: 'companyToCrmObjects',
        label: 'Data objects',
        type: 'checkbox-group',
        required: true,
        options: [
          { label: 'Customer Name', value: 'customer-name' },
          { label: 'Customer ID', value: 'customer-id' },
          { label: 'Proposal ID', value: 'proposal-id' },
          { label: 'Pricing', value: 'pricing' },
          { label: 'System Size', value: 'system-size' },
          { label: 'Equipment (panel/inverter/optimizer/battery)', value: 'equipment' },
          { label: 'Adders', value: 'adders' },
          { label: 'Signed Contracts', value: 'signed-contracts' },
        ],
      },
      {
        id: 'companyToCrmFrequency',
        label: 'When data sends',
        type: 'select',
        required: false,
        options: [
          { label: 'On Webhook Trigger', value: 'on-webhook-trigger' },
        ],
      },
      {
        id: 'companyToCrmNotes',
        label: 'Company to CRM notes',
        type: 'textarea',
        placeholder: 'Anything else you want to let us know about Company to CRM data flow?',
      },
    ],
  },
  {
    id: 'crm-to-company',
    eyebrow: 'CRM to Company',
    title: 'What are you trying to accomplish in Company from your CRM?',
    includeWhen: (data) => data.dataFlow.includes('crm-to-company'),
    fields: [
      {
        id: 'crmToCompanyObjects',
        label: 'Data objects',
        type: 'checkbox-group',
        required: true,
        options: [
          { label: 'Create New Customer', value: 'new-customer' },
          { label: 'Create New User', value: 'new-user' },
        ],
      },
      {
        id: 'crmToCompanyTrigger',
        label: 'What should trigger it from your CRM?',
        type: 'checkbox-group',
        required: true,
        options: [
          { label: 'Select trigger', value: '' },
          { label: 'Record created', value: 'created' },
          { label: 'Record updated', value: 'updated' },
          { label: 'Status or stage changed', value: 'status-changed' },
          { label: 'Manual user action', value: 'manual' },
        ],
      },
      {
        id: 'crmToCompanyNotes',
        label: 'CRM to Company notes',
        type: 'textarea',
        placeholder: 'Mention source fields, required filters, or exceptions.',
      },
    ],
  },
  {
    id: 'goals',
    eyebrow: 'Outcome',
    title: 'What does a successful integration look like?',
    fields: [
      {
        id: 'timeline',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: [
          { label: 'Select timeline', value: '' },
          { label: 'As soon as possible', value: 'asap' },
          { label: 'This month', value: 'this-month' },
          { label: 'This quarter', value: 'this-quarter' },
          { label: 'Exploring options', value: 'exploring' },
        ],
      },
      {
        id: 'successCriteria',
        label: 'Success criteria',
        type: 'textarea',
        required: true,
        placeholder: 'Describe what the backend should analyze and return next.',
      },
    ],
  },
]
