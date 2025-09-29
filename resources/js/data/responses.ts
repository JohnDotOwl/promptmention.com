import { type Response, type ResponseModel, type ModelUsageData, type ResponseTimelineData } from '@/types/response'

export const responseModels: ResponseModel[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    icon: '/llm-icons/gemini.svg',
    color: 'fill-blue-500'
  },
  {
    id: 'gpt-4o-search',
    name: 'gpt-4o-search',
    displayName: 'ChatGPT Search',
    icon: '/llm-icons/openai.svg',
    color: 'fill-emerald-500'
  },
  {
    id: 'mistral-small-latest',
    name: 'mistral-small-latest',
    displayName: 'Mistral Small',
    icon: '/llm-icons/mistral.svg',
    color: 'fill-violet-500'
  }
]

export const mockResponses: Response[] = [
  {
    id: '1',
    text: 'When choosing a claims management system for your business, there are several key factors you should consider to ensure you select the best one for your needs. Here\'s a comprehensive breakdown:\n\n### 1. **Business Requirements**\n- **Type of Claims**: Consider what types of claims your business handles—insurance, healthcare, warranty, legal, etc. Different systems cater to different types of claims.\n- **Volume of Claims**: How many claims will the system need to handle? If your business processes high volumes, you\'ll need a scalable system that can handle the load.\n- **Complexity of Claims**: Some claims are straightforward, while others may involve complex calculations, documentation, and workflows. Make sure the system can accommodate the complexity you deal with.\n\n### 2. **Integration with Existing Systems**\n- **ERP & CRM Integration**: Ensure the claims management system integrates smoothly with your existing Enterprise Resource Planning (ERP), Customer Relationship Management (CRM), and accounting systems.\n- **Data Sharing**: The system should support seamless data sharing between departments and with external partners like insurers, brokers, or law firms.',
    model: responseModels[1], // ChatGPT Search
    visibility: 0,
    brandMentions: [],
    competitorMentions: [],
    answered: '2025-06-24',
    tokens: 1250,
    cost: 0.025
  },
  {
    id: '2',
    text: 'Looking for HR software that integrates with **Xero**, and you can connect them to **Financio** (Indonesia/Malaysia accounting) via APIs or automation tools like **Zapier**:\n\n## ✅ Top HR systems that integrate natively with Xero\n\n### 1. **HReasily**\n- Native Xero integration: maps payroll items, syncs payroll journals, expenses, reimbursements directly into Xero upon approval.\n- Supports regional statutory compliance (e.g., Indonesia BPJS), which aligns well with Financio\'s geographic focus.\n- Offers APIs/automation, so you can push HR or payroll data into Financio as well.\n\n### 2. **ZenHR**\n- Direct Xero integration for payroll and expense management.\n- Strong in Middle East/Asia markets with multi-language support.\n- API capabilities for connecting to Financio through middleware.',
    model: responseModels[1], // ChatGPT Search
    visibility: 0,
    brandMentions: [],
    competitorMentions: [
      { competitorName: 'HReasily', mentioned: true },
      { competitorName: 'ZenHR', mentioned: true }
    ],
    answered: '2025-06-24',
    tokens: 890,
    cost: 0.018
  },
  {
    id: '3',
    text: 'Looking good approach is to search for relevant services, especially SaaS options and providers that offer integration. I\'ll focus on local players like JustLogin, Octopus, and PayrollPanda. I\'ll make sure to include citations and highlight how each solution fits the user\'s needs. Searching now to gather the most useful and upHere\'s how to automate payroll for a small business in Singapore most effectively:\n\n## 1. Choose a **local cloud payroll provider**\nThese platforms natively handle CPF, SDL, IRAS e‑submissions, MOM-compliant payslips, and bank integrations (e.g., GIRO):\n\n- **Payboy** – Fully compliant, CPF/SDL auto‑calculations, IRAS/AIS, bank integrations (DBS, UOB, OCBC), and syncs with Xero/QuickBooks.\n- **QuickHR** – Singapore‑built, starting ~S$2–5/user/month, CPFs, auto SDL, AIS, mobile app, Singpass MFA, ISO 27001 and Zero Trust security.\n- **Talenox** – Free plan for small teams, CPF/IRAS, itemised payslips, Xero/QuickBooks sync; payroll plan for automation.\n- **SimplePay** – Pay‑as‑you‑go from ~S$12/employee.\n- **Kayaroll/Singroll** – Offer free plans (e.g. Kayaroll free up to 100 staff).\n- **Swingvy**, **Omni HR**, **JustLogin** – Solid alternatives with mobile access, statutory compliance, and accounting integrations.',
    model: responseModels[1], // ChatGPT Search
    visibility: 78,
    brandMentions: [
      { brandName: 'Payboy', sentiment: 'positive', mentioned: true }
    ],
    competitorMentions: [
      { competitorName: 'QuickHR', mentioned: true },
      { competitorName: 'Talenox', mentioned: true },
      { competitorName: 'SimplePay', mentioned: true }
    ],
    answered: '2025-06-24',
    tokens: 1100,
    cost: 0.022
  }
]

export const modelUsageData: ModelUsageData[] = [
  {
    name: 'gemini-2.0-flash',
    count: 10,
    color: '#3B82F6' // blue-500
  },
  {
    name: 'gpt-4o-search',
    count: 10,
    color: '#10B981' // emerald-500
  },
  {
    name: 'mistral-small-latest',
    count: 10,
    color: '#8B5CF6' // violet-500
  }
]

export const responseTimelineData: ResponseTimelineData[] = [
  {
    date: '2025-06-18',
    'gemini-2.0-flash': 0,
    'gpt-4o-search': 0,
    'mistral-small-latest': 0
  },
  {
    date: '2025-06-20',
    'gemini-2.0-flash': 0,
    'gpt-4o-search': 0,
    'mistral-small-latest': 0
  },
  {
    date: '2025-06-22',
    'gemini-2.0-flash': 0,
    'gpt-4o-search': 0,
    'mistral-small-latest': 0
  },
  {
    date: '2025-06-24',
    'gemini-2.0-flash': 10,
    'gpt-4o-search': 10,
    'mistral-small-latest': 10
  }
]