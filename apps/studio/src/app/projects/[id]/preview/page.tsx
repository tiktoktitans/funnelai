'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Code, Eye } from 'lucide-react';
import Link from 'next/link';

export default function PreviewPage() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      const data = await res.json();
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            Go back to projects
          </Link>
        </div>
      </div>
    );
  }

  const landingSpec = project.specs?.find((s: any) => s.type === 'LANDING');
  const landingPageCode = landingSpec?.content?.landingPage || '';
  const thankYouPageCode = landingSpec?.content?.thankYouPage || '';

  // Clean the code by removing markdown code blocks
  const cleanCode = (code: string) => {
    return code.replace(/```[a-z]*\n?/g, '').replace(/```$/g, '');
  };

  const renderPreview = (code: string) => {
    if (!code) return <div className="text-gray-500 p-8">No content generated yet</div>;

    const cleanedCode = cleanCode(code);

    // Create a simple HTML preview
    return (
      <div className="w-full h-full">
        <iframe
          srcDoc={`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
                </style>
              </head>
              <body>
                <div id="root"></div>
                <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                <script type="text/babel">
                  ${cleanedCode}
                  const root = ReactDOM.createRoot(document.getElementById('root'));
                  root.render(React.createElement(LandingPage || ThankYou || 'div'));
                </script>
              </body>
            </html>
          `}
          className="w-full h-[800px] border-0"
          title="Preview"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${params.id}`} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">{project.name} - Preview</h1>
              <p className="text-sm text-gray-600">Generated content preview</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {showCode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
              {showCode ? 'Preview' : 'View Code'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <div className="flex">
              <button className="px-6 py-3 text-blue-600 border-b-2 border-blue-600 font-medium">
                Landing Page
              </button>
              <button className="px-6 py-3 text-gray-600 hover:text-gray-900">
                Thank You Page
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4">
            {!landingSpec?.content ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No content generated yet</p>
                <Link
                  href={`/projects/${params.id}`}
                  className="text-blue-500 hover:underline"
                >
                  Go back and generate content
                </Link>
              </div>
            ) : showCode ? (
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">
                  <code>{cleanCode(landingPageCode)}</code>
                </pre>
              </div>
            ) : (
              renderPreview(landingPageCode)
            )}
          </div>
        </div>

        {/* Info Box */}
        {landingSpec?.content && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Generated Content Info</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Landing Page: {landingPageCode.length} characters</p>
              <p>• Thank You Page: {thankYouPageCode.length} characters</p>
              <p>• Generated: {new Date(landingSpec.updatedAt).toLocaleString()}</p>
              <p>• Brand Colors: {project.brandColors?.primary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}