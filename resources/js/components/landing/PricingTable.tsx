import { Check, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

const plans = [
    {
        name: 'Starter',
        price: 49,
        description: 'Perfect for small businesses and startups',
        features: [
            { name: 'Up to 3 brands monitoring', included: true },
            { name: 'Daily mention reports', included: true },
            { name: 'Basic analytics dashboard', included: true },
            { name: 'Email notifications', included: true },
            { name: 'API access', included: false },
            { name: 'Custom integrations', included: false },
            { name: 'Priority support', included: false },
        ],
        cta: 'Start free trial',
        popular: true,
    },
    {
        name: 'Professional',
        price: 149,
        description: 'For growing companies with multiple brands',
        features: [
            { name: 'Up to 10 brands monitoring', included: true },
            { name: 'Real-time mention alerts', included: true },
            { name: 'Advanced analytics & insights', included: true },
            { name: 'Email & Slack notifications', included: true },
            { name: 'API access', included: true },
            { name: 'Custom integrations', included: false },
            { name: 'Priority support', included: true },
        ],
        cta: 'Start free trial',
        popular: false,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Tailored solutions for large organizations',
        features: [
            { name: 'Unlimited brands monitoring', included: true },
            { name: 'Real-time mention alerts', included: true },
            { name: 'Custom analytics & reporting', included: true },
            { name: 'All notification channels', included: true },
            { name: 'Full API access', included: true },
            { name: 'Custom integrations', included: true },
            { name: 'Dedicated account manager', included: true },
        ],
        cta: 'Contact sales',
        popular: false,
    },
];

export default function PricingTable() {
    return (
        <section id="pricing" className="py-24 bg-white dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                        Simple, transparent pricing
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Choose the perfect plan for your business. All plans include a 7-day free trial.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl ${
                                plan.popular
                                    ? 'border-2 border-blue-600 shadow-xl'
                                    : 'border border-gray-200 dark:border-gray-700'
                            } bg-white p-8 dark:bg-gray-800`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {plan.name}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {plan.description}
                                </p>
                                <div className="mt-6">
                                    {typeof plan.price === 'number' ? (
                                        <div className="flex items-baseline justify-center">
                                            <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                ${plan.price}
                                            </span>
                                            <span className="ml-2 text-lg text-gray-600 dark:text-gray-400">
                                                /month
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                                            {plan.price}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <ul className="mt-8 space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature.name} className="flex items-start">
                                        {feature.included ? (
                                            <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                                        ) : (
                                            <X className="h-5 w-5 flex-shrink-0 text-gray-400" />
                                        )}
                                        <span
                                            className={`ml-3 text-sm ${
                                                feature.included
                                                    ? 'text-gray-700 dark:text-gray-300'
                                                    : 'text-gray-400 dark:text-gray-500'
                                            }`}
                                        >
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                {plan.name === 'Enterprise' ? (
                                    <a
                                        href="#contact"
                                        className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-colors ${
                                            plan.popular
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {plan.cta}
                                    </a>
                                ) : (
                                    <Link
                                        href={route('register')}
                                        className={`block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-colors ${
                                            plan.popular
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {plan.cta}
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        All plans include a 7-day free trial. No credit card required.
                    </p>
                </div>
            </div>
        </section>
    );
}