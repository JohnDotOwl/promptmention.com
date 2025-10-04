import { CheckCircle, Sparkles, Users, Bell } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface WaitlistDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: {
        name: string;
        email: string;
        avatar?: string;
        waitlist_joined_at: string;
    };
}

export default function WaitlistDialog({ open, onOpenChange, user }: WaitlistDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-bold">
                        🎉 You're on the Waitlist!
                    </DialogTitle>
                    <DialogDescription className="text-base mt-2">
                        Welcome {user.name}! You're now part of our exclusive early access community.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* User info card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-3">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                            </div>
                            <div className="flex items-center text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">Confirmed</span>
                            </div>
                        </div>
                    </div>

                    {/* Exciting features */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <p className="text-xs font-medium text-gray-900 dark:text-white">Early Access</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Be first to try new features</p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Users className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                            <p className="text-xs font-medium text-gray-900 dark:text-white">Exclusive Community</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Connect with early adopters</p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            🚀 We're building something amazing! Stay tuned for updates.
                        </p>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Continue to Dashboard
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}