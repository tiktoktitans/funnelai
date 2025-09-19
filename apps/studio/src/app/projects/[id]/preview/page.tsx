'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Copy, Check, Download, Eye, Code } from 'lucide-react';
import Link from 'next/link';

export default function PreviewPage() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'landing' | 'thankyou'>('landing');

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

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    return code.replace(/```[a-z]*\n?/g, '').replace(/```$/g, '').trim();
  };

  const cleanedLandingCode = cleanCode(landingPageCode);
  const cleanedThankYouCode = cleanCode(thankYouPageCode);

  const activeCode = activeTab === 'landing' ? cleanedLandingCode : cleanedThankYouCode;
  const activeFileName = activeTab === 'landing' ? 'landing-page.tsx' : 'thank-you.tsx';

  // Extract key features from the generated code
  const extractFeatures = (code: string) => {
    const features = [];
    if (code.includes('Hero')) features.push('Hero Section');
    if (code.includes('Problem') || code.includes('Challenge')) features.push('Problem/Pain Points');
    if (code.includes('Solution')) features.push('Solution Section');
    if (code.includes('Testimonial')) features.push('Testimonials');
    if (code.includes('Offer') || code.includes('Price')) features.push('Offer/Pricing');
    if (code.includes('form') || code.includes('Form')) features.push('Contact Form');
    if (code.includes('Calendly')) features.push('Calendly Integration');
    if (code.includes('picsum.photos')) features.push('Placeholder Images');
    return features;
  };

  const features = extractFeatures(activeCode);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${params.id}`} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">{project.name} - Generated Code</h1>
              <p className="text-sm text-gray-600">Review and download your generated content</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(activeCode)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={() => downloadCode(activeCode, activeFileName)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Code Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Tabs */}
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('landing')}
                    className={`px-6 py-3 font-medium transition ${
                      activeTab === 'landing'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Landing Page
                  </button>
                  <button
                    onClick={() => setActiveTab('thankyou')}
                    className={`px-6 py-3 font-medium transition ${
                      activeTab === 'thankyou'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Thank You Page
                  </button>
                </div>
              </div>

              {/* Code Display */}
              <div className="p-4">
                {!activeCode ? (
                  <div className="text-center py-12">
                    <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No content generated yet</p>
                    <Link
                      href={`/projects/${params.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      Go back and generate content
                    </Link>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute top-2 right-2 px-3 py-1 bg-gray-800 text-green-400 text-xs rounded">
                      {activeFileName}
                    </div>
                    <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
                      <code className="text-sm text-gray-300 font-mono">{activeCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Generation Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Landing Page:</span>
                  <span className="font-medium">{cleanedLandingCode.length} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thank You Page:</span>
                  <span className="font-medium">{cleanedThankYouCode.length} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Generated:</span>
                  <span className="font-medium">
                    {landingSpec?.updatedAt ? new Date(landingSpec.updatedAt).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Features Detected */}
            {features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Detected Features</h3>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Project Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Brand:</span>
                  <span className="ml-2 font-medium">{landingSpec?.input?.brandName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Offer:</span>
                  <span className="ml-2 font-medium">{landingSpec?.input?.offerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>
                  <span className="ml-2 font-medium">{landingSpec?.input?.offerPrice}</span>
                </div>
                <div>
                  <span className="text-gray-600">Color:</span>
                  <span
                    className="ml-2 inline-block px-3 py-1 rounded text-white text-xs"
                    style={{ backgroundColor: project.brandColors?.primary || '#FF6B00' }}
                  >
                    {project.brandColors?.primary}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How to Use</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Copy or download the code</li>
                <li>Create a new Next.js 14 project</li>
                <li>Install dependencies (React, Tailwind)</li>
                <li>Add the code to your pages</li>
                <li>Customize content and styling</li>
                <li>Deploy to Vercel or other hosting</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}