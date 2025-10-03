import { Zap } from 'lucide-react';

export default function CerebrasBadge() {
    return (
        <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
            <div className="bg-gradient-to-r from-[#f05a2a] to-[#ff6b35] text-white border border-[#f05a2a]/30 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white leading-tight">
                            Created & Powered by
                        </p>
                        <p className="text-sm font-bold text-white">
                            Cerebras AI
                        </p>
                    </div>
                </div>
                <div className="mt-1 text-xs text-white/90">
                    Next-generation AI
                </div>
            </div>
        </div>
    );
}