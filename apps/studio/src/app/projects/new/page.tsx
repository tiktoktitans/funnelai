'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WizardInput } from '@funnelai/types';

const STEPS = [
  {
    id: 'brand',
    title: 'Brand Information',
    description: 'Tell us about your brand',
  },
  {
    id: 'offer',
    title: 'Your Offer',
    description: 'What are you selling?',
  },
  {
    id: 'audience',
    title: 'Target Audience',
    description: 'Who is your ideal customer?',
  },
  {
    id: 'links',
    title: 'Integration Links',
    description: 'Connect your tools (optional)',
  },
  {
    id: 'review',
    title: 'Review & Generate',
    description: 'AI will generate your funnel',
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState<Partial<WizardInput>>({
    brandName: '',
    brandColors: { primary: '#FF6B00' },
    offerName: '',
    offerPrice: '',
    offerPromise: '',
    audience: '',
    calendlyUrl: '',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create project');

      const { id } = await response.json();

      toast({
        title: 'Project created!',
        description: 'AI is generating your funnel content...',
      });

      router.push(`/projects/${id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
      setIsGenerating(false);
    }
  };

  const updateFormData = (field: keyof WizardInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <div className="mt-4 flex items-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  index <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-16 h-1 mx-2 transition-colors',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
          <CardDescription>{STEPS[currentStep].description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  placeholder="e.g., FunnelAI"
                  value={formData.brandName}
                  onChange={(e) => updateFormData('brandName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    className="w-20 h-10"
                    value={formData.brandColors?.primary}
                    onChange={(e) => updateFormData('brandColors', { ...formData.brandColors, primary: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={formData.brandColors?.primary}
                    onChange={(e) => updateFormData('brandColors', { ...formData.brandColors, primary: e.target.value })}
                    placeholder="#FF6B00"
                    className="flex-1"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="offerName">Offer Name</Label>
                <Input
                  id="offerName"
                  placeholder="e.g., TikTok Ads Masterclass"
                  value={formData.offerName}
                  onChange={(e) => updateFormData('offerName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offerPrice">Price</Label>
                <Input
                  id="offerPrice"
                  placeholder="e.g., $997 or Free"
                  value={formData.offerPrice}
                  onChange={(e) => updateFormData('offerPrice', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offerPromise">Main Promise/Benefit</Label>
                <Textarea
                  id="offerPromise"
                  placeholder="e.g., Learn how to scale your business to 6-figures with TikTok ads in 30 days"
                  value={formData.offerPromise}
                  onChange={(e) => updateFormData('offerPromise', e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience Description</Label>
              <Textarea
                id="audience"
                placeholder="e.g., E-commerce store owners making $10k-50k/month who want to scale with paid ads"
                value={formData.audience}
                onChange={(e) => updateFormData('audience', e.target.value)}
                rows={4}
              />
            </div>
          )}

          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="calendlyUrl">Calendly Link (Optional)</Label>
                <Input
                  id="calendlyUrl"
                  type="url"
                  placeholder="https://calendly.com/yourname/meeting"
                  value={formData.calendlyUrl}
                  onChange={(e) => updateFormData('calendlyUrl', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Used for booking calls/webinars
                </p>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-medium mb-2">Review Your Information</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="inline font-medium">Brand:</dt>
                    <dd className="inline ml-2">{formData.brandName}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Offer:</dt>
                    <dd className="inline ml-2">{formData.offerName} ({formData.offerPrice})</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Promise:</dt>
                    <dd className="inline ml-2">{formData.offerPromise}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Audience:</dt>
                    <dd className="inline ml-2">{formData.audience}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">AI will generate:</h4>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Landing page with compelling copy</li>
                      <li>• Thank you page</li>
                      <li>• Webinar registration page</li>
                      <li>• Email sequences (7 emails)</li>
                      <li>• VSL script</li>
                      <li>• Application form</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Funnel
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}