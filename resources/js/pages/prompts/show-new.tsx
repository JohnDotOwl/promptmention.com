
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  GlobeIcon, 
  HashIcon, 
  PercentIcon, 
  MessageSquareIcon, 
  TargetIcon, 
  BotIcon, 
  ThumbsUpIcon, 
  ThumbsDownIcon, 
  MinusIcon, 
  ShuffleIcon,
  ExternalLinkIcon,
  CopyIcon,
  DollarSignIcon,
  ZapIcon,
  InfoIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { type Prompt, type Response } from '@/types/prompt';

interface PageProps {
  prompt: Prompt;
}

export default function ShowNew({ prompt }: PageProps) {
  const typeColors = {
    'brand-specific': "bg-purple-500 hover:bg-purple-600",
    organic: "bg-green-500 hover:bg-green-600",
    competitor: "bg-orange-500 hover:bg-orange-600"
  };

  const intentColors = {
    informational: "bg-cyan-500 hover:bg-cyan-600",
    commercial: "bg-pink-500 hover:bg-pink-600"
  };

  const sentimentColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
    mixed: "text-yellow-600"
  };

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUpIcon className="h-4 w-4" />;
      case 'negative': return <ThumbsDownIcon className="h-4 w-4" />;
      case 'neutral': return <MinusIcon className="h-4 w-4" />;
      case 'mixed': return <ShuffleIcon className="h-4 w-4" />;
      default: return <MinusIcon className="h-4 w-4" />;
    }
  };

  const totalCost = prompt.responses?.reduce((sum, response) => {
    const cost = Number(response?.cost) || 0;
    return sum + cost;
  }, 0) || 0;
  
  const totalTokens = prompt.responses?.reduce((sum, response) => {
    const tokens = Number(response?.tokens_used) || 0;
    return sum + tokens;
  }, 0) || 0;
  
  const avgVisibilityScore = prompt.responses?.length > 0 
    ? prompt.responses.reduce((sum, response) => {
        const score = Number(response?.visibility_score) || 0;
        return sum + score;
      }, 0) / prompt.responses.length
    : 0;

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Prompts', href: '/prompts' },
    { label: (prompt.text || 'Untitled Prompt').length > 50 ? (prompt.text || 'Untitled Prompt').substring(0, 50) + '...' : (prompt.text || 'Untitled Prompt'), href: undefined }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbItems}>
      <Head title={`Prompt: ${(prompt.text || 'Untitled Prompt').substring(0, 60)}${(prompt.text || 'Untitled Prompt').length > 60 ? '...' : ''}`} />
      
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-8">
          <div className="w-full md:w-2/3">
            <Link href="/prompts" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Prompts
            </Link>
            <h1 className="text-3xl font-bold tracking-tight leading-tight mb-3">{prompt.text || 'Untitled Prompt'}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                <span>Created {format(new Date(prompt.created), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GlobeIcon className="h-4 w-4" />
                <Link href={`/monitors/${prompt.monitor.id}`} className="hover:text-primary hover:underline">
                  {prompt.monitor.name}
                </Link>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex justify-start md:justify-end mt-4 md:mt-0">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(prompt.text || '')}>
              <CopyIcon className="h-4 w-4 mr-2" />
              Copy Prompt
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* Prompt Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <InfoIcon className="h-5 w-5" />
                  Prompt Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                  <Badge className={`${typeColors[prompt.type]} text-white text-xs`}>{prompt.type.replace('-', ' ')}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Intent</span>
                  <Badge className={`${intentColors[prompt.intent]} text-white text-xs`}>{prompt.intent}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Language</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{prompt.language.flag}</span>
                    <span className="text-sm">{prompt.language.name}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Responses</span>
                  <span className="text-sm font-bold">{prompt.responseCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Avg. Visibility</span>
                  <span className="text-sm font-bold">{Number(avgVisibilityScore).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Total Tokens</span>
                  <span className="text-sm font-bold">{totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Total Cost</span>
                  <span className="text-sm font-bold">${Number(totalCost).toFixed(4)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            {/* AI Responses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BotIcon className="h-5 w-5" />
                  AI Model Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prompt.responses && Array.isArray(prompt.responses) && prompt.responses.length > 0 ? (
                  <Tabs defaultValue={prompt.responses[0].id.toString()}>
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      {prompt.responses.map(response => (
                        <TabsTrigger key={response.id} value={response.id.toString()}>
                          {response.model_name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {prompt.responses.map(response => (
                      <TabsContent key={response.id} value={response.id.toString()}>
                        <div className="border rounded-lg p-6 space-y-4 bg-slate-50/50">
                          {/* Response Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                {response.brand_mentioned && (
                                  <Badge className="bg-green-100 text-green-800 border border-green-200">
                                    Brand Mentioned
                                  </Badge>
                                )}
                                {response.sentiment && (
                                  <div className={`flex items-center gap-1.5 ${sentimentColors[response.sentiment]}`}>
                                    {getSentimentIcon(response.sentiment)}
                                    <span className="text-sm font-medium capitalize">{response.sentiment}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{response.created_at ? format(new Date(response.created_at), 'MMM d, yyyy HH:mm') : 'Unknown date'}</span>
                                {Number(response?.tokens_used) > 0 && (
                                  <span>{Number(response.tokens_used).toLocaleString()} tokens</span>
                                )}
                                {Number(response?.cost) > 0 && (
                                  <span>${Number(response.cost).toFixed(4)}</span>
                                )}
                              </div>
                            </div>
                            {Number(response?.visibility_score) > 0 && (
                              <div className="text-right">
                                <div className="text-2xl font-bold">{Number(response.visibility_score).toFixed(1)}%</div>
                                <div className="text-xs text-muted-foreground">Visibility Score</div>
                              </div>
                            )}
                          </div>

                          {/* Response Text */}
                          <div 
                            className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: response?.response_text || 'No response text available' }}
                          />

                          {/* Additional Response Data */}
                          {((Array.isArray(response?.competitors_mentioned) && response.competitors_mentioned.length > 0) || 
                           (Array.isArray(response?.citation_sources) && response.citation_sources.length > 0)) && (
                            <div className="pt-4 border-t mt-4">
                              {Array.isArray(response?.competitors_mentioned) && response.competitors_mentioned.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Competitors Mentioned</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {response.competitors_mentioned.map((competitor, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {competitor || 'Unknown'}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {Array.isArray(response?.citation_sources) && response.citation_sources.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Citation Sources</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {response.citation_sources.map((source, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {typeof source === 'string' ? source : (source?.title || source?.url || 'Unknown source')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                    <BotIcon className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <h3 className="text-lg font-semibold mb-2">No AI responses yet</h3>
                    <p className="text-sm">This prompt hasn't been tested with AI models yet. Responses will appear here once testing begins.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
