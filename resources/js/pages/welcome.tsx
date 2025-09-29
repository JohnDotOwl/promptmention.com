import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import Navigation from '@/components/landing/Navigation';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import PricingTable from '@/components/landing/PricingTable';
import FAQAccordion from '@/components/landing/FAQAccordion';
import Footer from '@/components/landing/Footer';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Get Mentioned by AI - PromptMention">
                <meta name="description" content="Get your company mentioned by ChatGPT, Claude, Gemini, and Perplexity. Boost your visibility in AI search engines." />
            </Head>
            
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Navigation auth={auth} />
                
                <main>
                    <HeroSection />
                    <FeaturesGrid />
                    <PricingTable />
                    <FAQAccordion />
                </main>
                
                <Footer />
            </div>
        </>
    );
}