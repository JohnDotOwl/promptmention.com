import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FormEvent } from 'react';

interface Step2Props {
    progress: {
        first_name?: string;
        last_name?: string;
        job_role?: string;
        company_size?: string;
        language?: string;
        country?: string;
        referral_source?: string;
    };
    currentStep: number;
}

export default function Step2({ progress, currentStep }: Step2Props) {
    const { data, setData, post, processing, errors } = useForm({
        firstName: progress?.first_name || '',
        lastName: progress?.last_name || '',
        companyJobRole: progress?.job_role || '',
        companySize: progress?.company_size || '2-10',
        language: progress?.language || '',
        country: progress?.country || '',
        referralSource: progress?.referral_source || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/onboarding/step/2');
    };

    const handleBack = () => {
        window.location.href = '/onboarding/step/1';
    };

    return (
        <OnboardingLayout 
            currentStep={currentStep}
            title="About you"
            description="Tell us about yourself and your role in the company"
        >
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <fieldset className="relative space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div data-slot="form-item" className="grid gap-2 md:w-2/5">
                            <Label htmlFor="firstName">Your first name</Label>
                            <Input
                                id="firstName"
                                type="text"
                                autoComplete="given-name"
                                placeholder="Example: John, Jane, etc."
                                value={data.firstName}
                                onChange={(e) => setData('firstName', e.target.value)}
                                required
                            />
                            {errors.firstName && (
                                <div className="text-sm text-destructive">{errors.firstName}</div>
                            )}
                        </div>
                        
                        <div data-slot="form-item" className="grid gap-2 md:w-3/5">
                            <Label htmlFor="lastName">Your last name</Label>
                            <Input
                                id="lastName"
                                type="text"
                                autoComplete="family-name"
                                placeholder="Example: Doe, Smith, etc."
                                value={data.lastName}
                                onChange={(e) => setData('lastName', e.target.value)}
                                required
                            />
                            {errors.lastName && (
                                <div className="text-sm text-destructive">{errors.lastName}</div>
                            )}
                        </div>
                    </div>

                    <div data-slot="form-item" className="grid gap-2">
                        <Label htmlFor="companyJobRole">Your role in the company</Label>
                        <Input
                            id="companyJobRole"
                            type="text"
                            autoComplete="organization-title"
                            placeholder="Example: CEO, Marketing Manager, etc."
                            value={data.companyJobRole}
                            onChange={(e) => setData('companyJobRole', e.target.value)}
                            required
                        />
                        {errors.companyJobRole && (
                            <div className="text-sm text-destructive">{errors.companyJobRole}</div>
                        )}
                    </div>

                    <div data-slot="form-item" className="grid gap-2">
                        <Label htmlFor="companySize">Company Size</Label>
                        <select
                            id="companySize"
                            value={data.companySize}
                            onChange={(e) => setData('companySize', e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="Solo">Solo</option>
                            <option value="2-10">2-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-1000">201-1000 employees</option>
                            <option value="1000+">1000+ employees</option>
                        </select>
                        {errors.companySize && (
                            <div className="text-sm text-destructive">{errors.companySize}</div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row">
                        <div data-slot="form-item" className="grid gap-2 md:w-1/2">
                            <Label htmlFor="language">Language</Label>
                            <select
                                id="language"
                                value={data.language}
                                onChange={(e) => setData('language', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select language</option>
                                <option value="en-US">English (US)</option>
                                <option value="en-GB">English (UK)</option>
                                <option value="nl-NL">Dutch</option>
                                <option value="es-ES">Spanish (Spain)</option>
                                <option value="es-MX">Spanish (Mexico)</option>
                                <option value="fr-FR">French</option>
                                <option value="de-DE">German</option>
                                <option value="no-NO">Norwegian</option>
                                <option value="sv-SE">Swedish</option>
                                <option value="da-DK">Danish</option>
                                <option value="it-IT">Italian</option>
                                <option value="pt-PT">Portuguese (Portugal)</option>
                                <option value="pt-BR">Portuguese (Brazil)</option>
                                <option value="ja-JP">Japanese</option>
                            </select>
                        </div>
                        
                        <div data-slot="form-item" className="grid gap-2 md:w-1/2">
                            <Label htmlFor="country">Country</Label>
                            <select
                                id="country"
                                value={data.country}
                                onChange={(e) => setData('country', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select country</option>
                                <option value="US">United States</option>
                                <option value="CA">Canada</option>
                                <option value="GB">United Kingdom</option>
                                <option value="DE">Germany</option>
                                <option value="FR">France</option>
                                <option value="ES">Spain</option>
                                <option value="NL">Netherlands</option>
                                <option value="NO">Norway</option>
                                <option value="SE">Sweden</option>
                                <option value="DK">Denmark</option>
                                <option value="AU">Australia</option>
                                <option value="JP">Japan</option>
                                <option value="BR">Brazil</option>
                                <option value="MX">Mexico</option>
                            </select>
                        </div>
                    </div>

                    <div data-slot="form-item" className="grid gap-2">
                        <Label htmlFor="referralSource">How did you hear about us?</Label>
                        <select
                            id="referralSource"
                            value={data.referralSource}
                            onChange={(e) => setData('referralSource', e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">Select referral source</option>
                            <option value="chatgpt">ChatGPT</option>
                            <option value="perplexity">Perplexity</option>
                            <option value="google">Google</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="twitter">Twitter/X</option>
                            <option value="facebook">Facebook</option>
                            <option value="other">Other</option>
                        </select>
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
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleBack}
                        className="mr-auto"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>
            </form>
        </OnboardingLayout>
    );
}