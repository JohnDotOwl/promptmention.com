import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useForm, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { FormEvent, useEffect } from 'react';
import { usePartialReloadPolling } from '@/hooks/use-smart-polling';

interface Step3Props {
    progress: {
        company_description?: string;
        industry?: string;
        website_analysis?: {
            title?: string;
            description?: string;
            industry?: string;
        };
    };
    currentStep: number;
    domainAnalysis?: {
        status: 'not_started' | 'pending' | 'processing' | 'completed' | 'failed';
        message: string;
        data?: {
            summary: string;
            industry: string;
            keywords: string[];
            competitors: string[];
            company_name: string;
            website: string;
            analysis_data: any;
            processed_at: string;
        };
    };
}

export default function Step3({ progress, currentStep, domainAnalysis }: Step3Props) {
    const { post, processing } = useForm();

    // Smart polling for domain analysis updates
    const analysisPolling = usePartialReloadPolling(['domainAnalysis'], {
        interval: 5000,
        priority: 'high', // High priority for onboarding flow
        pauseWhenHidden: false, // Keep polling even when tab is hidden during onboarding
        maxFailures: 10, // Allow more retries during analysis
        shouldPoll: () => {
            return domainAnalysis?.status === 'pending' || domainAnalysis?.status === 'processing';
        }
    });

    // Start/stop polling based on analysis status
    useEffect(() => {
        const needsPolling = domainAnalysis?.status === 'pending' || domainAnalysis?.status === 'processing';
        
        if (needsPolling && !analysisPolling.isPolling) {
            analysisPolling.startPartialPolling();
        } else if (!needsPolling && analysisPolling.isPolling) {
            analysisPolling.stopPolling();
        }

        return () => {
            analysisPolling.stopPolling();
        };
    }, [domainAnalysis?.status, analysisPolling]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/onboarding/complete');
    };

    const handleBack = () => {
        router.visit('/onboarding/step/2');
    };

    const getStatusIcon = () => {
        switch (domainAnalysis?.status) {
            case 'pending':
            case 'processing':
                return <Loader2 className="h-4 w-4 animate-spin" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'failed':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Loader2 className="h-4 w-4 animate-spin" />;
        }
    };

    const getStatusBadge = () => {
        switch (domainAnalysis?.status) {
            case 'pending':
                return <Badge variant="secondary">Analyzing...</Badge>;
            case 'processing':
                return <Badge variant="secondary">Processing...</Badge>;
            case 'completed':
                return <Badge variant="default">Analysis Complete</Badge>;
            case 'failed':
                return <Badge variant="destructive">Analysis Failed</Badge>;
            default:
                return <Badge variant="secondary">Preparing...</Badge>;
        }
    };

    return (
        <OnboardingLayout 
            currentStep={currentStep}
            title="Company Analysis"
            description="Here's what we discovered about your company from our AI-powered analysis."
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <fieldset className="relative space-y-4">
                    <div className="relative">
                        <div className="space-y-6">
                            {/* Status Header */}
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon()}
                                    <span className="font-medium">Analysis Status</span>
                                </div>
                                {getStatusBadge()}
                            </div>

                            {domainAnalysis?.status === 'completed' && domainAnalysis.data ? (
                                <>
                                    {/* Company Summary */}
                                    <div data-slot="form-item" className="grid gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="summary" className="text-base font-semibold">Company Story</Label>
                                            <p className="text-muted-foreground text-sm">
                                                AI-powered analysis of your company's mission, services, and market position.
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/30">
                                            <div 
                                                className="text-sm leading-relaxed text-foreground whitespace-pre-wrap"
                                                style={{ lineHeight: '1.6' }}
                                            >
                                                {domainAnalysis.data.summary || 'No summary available'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Industry */}
                                    <div data-slot="form-item" className="grid gap-2">
                                        <Label htmlFor="industry">Industry</Label>
                                        <input
                                            id="industry"
                                            type="text"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pointer-events-none"
                                            value={domainAnalysis.data.industry || 'Not specified'}
                                            readOnly
                                        />
                                    </div>

                                    {/* Keywords */}
                                    {domainAnalysis.data.keywords && Array.isArray(domainAnalysis.data.keywords) && domainAnalysis.data.keywords.length > 0 && (
                                        <div data-slot="form-item" className="grid gap-2">
                                            <Label>Key Business Areas</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {domainAnalysis.data.keywords.slice(0, 8).map((keyword, index) => (
                                                    <Badge key={index} variant="outline">{keyword}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Competitors */}
                                    {domainAnalysis.data.competitors && Array.isArray(domainAnalysis.data.competitors) && domainAnalysis.data.competitors.length > 0 && (
                                        <div data-slot="form-item" className="grid gap-2">
                                            <Label>Identified Competitors</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {domainAnalysis.data.competitors.slice(0, 5).map((competitor, index) => (
                                                    <Badge key={index} variant="secondary">{competitor}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Modification Notice */}
                                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                                    You can modify this information later
                                                </p>
                                                <p className="text-blue-700 dark:text-blue-300">
                                                    This analysis was generated by AI and can be updated anytime in your dashboard settings. You can edit company details, add or remove competitors, and refine your industry classification as needed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : domainAnalysis?.status === 'failed' ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {domainAnalysis.message}
                                    </p>
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.reload({ only: ['domainAnalysis'] })}
                                    >
                                        Retry Analysis
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                                    <h3 className="text-lg font-semibold mb-2">Analyzing Your Company</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Our AI is analyzing your website and company information. This usually takes 30-60 seconds.
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Button 
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.reload({ only: ['domainAnalysis'] })}
                                        >
                                            Refresh Status
                                        </Button>
                                        <Button 
                                            type="button"
                                            variant="default"
                                            onClick={() => {
                                                post('/onboarding/retry-analysis', {}, {
                                                    onSuccess: () => {
                                                        router.reload({ only: ['domainAnalysis'] });
                                                    }
                                                });
                                            }}
                                        >
                                            Retry Analysis
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </fieldset>
                
                <div className="mt-2 flex flex-row-reverse justify-between sticky bottom-0 bg-white dark:bg-gray-800 z-30 border-t py-4 -mx-5 px-5 -mb-4 rounded-b-xl">
                    <Button 
                        type="submit" 
                        disabled={processing || domainAnalysis?.status !== 'completed'}
                        className="ml-auto"
                    >
                        Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleBack}
                        className="mr-auto"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>
            </form>
        </OnboardingLayout>
    );
}