import { Users, Clock } from 'lucide-react';

interface WaitlistIndicatorProps {
    user?: {
        id: number;
        name: string;
        email: string;
        waitlist_joined_at: string | null;
    };
}

export default function WaitlistIndicator({ user }: WaitlistIndicatorProps) {
    if (!user?.waitlist_joined_at) {
        return null;
    }

    const joinedDate = new Date(user.waitlist_joined_at);
    const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-500 rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                        <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">🎯 On Waitlist</p>
                        <p className="text-xs text-blue-100 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysSinceJoined === 0 ? 'Joined today' : `${daysSinceJoined} days ago`}
                        </p>
                    </div>
                </div>
                <div className="mt-1 text-xs text-blue-100">
                    Early access member
                </div>
            </div>
        </div>
    );
}