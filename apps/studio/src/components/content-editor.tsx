'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentEditorProps {
  project: any;
  onSave: (type: string, content: any) => Promise<void>;
  isSaving: boolean;
}

export function ContentEditor({ project, onSave, isSaving }: ContentEditorProps) {
  const { toast } = useToast();
  const [content, setContent] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    if (project?.specs?.[0]?.content) {
      setContent(project.specs[0].content);
    }
  }, [project]);

  const generateContent = async (type: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/spec/${type}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      setContent(data.content);

      toast({
        title: 'Content Generated!',
        description: 'AI has created your content. Review and edit as needed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateContent = (section: string, field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      copy: {
        ...prev.copy,
        [section]: {
          ...prev.copy?.[section],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    await onSave('landing', content);
  };

  if (!content.copy && !isGenerating) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No content generated yet
        </p>
        <Button onClick={() => generateContent('landing')} disabled={isGenerating}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate with AI
        </Button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">AI is generating your content...</p>
      </div>
    );
  }

  const sections = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'problem', label: 'Problem' },
    { id: 'solution', label: 'Solution' },
    { id: 'proof', label: 'Social Proof' },
    { id: 'cta', label: 'Call to Action' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {activeSection === 'hero' && content.copy?.hero && (
          <>
            <div>
              <Label htmlFor="eyebrow">Eyebrow Text</Label>
              <input
                id="eyebrow"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={content.copy.hero.eyebrow || ''}
                onChange={(e) => updateContent('hero', 'eyebrow', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Textarea
                id="headline"
                value={content.copy.hero.headline || ''}
                onChange={(e) => updateContent('hero', 'headline', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="subheadline">Subheadline</Label>
              <Textarea
                id="subheadline"
                value={content.copy.hero.subheadline || ''}
                onChange={(e) => updateContent('hero', 'subheadline', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="cta-label">CTA Button Text</Label>
              <input
                id="cta-label"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={content.copy.hero.cta?.label || ''}
                onChange={(e) => updateContent('hero', 'cta', {
                  ...content.copy.hero.cta,
                  label: e.target.value,
                })}
              />
            </div>
          </>
        )}

        {activeSection === 'problem' && content.copy?.problem && (
          <>
            <div>
              <Label htmlFor="problem-headline">Problem Headline</Label>
              <Textarea
                id="problem-headline"
                value={content.copy.problem.headline || ''}
                onChange={(e) => updateContent('problem', 'headline', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label>Pain Points</Label>
              {content.copy.problem.bullets?.map((bullet: string, index: number) => (
                <Textarea
                  key={index}
                  value={bullet}
                  onChange={(e) => {
                    const newBullets = [...content.copy.problem.bullets];
                    newBullets[index] = e.target.value;
                    updateContent('problem', 'bullets', newBullets);
                  }}
                  rows={2}
                  className="mb-2"
                />
              ))}
            </div>
          </>
        )}

        {activeSection === 'solution' && content.copy?.solution && (
          <>
            <div>
              <Label htmlFor="solution-headline">Solution Headline</Label>
              <Textarea
                id="solution-headline"
                value={content.copy.solution.headline || ''}
                onChange={(e) => updateContent('solution', 'headline', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label>Benefits</Label>
              {content.copy.solution.bullets?.map((bullet: string, index: number) => (
                <Textarea
                  key={index}
                  value={bullet}
                  onChange={(e) => {
                    const newBullets = [...content.copy.solution.bullets];
                    newBullets[index] = e.target.value;
                    updateContent('solution', 'bullets', newBullets);
                  }}
                  rows={2}
                  className="mb-2"
                />
              ))}
            </div>
          </>
        )}

        {activeSection === 'cta' && content.copy?.cta && (
          <>
            <div>
              <Label htmlFor="cta-headline">CTA Headline</Label>
              <Textarea
                id="cta-headline"
                value={content.copy.cta.headline || ''}
                onChange={(e) => updateContent('cta', 'headline', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="cta-sub">CTA Subtext</Label>
              <Textarea
                id="cta-sub"
                value={content.copy.cta.sub || ''}
                onChange={(e) => updateContent('cta', 'sub', e.target.value)}
                rows={2}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="outline" onClick={() => generateContent('landing')}>
          <Sparkles className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}