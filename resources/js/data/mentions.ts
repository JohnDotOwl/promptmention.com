import { type Mention, type MentionModel } from '@/types/mention'

const mentionModels: MentionModel[] = [
  {
    id: 'chatgpt-search',
    name: 'ChatGPT Search',
    icon: '/llm-icons/openai.svg',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    icon: '/llm-icons/openai.svg',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    icon: '/llm-icons/anthropic.svg',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    icon: '/llm-icons/google.svg',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    icon: '/llm-icons/mistral.svg',
    color: 'bg-red-100 text-red-800'
  }
]

const sampleDomains = [
  'reddit.com',
  'en.wikipedia.org',
  'businessinsider.com',
  'investopedia.com',
  'wsj.com',
  'theverge.com',
  'elevatodigital.com',
  'wired.com',
  'webtrafficexchange.com',
  'prosperops.com',
  'ft.com',
  'minovateck.com',
  'techcrunch.com',
  'github.com',
  'stackoverflow.com',
  'medium.com',
  'forbes.com',
  'bloomberg.com',
  'reuters.com',
  'cnbc.com',
  'venturebeat.com',
  'techradar.com',
  'arstechnica.com',
  'zdnet.com',
  'engadget.com',
  'thenextweb.com',
  'mashable.com',
  'digitaltrends.com',
  'gizmodo.com',
  'lifehacker.com',
  'fastcompany.com',
  'inc.com',
  'entrepreneur.com',
  'fortune.com',
  'hbr.org',
  'slashdot.org',
  'hackernews.com',
  'producthunt.com',
  'dev.to',
  'freecodecamp.org',
  'css-tricks.com',
  'smashingmagazine.com',
  'alistapart.com',
  'sitepoint.com',
  'scotch.io',
  'codrops.com',
  'designmodo.com',
  'webdesignerdepot.com',
  'speckyboy.com',
  'noupe.com',
  'hongkiat.com',
  'onextrapixel.com',
  'line25.com',
  'instantshift.com',
  'webresourcesdepot.com',
  'designshack.net',
  'webappers.com',
  'tutorialzine.com',
  'tympanus.net',
  'paulirish.com',
  'davidwalsh.name',
  'addyosmani.com',
  'toddmotto.com',
  'ponyfoo.com',
  'bitsofco.de',
  'joshwcomeau.com',
  'kentcdodds.com',
  'wesbos.com',
  'css-weekly.com',
  'javascriptweekly.com',
  'frontendfoc.us',
  'reactnewsletter.com',
  'vuejsweekly.com',
  'angular.io',
  'react.dev',
  'vuejs.org',
  'svelte.dev',
  'nextjs.org',
  'nuxtjs.org',
  'gatsby.org',
  'gridsome.org',
  'vuepress.vuejs.org',
  'docusaurus.io',
  'eleventy.dev',
  'jekyllrb.com',
  'gohugo.io',
  'hexo.io',
  'metalsmith.io',
  'wintersmith.io',
  'assemble.io'
]

const generateRandomDate = (daysBack: number = 30): string => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short', 
    day: '2-digit' 
  })
}

const sampleTitles = [
  'AI Revolution in 2025: What\'s Next for Machine Learning',
  'Machine Learning Breakthrough: New Algorithm Changes Everything',
  'Startup Funding Trends: How AI Companies Are Raising Capital',
  'Tech Industry Analysis: The Rise of Artificial Intelligence',
  'AI is core to JPMorgan\'s $18 billion tech investment. Here\'s what its execs revealed about how it\'s reshaping the bank.',
  'Robotic process automation',
  'Build or buy? Legal teams split on how to exploit AI',
  'How healthcare facilities can prepare their data for AI-assisted contract management',
  '7 SEO Pro Tips to Boost Your Website Traffic in 2025',
  'The Future of Cloud Computing: Trends and Predictions',
  'Cybersecurity in the Age of AI: New Threats and Solutions',
  'Understanding Blockchain: Beyond Cryptocurrency',
  'The Impact of 5G on Business Innovation',
  'Digital Transformation: A Guide for Traditional Businesses',
  'Remote Work Technologies: What\'s Next?',
  'The Ethics of AI: Navigating the Moral Landscape',
  'Quantum Computing: From Theory to Practice',
  'Green Tech: Sustainable Solutions for the Future',
  'The Evolution of E-commerce: Trends for 2025',
  'Data Privacy in the Digital Age: What You Need to Know',
  'The Rise of No-Code Platforms: Democratizing Development',
  'Edge Computing: Bringing Processing Power Closer',
  'Augmented Reality in Business: Practical Applications',
  'The Future of Work: AI and Human Collaboration',
  'IoT Security: Protecting Connected Devices',
  'Cloud-Native Architecture: Best Practices',
  'The State of DevOps in 2025',
  'Microservices vs Monoliths: Making the Right Choice',
  'API-First Development: A Modern Approach',
  'The Role of AI in Customer Experience',
  'Building Resilient Systems: Lessons from the Field',
  'Open Source Software: The Business Case',
  'Tech Debt: Strategies for Management and Reduction',
  'The Future of Programming Languages',
  'Serverless Architecture: Benefits and Challenges'
]

const generateMentionUrl = (domain: string): string => {
  const paths = [
    '/articles/',
    '/blog/',
    '/news/',
    '/posts/',
    '/reviews/',
    '/guides/',
    '/tutorials/',
    '/discussions/',
    ''
  ]
  const slugs = [
    'ai-revolution-2025',
    'machine-learning-breakthrough',
    'startup-funding-trends',
    'tech-industry-analysis',
    'software-development-tips',
    'product-management-guide',
    'digital-transformation',
    'innovation-spotlight',
    'best-practices-2025',
    'emerging-technologies'
  ]
  
  const path = paths[Math.floor(Math.random() * paths.length)]
  const slug = slugs[Math.floor(Math.random() * slugs.length)]
  
  return `https://${domain}${path}${slug}`
}

const generatePageTitle = (): string => {
  // All mentions will have titles for consistency
  return sampleTitles[Math.floor(Math.random() * sampleTitles.length)]
}

export const mockMentions: Mention[] = Array.from({ length: 129 }, (_, index) => {
  const domain = sampleDomains[Math.floor(Math.random() * sampleDomains.length)]
  const model = mentionModels[Math.floor(Math.random() * mentionModels.length)]
  
  // Generate realistic DR based on domain reputation
  let baseDR = 30
  if (['techcrunch.com', 'github.com', 'stackoverflow.com', 'forbes.com', 'wired.com', 'wsj.com', 'ft.com', 'bloomberg.com', 'reuters.com', 'en.wikipedia.org'].includes(domain)) {
    baseDR = 85
  } else if (['medium.com', 'reddit.com', 'linkedin.com', 'theverge.com', 'businessinsider.com', 'investopedia.com', 'cnbc.com', 'venturebeat.com'].includes(domain)) {
    baseDR = 70
  } else if (['dev.to', 'producthunt.com', 'indiehackers.com', 'smashingmagazine.com', 'css-tricks.com', 'freecodecamp.org'].includes(domain)) {
    baseDR = 55
  } else if (['angular.io', 'react.dev', 'vuejs.org', 'svelte.dev', 'nextjs.org', 'nuxtjs.org'].includes(domain)) {
    baseDR = 75
  }
  
  const domainRating = Math.min(100, baseDR + Math.floor(Math.random() * 15) - 7)
  const pageRank = Math.min(100, Math.max(0, domainRating + Math.floor(Math.random() * 20) - 10))
  
  return {
    id: `mention-${index + 1}`,
    domain,
    url: generateMentionUrl(domain),
    title: generatePageTitle(),
    domainRating,
    pageRank,
    position: Math.floor(Math.random() * 20) + 1,
    estimatedTraffic: Math.random() > 0.3 ? Math.floor(Math.random() * 50000) + 1000 : null,
    model,
    firstSeen: generateRandomDate(90), // Last 90 days
    isExternal: true
  }
}).sort((a, b) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime())

export { mentionModels }