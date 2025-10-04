import { type Prompt, type Monitor } from '@/types/prompt'

const demoMonitor: Monitor = {
  id: '2b7bc04e-d65a-443f-8a1a-a46ea02d30c9',
  name: 'Demo Monitor'
}

export const mockPrompts: Prompt[] = [
  {
    id: '1',
    text: 'can you compare google maps with apple maps for navigation?',
    type: 'competitor',
    intent: 'informational',
    responseCount: 6,
    visibility: 0,
    language: {
      code: 'en-US',
      name: 'English',
      flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg'
    },
    monitor: demoMonitor,
    responses: [],
    created: '2025-06-19'
  },
  {
    id: '2',
    text: "what's the difference between google ads and facebook ads?",
    type: 'competitor',
    intent: 'informational',
    responseCount: 6,
    visibility: 0,
    language: {
      code: 'en-US',
      name: 'English',
      flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg'
    },
    monitor: demoMonitor,
    responses: [],
    created: '2025-06-19'
  },
  {
    id: '3',
    text: 'is google workspace good for remote teams?',
    type: 'brand-specific',
    intent: 'commercial',
    responseCount: 6,
    visibility: 48,
    language: {
      code: 'en-US',
      name: 'English',
      flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg'
    },
    monitor: demoMonitor,
    responses: [],
    created: '2025-06-19'
  },
  {
    id: '4',
    text: 'should i choose google cloud or aws for my startup?',
    type: 'competitor',
    intent: 'commercial',
    responseCount: 6,
    visibility: 0,
    language: {
      code: 'en-US',
      name: 'English',
      flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg'
    },
    monitor: demoMonitor,
    responses: [],
    created: '2025-06-19'
  },
  {
    id: '5',
    text: "how does google's search engine algorithm work???",
    type: 'brand-specific',
    intent: 'informational',
    responseCount: 6,
    visibility: 0,
    language: {
      code: 'en-US',
      name: 'English',
      flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg'
    },
    monitor: demoMonitor,
    responses: [],
    created: '2025-06-19'
  },
  {
    id: '6',
    text: 'how can i get more targeted traffic to my online store?',
    type: 'organic',
    intent: 'informational',
    responseCount: 6,
    visibility: 0,
    language: {
      code: 'en-US',
      name: 'English',
      flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg'
    },
    monitor: demoMonitor,
    responses: [],
    created: '2025-06-19'
  },
  {
    id: '7',
    text: 'what are the top cloud computing platforms for small businesses?',
    type: 'organic',
    intent: 'commercial',
    responseCount: 6,
    visibility: 10,
    language: {
      code: 'en-US',
      name: 'English',
      flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg'
    },
    monitor: demoMonitor,
    responses: [],
    created: '2025-06-19'
  },
  {
    id: '8',
    text: 'how do i use ai to enhance my business processes?',
    type: 'organic',
    intent: 'informational',
    responseCount: 6,
    visibility: 0,
    language: {
      code: 'en-US',
      name: 'English',
      flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg'
    },
    monitor: demoMonitor,
    responses: [],
    created: '2025-06-19'
  },
  {
    id: '9',
    text: "what's the best way to organize my team's documents online?",
    type: 'organic',
    intent: 'informational',
    responseCount: 6,
    visibility: 0,
    language: {
      code: 'en-US',
      name: 'English',
      flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg'
    },
    monitor: demoMonitor,
    responses: [],
    created: '2025-06-19'
  },
  {
    id: '10',
    text: "how can i improve my website's visibility on search engines?",
    type: 'organic',
    intent: 'informational',
    responseCount: 6,
    visibility: 0,
    language: {
      code: 'en-US',
      name: 'English',
      flag: 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg'
    },
    monitor: demoMonitor,
    created: '2025-06-19'
  }
]