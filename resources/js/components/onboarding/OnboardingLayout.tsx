import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

interface OnboardingLayoutProps {
    children: ReactNode;
    currentStep: number;
    title: string;
    description: string;
}

export default function OnboardingLayout({ children, currentStep, title, description }: OnboardingLayoutProps) {
    const getProgressWidth = () => {
        switch (currentStep) {
            case 1: return 'w-full';
            case 2: return 'w-full';
            case 3: return 'w-full';
            default: return 'w-0';
        }
    };

    const getSecondProgressWidth = () => {
        switch (currentStep) {
            case 1: return 'w-0';
            case 2: return 'w-full';
            case 3: return 'w-full';
            default: return 'w-0';
        }
    };

    const getThirdProgressWidth = () => {
        switch (currentStep) {
            case 1: return 'w-0';
            case 2: return 'w-0';
            case 3: return 'w-full';
            default: return 'w-0';
        }
    };

    return (
        <>
            <Head title={title} />
            <div className="jsx-1738380030 antialiased __variable_5cfdac __variable_9a8899">
                <div className="">
                    <div className="absolute h-full w-full scale-[0.9] bg-[radial-gradient(#e5e7eb_1px,transparent_2px)] dark:bg-[radial-gradient(#374151_1px,transparent_2px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#fff_90%,transparent_100%)] dark:[mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#1f2937_90%,transparent_100%)]"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-50 dark:from-gray-900 dark:via-gray-800"></div>
                    <main className="relative z-10">
                        <div className="w-full max-w-lg mx-auto flex justify-center items-center flex-col py-16 gap-6">
                            <a className="flex flex-col items-center gap-1 self-center group" href="/">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                                        </svg>
                                    </div>
                                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                                        Prompt Mention
                                    </span>
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">
                                    AI-powered brand monitoring
                                </span>
                            </a>
                            
                            {/* Progress Indicator */}
                            <div className="mb-0 mt-4 flex items-center justify-between gap-2 w-full max-w-28 mx-auto bg-muted-foreground/10 p-2 rounded-full">
                                <div className="h-1.5 rounded-full bg-white dark:bg-gray-700 overflow-hidden transition-all duration-300 flex-1">
                                    <div className={`bg-primary h-full transition-all duration-300 ${getProgressWidth()}`}></div>
                                </div>
                                <div className="h-1.5 rounded-full bg-white dark:bg-gray-700 overflow-hidden transition-all duration-300 w-4">
                                    <div className={`bg-primary h-full transition-all duration-300 ${getSecondProgressWidth()}`}></div>
                                </div>
                                <div className="h-1.5 rounded-full bg-white dark:bg-gray-700 overflow-hidden transition-all duration-300 w-4">
                                    <div className={`bg-primary h-full transition-all duration-300 ${getThirdProgressWidth()}`}></div>
                                </div>
                            </div>

                            {/* Card */}
                            <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl shrink-0 ring-muted/60 border shadow-sm ring-3 w-full">
                                <div data-slot="card-header" className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-4 has-[data-slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-2">
                                    <div data-slot="card-title" className="font-semibold text-2xl">{title}</div>
                                    <div data-slot="card-description" className="text-muted-foreground text-sm">{description}</div>
                                </div>
                                <div data-slot="card-content" className="px-5 pb-4 pt-2">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}