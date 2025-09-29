import { type Monitor } from '@/types/monitor'

const generateChartData = (baseValue: number, variance: number = 0.3) => {
  const data = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Create some variation in data, with recent spike
    let value = baseValue
    if (i < 7) { // Last week has activity
      value = baseValue + (Math.random() * variance * baseValue)
    } else {
      value = baseValue * (0.1 + Math.random() * 0.2)
    }
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      value: Math.round(value)
    })
  }
  
  return data
}

export const mockMonitors: Monitor[] = [
  {
    id: '2b7bc04e-d65a-443f-8a1a-a46ea02d30c9',
    name: 'Demo Monitor',
    website: {
      name: 'Acme Corp',
      url: 'acme.com'
    },
    status: 'active',
    lastUpdated: '44 minutes ago',
    createdAt: 'Jun 24, 2025',
    stats: {
      visibilityScore: 43,
      totalPrompts: 10,
      totalResponses: 30,
      mentions: 32,
      avgCitationRank: 5.0,
      visibilityData: generateChartData(43),
      mentionsData: generateChartData(32),
      citationData: generateChartData(5)
    },
    models: [
      {
        id: 'chatgpt-search',
        name: 'ChatGPT Search',
        icon: '/llm-icons/openai.svg'
      },
      {
        id: 'mistral-small',
        name: 'Mistral Small',
        icon: '/llm-icons/mistral.svg'
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        icon: '/llm-icons/google.svg'
      }
    ]
  },
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    name: 'Competitor Analysis',
    website: {
      name: 'TechStart Inc',
      url: 'techstart.io'
    },
    status: 'active',
    lastUpdated: '2 hours ago',
    createdAt: 'Jun 23, 2025',
    stats: {
      visibilityScore: 67,
      totalPrompts: 25,
      totalResponses: 78,
      mentions: 45,
      avgCitationRank: 3.2,
      visibilityData: generateChartData(67),
      mentionsData: generateChartData(45),
      citationData: generateChartData(3.2)
    },
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        icon: '/llm-icons/openai.svg'
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        icon: '/llm-icons/anthropic.svg'
      }
    ]
  },
  {
    id: 'f7e8d9c0-b1a2-3456-7890-123456789abc',
    name: 'Brand Sentiment Monitor',
    website: {
      name: 'GreenTech Solutions',
      url: 'greentech.com'
    },
    status: 'inactive',
    lastUpdated: '1 day ago',
    createdAt: 'Jun 20, 2025',
    stats: {
      visibilityScore: 28,
      totalPrompts: 8,
      totalResponses: 15,
      mentions: 12,
      avgCitationRank: 7.8,
      visibilityData: generateChartData(28),
      mentionsData: generateChartData(12),
      citationData: generateChartData(7.8)
    },
    models: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        icon: '/llm-icons/google.svg'
      }
    ]
  }
]