import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  ZapIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { type Prompt, type Response } from '@/types/prompt';

interface PageProps {
  prompt: Prompt;
}

export default function Show({ prompt }: PageProps) {
  const typeColors = {
    'brand-specific': "bg-purple-500",
    organic: "bg-green-500",
    competitor: "bg-orange-500"
  };

  const intentColors = {
    informational: "bg-cyan-500",
    commercial: "bg-pink-500"
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
    const cost = Number(response.cost) || 0;
    return sum + cost;
  }, 0) || 0;
  
  const totalTokens = prompt.responses?.reduce((sum, response) => {
    const tokens = Number(response.tokens_used) || 0;
    return sum + tokens;
  }, 0) || 0;
  
  const avgVisibilityScore = prompt.responses?.length > 0 
    ? prompt.responses.reduce((sum, response) => {
        const score = Number(response.visibility_score) || 0;
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
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link href="/prompts">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Prompts
                </Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className={`${typeColors[prompt.type]} text-white`}>
                  {prompt.type.replace('-', ' ')}
                </Badge>
                <Badge className={`${intentColors[prompt.intent]} text-white`}>
                  {prompt.intent}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {prompt.language.flag} {prompt.language.name}
                </span>
              </div>
              
              <h1 className="text-2xl font-bold leading-relaxed">{prompt.text || 'Untitled Prompt'}</h1>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Created {format(new Date(prompt.created), 'PPp')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GlobeIcon className="h-4 w-4" />
                  <Link 
                    href={`/monitors/${prompt.monitor.id}`}
                    className="hover:text-primary"
                  >
                    {prompt.monitor.name}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Responses</p>
                  <p className="text-2xl font-bold">{prompt.responseCount}</p>
                </div>
                <BotIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Visibility</p>
                  <p className="text-2xl font-bold">{Number(avgVisibilityScore).toFixed(1)}%</p>
                </div>
                <TargetIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                  <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
                </div>
                <ZapIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">${Number(totalCost).toFixed(4)}</p>
                </div>
                <DollarSignIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Responses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BotIcon className="h-5 w-5" />
              AI Model Responses ({prompt.responses?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prompt.responses && Array.isArray(prompt.responses) && prompt.responses.length > 0 ? (
              <div className="space-y-6">
                {prompt.responses.map((response, index) => (
                  <div key={response.id} className={`border rounded-lg p-6 space-y-4 ${index > 0 ? 'border-t-2' : ''}`}>
                    {/* Response Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            {response.model_name}
                          </Badge>
                          {response.brand_mentioned && (
                            <Badge className="bg-green-100 text-green-800">
                              Brand Mentioned
                            </Badge>
                          )}
                          {response.sentiment && (
                            <div className={`flex items-center gap-1 ${sentimentColors[response.sentiment]}`}>
                              {getSentimentIcon(response.sentiment)}
                              <span className="text-sm font-medium capitalize">{response.sentiment}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{format(new Date(response.created_at), 'MMM d, yyyy HH:mm')}</span>
                          {Number(response.tokens_used) > 0 && (
                            <span>{Number(response.tokens_used).toLocaleString()} tokens</span>
                          )}
                          {Number(response.cost) > 0 && (
                            <span>${Number(response.cost).toFixed(4)}</span>
                          )}
                        </div>
                      </div>
                      
                      {Number(response.visibility_score) > 0 && (
                        <div className="text-right">
                          <div className="text-sm font-medium">{Number(response.visibility_score).toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Visibility</div>
                        </div>
                      )}
                    </div>

                    {/* Response Text */}
                    <div className="bg-gray-50 rounded-md p-4">
                      <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {response.response_text}
                      </p>
                    </div>

                    {/* Additional Response Data */}
                    {((Array.isArray(response.competitors_mentioned) && response.competitors_mentioned.length > 0) || 
                     (Array.isArray(response.citation_sources) && response.citation_sources.length > 0)) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        {Array.isArray(response.competitors_mentioned) && response.competitors_mentioned.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Competitors Mentioned</h4>
                            <div className="flex flex-wrap gap-1">
                              {response.competitors_mentioned.map((competitor, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {competitor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {Array.isArray(response.citation_sources) && response.citation_sources.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Citation Sources</h4>
                            <div className="flex flex-wrap gap-1">
                              {response.citation_sources.map((source, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BotIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No AI responses yet</h3>
                <p className="text-sm">This prompt hasn't been tested with AI models yet. Responses will appear here once testing begins.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prompt Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareIcon className="h-5 w-5" />
              Prompt Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Classification</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Type</span>
                      <Badge className={`${typeColors[prompt.type]} text-white`}>
                        {prompt.type.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Intent</span>
                      <Badge className={`${intentColors[prompt.intent]} text-white`}>
                        {prompt.intent}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Language</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{prompt.language.flag}</span>
                    <span className="text-sm">{prompt.language.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {prompt.language.code.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Monitor</h4>
                  <div className="space-y-1">
                    <Link 
                      href={`/monitors/${prompt.monitor.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {prompt.monitor.name}
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GlobeIcon className="h-3 w-3" />
                      <a 
                        href={prompt.monitor.website.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        {prompt.monitor.website.name}
                      </a>
                      <ExternalLinkIcon className="h-3 w-3" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Timestamps</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Created: {format(new Date(prompt.created), 'PPp')}</div>
                    {prompt.updated && (
                      <div>Updated: {format(new Date(prompt.updated), 'PPp')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}