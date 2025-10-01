import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { FormEvent } from 'react';

interface Step1Props {
    progress: {
        company_name?: string;
        company_website?: string;
    };
    currentStep: number;
}

export default function Step1({ progress, currentStep }: Step1Props) {
    const { data, setData, post, processing, errors } = useForm({
        companyName: progress?.company_name || '',
        website: progress?.company_website || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/onboarding/step/1');
    };

    return (
        <OnboardingLayout 
            currentStep={currentStep}
            title="Welcome"
            description="Let's start with your brand information"
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <fieldset className="relative space-y-4">
                    <div data-slot="form-item" className="grid gap-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                            id="companyName"
                            type="text"
                            autoComplete="organization"
                            placeholder="Cerebras"
                            value={data.companyName}
                            onChange={(e) => setData('companyName', e.target.value)}
                            required
                        />
                        {errors.companyName && (
                            <div className="text-sm text-destructive">{errors.companyName}</div>
                        )}
                    </div>
                    
                    <div data-slot="form-item" className="grid gap-2">
                        <Label htmlFor="website">Company Website</Label>
                        <Input
                            id="website"
                            type="url"
                            placeholder="https://cerebras.ai"
                            value={data.website}
                            onChange={(e) => setData('website', e.target.value)}
                            required
                        />
                        {errors.website && (
                            <div className="text-sm text-destructive">{errors.website}</div>
                        )}
                    </div>
                </fieldset>
                
                <div className="mt-2 flex flex-row-reverse justify-between sticky bottom-0 bg-white dark:bg-gray-800 z-30 border-t py-4 -mx-5 px-5 -mb-4 rounded-b-xl">
                    <Button 
                        type="submit" 
                        disabled={processing}
                        className="ml-auto"
                    >
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </form>
        </OnboardingLayout>
    );
}