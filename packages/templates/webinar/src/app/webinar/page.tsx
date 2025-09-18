import { promises as fs } from 'fs';
import path from 'path';
import { Users, Clock, AlertCircle } from 'lucide-react';

async function getSpec() {
  try {
    const specPath = path.join(process.cwd(), 'public', 'specs', 'webinar.json');
    const specContent = await fs.readFile(specPath, 'utf-8');
    return JSON.parse(specContent);
  } catch {
    try {
      const specPath = path.join(process.cwd(), 'specs', 'webinar.json');
      const specContent = await fs.readFile(specPath, 'utf-8');
      return JSON.parse(specContent);
    } catch {
      return {
        title: "Live Training Session",
        embedUrl: "https://youtube.com/embed/demo",
        countdown: true,
        ctaStrip: {
          text: "Special offer expires when this training ends",
          button: { label: "Claim Your Spot", href: "/apply" }
        }
      };
    }
  }
}

export default async function WebinarPage() {
  const spec = await getSpec();

  return (
    <main className="min-h-screen bg-gray-900">
      {/* CTA Strip */}
      {spec.ctaStrip && (
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 py-3 text-white">
          <div className="container mx-auto flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{spec.ctaStrip.text}</span>
            </div>
            <a
              href={spec.ctaStrip.button.href}
              className="rounded bg-white px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-gray-100"
            >
              {spec.ctaStrip.button.label}
            </a>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6 text-center text-white">
            <h1 className="mb-2 text-3xl font-bold">{spec.title}</h1>
            <div className="flex items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>847 watching</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Started 12 minutes ago</span>
              </span>
            </div>
          </div>

          {/* Video Embed */}
          <div className="aspect-video overflow-hidden rounded-lg bg-black shadow-2xl">
            {spec.embedUrl ? (
              <iframe
                src={spec.embedUrl}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🎥</div>
                  <p className="text-xl">Webinar will start soon...</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat/Comments Section */}
          <div className="mt-8 rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Questions & Comments</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  💡 Pro tip: Take notes and ask questions in the chat!
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-center text-gray-500">
                  Chat will be available during the live session
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}