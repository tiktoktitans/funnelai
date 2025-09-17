'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LivePreviewProps {
  project: any;
}

export function LivePreview({ project }: LivePreviewProps) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (project?.specs?.[0]?.content) {
      setContent(project.specs[0].content);
      setLoading(false);
    }
  }, [project]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content?.copy) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Generate content to see preview
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-h-[600px] overflow-y-auto p-4 border rounded-lg bg-white">
      {content.copy.hero && (
        <div className="text-center space-y-4">
          {content.copy.hero.eyebrow && (
            <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded-full">
              {content.copy.hero.eyebrow}
            </span>
          )}
          <h1 className="text-3xl font-bold">{content.copy.hero.headline}</h1>
          <p className="text-gray-600">{content.copy.hero.subheadline}</p>
          {content.copy.hero.cta && (
            <button className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700">
              {content.copy.hero.cta.label}
            </button>
          )}
        </div>
      )}

      {content.copy.problem && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{content.copy.problem.headline}</h2>
          <ul className="space-y-2">
            {content.copy.problem.bullets?.map((bullet: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">✗</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.copy.solution && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{content.copy.solution.headline}</h2>
          <ul className="space-y-2">
            {content.copy.solution.bullets?.map((bullet: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.copy.proof && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{content.copy.proof.headline}</h2>
          <div className="grid grid-cols-2 gap-4">
            {content.copy.proof.caseStudies?.map((study: any, index: number) => (
              <Card key={index} className="p-4">
                <h3 className="font-semibold">{study.title}</h3>
                <p className="text-2xl font-bold text-orange-600">{study.metric}</p>
                <p className="text-sm text-gray-600">{study.line}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {content.copy.cta && (
        <div className="text-center space-y-4 p-6 bg-orange-600 text-white rounded-lg">
          <h2 className="text-2xl font-bold">{content.copy.cta.headline}</h2>
          <p>{content.copy.cta.sub}</p>
          {content.copy.cta.primary && (
            <button className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold">
              {content.copy.cta.primary.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}