import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    const isDark = appearance === 'dark' || (appearance === 'system' &&
        (typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false));

    const toggleTheme = () => {
        const newAppearance: Appearance = isDark ? 'light' : 'dark';
        updateAppearance(newAppearance);
    };

    return (
        <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:focus:ring-offset-gray-900"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    );
}