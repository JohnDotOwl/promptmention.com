import { FormEventHandler } from 'react'
import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Textarea component not available, using div instead
import { Checkbox } from '@/components/ui/checkbox'
import { Bot } from 'lucide-react'
import { Link } from '@inertiajs/react'
import { PageSubHeader } from '@/components/ui/page-sub-header'
import { PageContent } from '@/components/ui/page-content'
import type { BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Brand Monitors',
    href: '/monitors',
  },
  {
    title: 'Create Monitor',
    href: '/monitors/create',
  },
]

const AI_MODELS = [
  {
    id: 'chatgpt-search',
    name: 'ChatGPT Search',
    icon: '/llm-icons/openai.svg',
    description: 'OpenAI\'s ChatGPT with search capabilities'
  },
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    icon: '/llm-icons/gemini.svg',
    description: 'Google\'s latest fast multimodal AI model'
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    icon: '/llm-icons/mistral.svg',
    description: 'Mistral AI\'s efficient language model'
  }
]

export default function CreateMonitor() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    website_name: '',
    website_url: '',
    description: '',
    ai_models: ['chatgpt-search', 'gemini-2-flash', 'mistral-small'] as string[]
  })

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route('monitors.store'))
  }

  const handleModelToggle = (modelId: string, checked: boolean) => {
    if (checked) {
      setData('ai_models', [...data.ai_models, modelId])
    } else {
      setData('ai_models', data.ai_models.filter(id => id !== modelId))
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Brand Monitor" />
      
      <div className="min-h-[100vh] flex-1 md:min-h-min">
        {/* Page Sub-Header with visual separation */}
        <PageSubHeader
          title="Create Brand Monitor"
          description="Set up monitoring for your brand across AI platforms"
        />

        {/* Page Content */}
        <div className="relative z-10 py-6">
          <PageContent centered={true}>
            <Card>
              <CardHeader>
                <CardTitle>Monitor Details</CardTitle>
                <CardDescription>
                  Configure your brand monitor to track visibility across AI language models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Monitor Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Monitor Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="e.g. Pay Boy Brand Monitor"
                      required
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  {/* Website Name */}
                  <div className="space-y-2">
                    <Label htmlFor="website_name">Website/Company Name</Label>
                    <Input
                      id="website_name"
                      type="text"
                      value={data.website_name}
                      onChange={(e) => setData('website_name', e.target.value)}
                      placeholder="e.g. Pay Boy"
                      required
                    />
                    {errors.website_name && <p className="text-sm text-red-500">{errors.website_name}</p>}
                  </div>

                  {/* Website URL */}
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={data.website_url}
                      onChange={(e) => setData('website_url', e.target.value)}
                      placeholder="https://example.com"
                      required
                    />
                    {errors.website_url && <p className="text-sm text-red-500">{errors.website_url}</p>}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Brief description of what this monitor tracks..."
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  </div>

                  {/* AI Models Selection */}
                  <div className="space-y-4">
                    <div>
                      <Label>AI Models to Monitor</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select which AI models you want to monitor for brand visibility
                      </p>
                    </div>

                    <div className="space-y-3">
                      {AI_MODELS.map((model) => (
                        <div key={model.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <Checkbox
                            id={model.id}
                            checked={data.ai_models.includes(model.id)}
                            onCheckedChange={(checked) => handleModelToggle(model.id, checked as boolean)}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <Bot className="h-4 w-4 text-muted-foreground" />
                              <Label htmlFor={model.id} className="text-sm font-medium">
                                {model.name}
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {model.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {errors.ai_models && <p className="text-sm text-red-500">{errors.ai_models}</p>}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <Link href="/monitors">
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Creating...' : 'Create Monitor'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </PageContent>

          </div>
      </div>
    </AppLayout>
  )
}