import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, GlobeIcon, HashIcon, PercentIcon, MessageSquareIcon, TargetIcon, BotIcon, ThumbsUpIcon, ThumbsDownIcon, MinusIcon, ShuffleIcon } from "lucide-react";
import { format } from "date-fns";

import { type Prompt } from '@/types/prompt'

interface PromptDetailDialogProps {
    prompt: Prompt | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PromptDetailDialog({ prompt, open, onOpenChange }: PromptDetailDialogProps) {
    if (!prompt) return null;

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
            case 'positive': return <ThumbsUpIcon className="h-3 w-3" />;
            case 'negative': return <ThumbsDownIcon className="h-3 w-3" />;
            case 'neutral': return <MinusIcon className="h-3 w-3" />;
            case 'mixed': return <ShuffleIcon className="h-3 w-3" />;
            default: return <MinusIcon className="h-3 w-3" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Prompt Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Prompt Text */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <MessageSquareIcon className="h-4 w-4" />
                                Prompt Text
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {prompt.text}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Classifications */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium">Type & Intent</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Type</span>
                                <Badge className={`${typeColors[prompt.type]} text-white`}>
                                    {prompt.type.replace('-', ' ')}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Intent</span>
                                <Badge className={`${intentColors[prompt.intent]} text-white`}>
                                    {prompt.intent}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <TargetIcon className="h-4 w-4" />
                                Performance Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <HashIcon className="h-3 w-3" />
                                        Response Count
                                    </span>
                                    <span className="text-sm font-medium">{prompt.responseCount}</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <PercentIcon className="h-3 w-3" />
                                        Visibility
                                    </span>
                                    <span className="text-sm font-medium">{prompt.visibility}%</span>
                                </div>
                                <Progress value={prompt.visibility} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium">Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <GlobeIcon className="h-3 w-3" />
                                    Language
                                </span>
                                <span className="text-sm font-medium">{prompt.language.name} ({prompt.language.code.toUpperCase()})</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Monitor</span>
                                <span className="text-sm font-medium">{prompt.monitor.name}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    Created
                                </span>
                                <span className="text-sm font-medium">
                                    {format(new Date(prompt.created), 'PPp')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Responses */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <BotIcon className="h-4 w-4" />
                                AI Responses ({prompt.responses?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {prompt.responses && prompt.responses.length > 0 ? (
                                <div className="space-y-4">
                                    {prompt.responses.map((response) => (
                                        <div key={response.id} className="border rounded-lg p-4 space-y-3">
                                            {/* Response Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {response.model_name}
                                                    </Badge>
                                                    {response.brand_mentioned && (
                                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                                            Brand Mentioned
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    {response.sentiment && (
                                                        <div className={`flex items-center gap-1 ${sentimentColors[response.sentiment]}`}>
                                                            {getSentimentIcon(response.sentiment)}
                                                            <span className="capitalize">{response.sentiment}</span>
                                                        </div>
                                                    )}
                                                    <span>{format(new Date(response.created_at), 'MMM d, HH:mm')}</span>
                                                </div>
                                            </div>

                                            {/* Response Text */}
                                            <div>
                                                <div 
                                                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: response.response_text }}
                                                />
                                            </div>

                                            {/* Response Metrics */}
                                            {response.visibility_score > 0 && (
                                                <div className="pt-2 border-t">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">Visibility Score:</span>
                                                        <Progress value={response.visibility_score} className="h-1 flex-1" />
                                                        <span className="text-xs font-medium">{response.visibility_score}%</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Competitors & Citations */}
                                            {(response.competitors_mentioned.length > 0 || response.citation_sources.length > 0) && (
                                                <div className="pt-2 border-t space-y-2">
                                                    {response.competitors_mentioned.length > 0 && (
                                                        <div>
                                                            <span className="text-xs text-muted-foreground">Competitors mentioned: </span>
                                                            <span className="text-xs">{response.competitors_mentioned.join(', ')}</span>
                                                        </div>
                                                    )}
                                                    {response.citation_sources.length > 0 && (
                                                        <div>
                                                            <span className="text-xs text-muted-foreground">Sources: </span>
                                                            <span className="text-xs">{response.citation_sources.join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <BotIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No AI responses yet</p>
                                    <p className="text-xs mt-1">Responses will appear here once AI models test this prompt</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}