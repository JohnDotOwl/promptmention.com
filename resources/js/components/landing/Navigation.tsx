import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { type SharedData } from '@/types';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface NavigationProps {
    auth: SharedData['auth'];
}

export default function Navigation({ auth }: NavigationProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Resources', href: '#resources' },
        { name: 'Agencies', href: '#agencies' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm dark:bg-gray-900/80">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" prefetch className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <span className="text-xl font-semibold text-gray-900 dark:text-white">
                                PromptMention
                            </span>
                        </Link>
                    </div>

                    {/* Desktop navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
                            >
                                {item.name}
                            </a>
                        ))}
                        
                        <Link
                            href="#"
                            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400"
                        >
                            Book a Demo
                        </Link>

                        <ThemeToggle />

                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                prefetch
                                className="ml-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <a
                                href={route('auth.google')}
                                className="ml-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            >
                                Join Waitlist
                            </a>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center space-x-2 md:hidden">
                        <ThemeToggle />
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    {item.name}
                                </a>
                            ))}
                            <a
                                href="#"
                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Book a Demo
                            </a>
                            
                            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        prefetch
                                        className="block px-3 py-2 text-base font-medium text-blue-600"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <a
                                        href={route('auth.google')}
                                        className="mx-3 mt-2 flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white hover:bg-blue-700"
                                    >
                                        Join Waitlist
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}