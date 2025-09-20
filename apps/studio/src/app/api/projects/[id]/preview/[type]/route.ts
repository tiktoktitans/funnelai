import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@funnelai/database/src/supabase-client';

function renderHeroSection(hero: any, webinarDetails: any, brandColors: any) {
  return `
    <section class="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24">
      ${webinarDetails ? `
        <div class="absolute top-4 left-0 right-0 bg-red-600 text-white py-2 text-center animate-pulse">
          <div class="flex items-center justify-center gap-2">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-semibold">LIVE TRAINING STARTING SOON - Only ${webinarDetails.spotsLeft || 47} Seats Left!</span>
          </div>
        </div>
      ` : ''}

      <div class="container mx-auto px-4 ${webinarDetails ? 'pt-8' : ''}">
        <div class="mx-auto max-w-4xl text-center">
          ${hero.eyebrow ? `
            <span class="inline-block px-4 py-1 mb-6 text-sm font-bold text-orange-600 bg-orange-100 rounded-full animate-pulse">
              ${hero.eyebrow}
            </span>
          ` : ''}

          <h1 class="mb-6 text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
            ${hero.headline || 'Transform Your Business Today'}
          </h1>

          <p class="mb-8 text-xl md:text-2xl text-gray-600">
            ${hero.subheadline || 'Join thousands who have already transformed their lives'}
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a href="${hero.cta?.href || '#register'}"
               class="inline-flex items-center justify-center px-8 py-5 text-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-lg shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1 hover:scale-105">
              ${hero.cta?.label || 'Reserve Your Seat Now'}
              <span class="ml-2">→</span>
            </a>
          </div>

          ${webinarDetails ? `
            <div class="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="font-semibold">${webinarDetails.date}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-semibold">${webinarDetails.time}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="font-semibold">${webinarDetails.totalRegistered} Already Registered</span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </section>
  `;
}

function renderProblemSection(problem: any) {
  return `
    <section class="py-20 bg-gradient-to-b from-red-50 to-white">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-3xl">
          <h2 class="mb-12 text-4xl md:text-5xl font-bold text-center text-gray-900">
            ${problem.headline || 'Does This Sound Like You?'}
          </h2>

          <div class="space-y-4">
            ${(problem.bullets || []).map((bullet: string, index: number) => `
              <div class="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md border-l-4 border-red-500 transform transition hover:scale-105">
                <svg class="h-6 w-6 text-red-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-700 text-lg">${bullet}</p>
              </div>
            `).join('')}
          </div>

          <p class="mt-8 text-center text-xl font-semibold text-gray-800">
            If any of this resonates, you're in the right place...
          </p>
        </div>
      </div>
    </section>
  `;
}

function renderSolutionSection(solution: any) {
  return `
    <section class="py-20 bg-gradient-to-b from-green-50 to-white">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-3xl">
          <div class="flex items-center justify-center gap-2 mb-6">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>

          <h2 class="mb-12 text-4xl md:text-5xl font-bold text-center text-gray-900">
            ${solution.headline || 'The Breakthrough Method That Changes Everything'}
          </h2>

          <div class="space-y-4">
            ${(solution.bullets || []).map((bullet: string, index: number) => `
              <div class="flex items-start gap-4 p-5 bg-white rounded-lg shadow-lg border border-green-100 hover:shadow-xl transition-shadow transform hover:scale-105">
                <svg class="h-7 w-7 text-green-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-700 text-lg">${bullet}</p>
              </div>
            `).join('')}
          </div>

          <div class="mt-12 p-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white text-center shadow-xl">
            <p class="text-2xl font-bold">
              All of this will be revealed in the FREE training
            </p>
            <p class="mt-2 text-lg opacity-90">
              No fluff. No theory. Just proven strategies that work.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderProofSection(proof: any) {
  if (!proof.testimonials || proof.testimonials.length === 0) return '';

  return `
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-5xl">
          <h2 class="mb-12 text-4xl md:text-5xl font-bold text-center text-gray-900">
            ${proof.headline || 'Real People. Real Results.'}
          </h2>

          <div class="grid md:grid-cols-3 gap-6">
            ${proof.testimonials.map((testimonial: any, index: number) => `
              <div class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
                <div class="flex mb-4">
                  ${[...Array(5)].map(() => `
                    <svg class="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  `).join('')}
                </div>

                ${testimonial.metric ? `
                  <div class="flex items-center gap-2 mb-4 text-green-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span class="font-bold text-2xl">${testimonial.metric}</span>
                    <span class="text-sm">${testimonial.timeframe || ''}</span>
                  </div>
                ` : ''}

                <p class="text-gray-700 mb-4 italic">"${testimonial.quote}"</p>

                <div class="border-t pt-4">
                  <p class="font-semibold text-gray-900">${testimonial.name}</p>
                  <p class="text-sm text-gray-600">${testimonial.role || ''}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <p class="mt-12 text-center text-lg text-gray-600">
            <strong>These results are not typical</strong> - but they show what's possible when you apply what you'll learn
          </p>
        </div>
      </div>
    </section>
  `;
}

function renderCTASection(cta: any) {
  return `
    <section class="py-20 bg-gradient-to-b from-orange-600 to-red-600">
      <div class="container mx-auto px-4">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="mb-6 text-4xl md:text-5xl font-bold text-white">
            ${cta.headline || 'Your Transformation Starts Here'}
          </h2>

          <p class="mb-8 text-xl text-white/90">
            ${cta.sub || 'This free training is happening soon and seats are limited'}
          </p>

          ${cta.urgency ? `
            <div class="flex items-center justify-center gap-2 mb-8">
              <svg class="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="text-yellow-300 font-bold text-lg animate-pulse">
                ${cta.urgency}
              </span>
            </div>
          ` : ''}

          <a href="${cta.primary?.href || '#register'}"
             class="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-orange-600 bg-white rounded-lg shadow-2xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 hover:scale-105">
            ${cta.primary?.label || 'Reserve My Seat Now'}
            <span class="ml-2">→</span>
          </a>

          <div class="mt-8 flex items-center justify-center gap-2 text-white/80">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Registration closes when the training starts</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderRegistrationForm() {
  return `
    <section id="register" class="py-20 bg-gray-100">
      <div class="container mx-auto px-4 max-w-md">
        <h3 class="text-2xl font-bold text-center mb-8">
          Reserve Your Free Seat Now
        </h3>
        <form class="space-y-4" onsubmit="event.preventDefault(); alert('Registration successful! Check your email for details.');">
          <input
            type="text"
            name="name"
            placeholder="Your Full Name"
            required
            class="w-full px-4 py-3 rounded-lg border focus:border-orange-500 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Best Email"
            required
            class="w-full px-4 py-3 rounded-lg border focus:border-orange-500 focus:outline-none"
          />
          <button
            type="submit"
            class="w-full px-4 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Yes! Reserve My Seat →
          </button>
        </form>
        <p class="text-xs text-gray-500 text-center mt-4">
          We respect your privacy. Your information is 100% secure and will never be shared.
        </p>
      </div>
    </section>
  `;
}

function renderThankYouPage(spec: any) {
  const { copy } = spec;

  return `
    <main class="min-h-screen bg-gradient-to-b from-green-50 to-white py-20">
      <div class="container mx-auto px-4 max-w-3xl text-center">
        <svg class="h-20 w-20 text-green-600 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <h1 class="text-5xl font-bold mb-4">${copy.headline || "You're Registered!"}</h1>
        <p class="text-xl text-gray-600 mb-12">${copy.subheadline || 'Check your email for details'}</p>

        ${copy.steps ? `
          <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 class="text-2xl font-bold mb-6">Next Steps:</h2>
            <ol class="text-left space-y-3">
              ${copy.steps.map((step: string, i: number) => `
                <li class="flex items-start gap-3">
                  <span class="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    ${i + 1}
                  </span>
                  <span class="text-lg">${step}</span>
                </li>
              `).join('')}
            </ol>
          </div>
        ` : ''}

        ${copy.bonus ? `
          <div class="bg-orange-50 rounded-lg p-8 mb-8">
            <h2 class="text-2xl font-bold mb-4">${copy.bonus.headline}</h2>
            <p class="text-lg mb-4">${copy.bonus.description}</p>
            <ul class="space-y-2">
              ${(copy.bonus.items || []).map((item: string) => `
                <li class="text-lg">✓ ${item}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${copy.calendar?.calendlyUrl ? `
          <div class="bg-gray-100 rounded-lg p-8">
            <h2 class="text-2xl font-bold mb-4">${copy.calendar.headline || 'Schedule Your Strategy Call'}</h2>
            <p class="text-lg mb-6">${copy.calendar.description || 'Book your free consultation now'}</p>
            <a href="${copy.calendar.calendlyUrl}" target="_blank" rel="noopener noreferrer"
               class="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
              Schedule Your Call →
            </a>
          </div>
        ` : ''}
      </div>
    </main>
  `;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; type: string } }
) {
  try {
    const { data: project, error } = await supabase
      .from('Project')
      .select(`
        *,
        specs:Spec(*)
      `)
      .eq('id', params.id)
      .single();

    if (error || !project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    const landingSpec = project.specs?.find((s: any) => s.type === 'LANDING');

    if (!landingSpec || !landingSpec.content) {
      return new NextResponse('No generated content found', { status: 404 });
    }

    let html = '';

    // Check for new structure first (with landingSpec/thankYouSpec)
    // Content might be stored directly or within the content property
    const contentData = landingSpec.content;

    if (contentData && (contentData.landingSpec || contentData.thankYouSpec)) {
      if (params.type === 'thankyou' && contentData.thankYouSpec) {
        // Render thank you page from spec
        const thankYouHtml = renderThankYouPage(contentData.thankYouSpec);

        html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You - ${project.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    ${thankYouHtml}
</body>
</html>`;
      } else if (contentData.landingSpec) {
        // Render landing page from spec
        const spec = contentData.landingSpec;
        const { copy, metadata } = spec;

        // Add default values if properties are missing
        const heroData = copy?.hero || {};
        const problemData = copy?.problem || {};
        const solutionData = copy?.solution || {};
        const proofData = copy?.proof || null;
        const ctaData = copy?.cta || {};
        const webinarData = copy?.webinarDetails || null;
        const metadataInfo = metadata || {};

        const heroHtml = renderHeroSection(heroData, webinarData, project.brandColors);
        const problemHtml = renderProblemSection(problemData);
        const solutionHtml = renderSolutionSection(solutionData);
        const proofHtml = proofData ? renderProofSection(proofData) : '';
        const ctaHtml = renderCTASection(ctaData);
        const formHtml = renderRegistrationForm();

        html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadataInfo?.title || project.name}</title>
    <meta name="description" content="${metadataInfo?.description || project.offerPromise || ''}">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      html { scroll-behavior: smooth; }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
      .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    </style>
</head>
<body>
    <main class="min-h-screen">
      ${heroHtml}
      ${problemHtml}
      ${solutionHtml}
      ${proofHtml}
      ${ctaHtml}
      ${formHtml}
    </main>
</body>
</html>`;
      } else {
        // If we don't have specs but have projectFiles, try to extract from there
        if (contentData.projectFiles) {
          // This is the multi-file format, we can't directly preview it
          // Return a message that the content needs to be deployed
          html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${project.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center p-8 bg-white rounded-lg shadow-lg">
      <svg class="h-16 w-16 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
      <h2 class="text-2xl font-bold mb-2">Advanced Project Generated</h2>
      <p class="text-gray-600 mb-4">This project contains multiple files and components that need to be deployed to view properly.</p>
      <p class="text-sm text-gray-500">Use the "Deploy to Vercel" button to see your live site.</p>
    </div>
</body>
</html>`;
        } else {
          return new NextResponse('Content structure not recognized', { status: 404 });
        }
      }
    } else if (contentData && contentData.projectFiles) {
      // This is the multi-file format, we can't directly preview it
      html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${project.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center p-8 bg-white rounded-lg shadow-lg">
      <svg class="h-16 w-16 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
      <h2 class="text-2xl font-bold mb-2">Advanced Project Generated</h2>
      <p class="text-gray-600 mb-4">This project contains multiple files and components that need to be deployed to view properly.</p>
      <p class="text-sm text-gray-500">Use the "Deploy to Vercel" button to see your live site.</p>
    </div>
</body>
</html>`;
    } else {
      // Fallback to old structure (landingPage/thankYouPage as strings)
      const pageContent = params.type === 'thankyou'
        ? landingSpec.content.thankYouPage
        : landingSpec.content.landingPage;

      if (!pageContent) {
        return new NextResponse('Page content not found', { status: 404 });
      }

      // Old rendering logic for backward compatibility
      let cleanedCode = pageContent
        .replace(/```[a-z]*\n?/g, '')
        .replace(/```$/g, '')
        .trim();

      const returnMatch = cleanedCode.match(/return\s*\(([\s\S]*)\)\s*;?\s*}/);
      let componentHTML = '';

      if (returnMatch) {
        componentHTML = returnMatch[1];
      } else {
        const jsxMatch = cleanedCode.match(/<[^>]+>[\s\S]*<\/[^>]+>/);
        if (jsxMatch) {
          componentHTML = jsxMatch[0];
        }
      }

      // Convert JSX to HTML
      componentHTML = componentHTML
        .replace(/className=/g, 'class=')
        .replace(/\{[^}]*\}/g, (match) => {
          if (match.includes("'") || match.includes('"')) {
            return match.replace(/[{}]/g, '').replace(/['"]/g, '');
          }
          if (match.includes('`')) {
            return match.replace(/[{}]/g, '').replace(/`/g, '');
          }
          return '';
        })
        .replace(/on[A-Z]\w+="[^"]*"/g, '')
        .replace(/on[A-Z]\w+=\{[^}]*\}/g, '')
        .replace(/<([^>]+)\/>/g, '<$1></$1>')
        .replace(/<Image([^>]*)\/>/g, (match, attrs) => {
          const srcMatch = attrs.match(/src="([^"]*)"/);
          const altMatch = attrs.match(/alt="([^"]*)"/);
          const src = srcMatch ? srcMatch[1] : 'https://picsum.photos/800/400';
          const alt = altMatch ? altMatch[1] : 'Image';
          return `<img src="${src}" alt="${alt}" class="w-full h-auto">`;
        });

      html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${project.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '${project.brandColors?.primary || '#FF6B00'}',
              secondary: '${project.brandColors?.secondary || project.brandColors?.primary || '#FF6B00'}',
            }
          }
        }
      }
    </script>
</head>
<body>
    ${componentHTML}
</body>
</html>`;
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self' https://funnelai-studio.vercel.app https://*.vercel.app localhost:* http://localhost:*",
      },
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    return new NextResponse('Failed to generate preview', { status: 500 });
  }
}