import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
            
            <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                <div className="text-center">
                    {/* Badge */}
                    <div className="mb-8 flex justify-center">
                        <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <Sparkles className="mr-2 h-4 w-4" />
                            AI-Powered Brand Monitoring
                        </div>
                    </div>
                    
                    {/* Main heading */}
                    <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl dark:text-white">
                        Get your company mentioned by{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            ChatGPT, Claude, Gemini, Perplexity
                        </span>
                    </h1>
                    
                    {/* Subheading */}
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Track and optimize your brand's visibility across AI search engines. 
                        Know when AI mentions your company and stay ahead of competitors.
                    </p>
                    
                    {/* CTA buttons */}
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Link
                            href={route('auth.google')}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                        >
                            Join Waitlist
                        </Link>
                        <Link
                            href={route('auth.google')}
                            className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-200 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700"
                        >
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Login with Google
                        </Link>
                    </div>
                    
                    {/* Trust indicators */}
                    <div className="mt-16">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Trusted by leading companies</p>
                        <div className="mt-6 flex flex-wrap justify-center items-center gap-8 transition-all duration-300">
                            <div className="flex flex-wrap justify-center items-center gap-8 grayscale opacity-60 hover:opacity-80 transition-opacity duration-300 dark:hidden">
                                <img 
                                    src="https://promptwatch.com/brands/crisp.svg" 
                                    alt="Crisp"
                                    className="h-8 w-auto max-w-[120px] object-contain"
                                />
                                <img 
                                    src="https://promptwatch.com/_next/image?url=%2Fbrands%2Fsimpleanalytics.png&w=1080&q=100" 
                                    alt="Simple Analytics"
                                    className="h-8 w-auto max-w-[120px] object-contain"
                                />
                                <img 
                                    src="https://promptwatch.com/brands/polymarket.svg" 
                                    alt="Polymarket"
                                    className="h-8 w-auto max-w-[120px] object-contain"
                                />
                                <img 
                                    src="https://promptwatch.com/_next/image?url=%2Fbrands%2Findepender.png&w=1920&q=100" 
                                    alt="Independer"
                                    className="h-8 w-auto max-w-[120px] object-contain"
                                />
                                <img 
                                    src="https://promptwatch.com/_next/image?url=%2Fbrands%2Fadwise.png&w=256&q=75" 
                                    alt="Adwise"
                                    className="h-8 w-auto max-w-[120px] object-contain"
                                />
                            </div>
                            {/* Dark mode version with white background cards */}
                            <div className="hidden dark:flex flex-wrap justify-center items-center gap-6">
                                <div className="bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <img 
                                        src="https://promptwatch.com/brands/crisp.svg" 
                                        alt="Crisp"
                                        className="h-6 w-auto max-w-[100px] object-contain"
                                    />
                                </div>
                                <div className="bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <img 
                                        src="https://promptwatch.com/_next/image?url=%2Fbrands%2Fsimpleanalytics.png&w=1080&q=100" 
                                        alt="Simple Analytics"
                                        className="h-6 w-auto max-w-[100px] object-contain"
                                    />
                                </div>
                                <div className="bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <img 
                                        src="https://promptwatch.com/brands/polymarket.svg" 
                                        alt="Polymarket"
                                        className="h-6 w-auto max-w-[100px] object-contain"
                                    />
                                </div>
                                <div className="bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <img 
                                        src="https://promptwatch.com/_next/image?url=%2Fbrands%2Findepender.png&w=1920&q=100" 
                                        alt="Independer"
                                        className="h-6 w-auto max-w-[100px] object-contain"
                                    />
                                </div>
                                <div className="bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <img 
                                        src="https://promptwatch.com/_next/image?url=%2Fbrands%2Fadwise.png&w=256&q=75" 
                                        alt="Adwise"
                                        className="h-6 w-auto max-w-[100px] object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}