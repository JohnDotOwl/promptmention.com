import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: 'How does PromptMention track AI mentions?',
        answer: 'We use advanced APIs and monitoring techniques to track when your brand is mentioned across major AI platforms including ChatGPT, Claude, Gemini, and Perplexity. Our system continuously monitors these platforms and alerts you in real-time when your brand appears in AI-generated responses.',
    },
    {
        question: 'Which AI platforms do you monitor?',
        answer: 'We currently monitor ChatGPT, Claude, Gemini, Perplexity, and several other major AI platforms. We\'re constantly adding new platforms as they emerge to ensure comprehensive coverage of the AI landscape.',
    },
    {
        question: 'Is there a free trial available?',
        answer: 'Yes, we offer a 7-day free trial for all plans. No credit card is required to start your trial. This gives you full access to explore our features and see the value PromptMention can bring to your business.',
    },
];

export default function FAQAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-800">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                        Frequently asked questions
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Everything you need to know about PromptMention
                    </p>
                </div>

                <div className="mt-12 space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                        >
                            <button
                                className="flex w-full items-center justify-between px-6 py-4 text-left"
                                onClick={() => toggleAccordion(index)}
                            >
                                <span className="text-lg font-medium text-gray-900 dark:text-white">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                                        openIndex === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            
                            <div
                                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                                    openIndex === index ? 'max-h-96' : 'max-h-0'
                                }`}
                            >
                                <div className="px-6 pb-4">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Still have questions?{' '}
                        <a
                            href="#contact"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                            Contact our support team
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}