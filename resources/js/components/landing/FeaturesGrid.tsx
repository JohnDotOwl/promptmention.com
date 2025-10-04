import {
    Globe,
    BarChart3,
    Bell,
    LineChart
} from 'lucide-react';

const features = [
    {
        name: 'AI Platform Monitoring',
        description: 'Track mentions across ChatGPT, Claude, Gemini, Perplexity, and more AI platforms in real-time.',
        icon: Globe,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        name: 'Brand Mention Tracking',
        description: 'Get instant notifications when AI systems mention your brand or products.',
        icon: Bell,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        name: 'Competitive Analysis',
        description: 'See how often competitors are mentioned and compare your visibility metrics.',
        icon: BarChart3,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        name: 'Real-time Analytics',
        description: 'Access detailed analytics and trends about your AI visibility performance.',
        icon: LineChart,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
    },
];

export default function FeaturesGrid() {
    return (
        <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                        Everything you need to dominate AI search
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Comprehensive tools to monitor, analyze, and optimize your AI visibility
                    </p>
                </div>

                <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.name}
                            className="relative bg-white rounded-2xl shadow-sm p-8 hover:shadow-lg transition-shadow duration-300 dark:bg-gray-900"
                        >
                            <div className={`${feature.bgColor} ${feature.color} inline-flex rounded-xl p-3 dark:bg-opacity-20`}>
                                <feature.icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                                {feature.name}
                            </h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center justify-center space-x-4 rounded-2xl bg-blue-600 px-8 py-4 text-white">
                        <div className="text-left">
                            <p className="text-sm font-medium text-blue-100">Start monitoring today</p>
                            <p className="text-xl font-bold">7-day free trial, no credit card required</p>
                        </div>
                        <a
                            href={route('register')}
                            className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            Get Started
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}