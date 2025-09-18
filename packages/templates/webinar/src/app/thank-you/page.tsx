import { promises as fs } from 'fs';
import path from 'path';
import { Calendar, CheckCircle, Clock, Video } from 'lucide-react';

async function getSpec() {
  try {
    const specPath = path.join(process.cwd(), 'public', 'specs', 'thankyou.json');
    const specContent = await fs.readFile(specPath, 'utf-8');
    return JSON.parse(specContent);
  } catch {
    try {
      const specPath = path.join(process.cwd(), 'specs', 'thankyou.json');
      const specContent = await fs.readFile(specPath, 'utf-8');
      return JSON.parse(specContent);
    } catch {
      return {
        headline: "You're Registered!",
        subheadline: "Check your email for important details",
        videoUrl: null,
        bullets: [
          "You'll receive a confirmation email shortly",
          "Add the event to your calendar",
          "Join 5 minutes early for best experience"
        ],
        calendlyUrl: "https://calendly.com/demo/webinar"
      };
    }
  }
}

export default async function ThankYouPage() {
  const spec = await getSpec();

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {spec.headline}
          </h1>

          <p className="mb-12 text-xl text-gray-600">
            {spec.subheadline}
          </p>

          {spec.videoUrl && (
            <div className="mb-12 aspect-video rounded-lg bg-gray-900">
              <iframe
                src={spec.videoUrl}
                className="h-full w-full rounded-lg"
                allowFullScreen
              />
            </div>
          )}

          <div className="mb-12 rounded-lg bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold">What's Next?</h2>
            <div className="space-y-4 text-left">
              {spec.bullets?.map((bullet: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-gray-700">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <a
              href={spec.calendlyUrl}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
            >
              <Calendar className="h-5 w-5" />
              Add to Calendar
            </a>

            <p className="text-sm text-gray-500">
              Having issues? Contact support@funnelai.app
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}