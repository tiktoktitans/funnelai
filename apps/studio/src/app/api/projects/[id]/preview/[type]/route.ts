import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@funnelai/database/src/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; type: string } }
) {
  try {
    // Get project with specs
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

    // Get the appropriate content based on type
    const pageContent = params.type === 'thankyou'
      ? landingSpec.content.thankYouPage
      : landingSpec.content.landingPage;

    if (!pageContent) {
      return new NextResponse('Page content not found', { status: 404 });
    }

    // Clean the code by removing markdown code blocks and React imports
    let cleanedCode = pageContent
      .replace(/```[a-z]*\n?/g, '')
      .replace(/```$/g, '')
      .trim();

    // Extract just the component body (between return ( and the last ) before export or end)
    const returnMatch = cleanedCode.match(/return\s*\(([\s\S]*)\)\s*;?\s*}/);
    let componentHTML = '';

    if (returnMatch) {
      componentHTML = returnMatch[1];
    } else {
      // If no return statement found, try to extract JSX directly
      const jsxMatch = cleanedCode.match(/<[^>]+>[\s\S]*<\/[^>]+>/);
      if (jsxMatch) {
        componentHTML = jsxMatch[0];
      }
    }

    // Convert JSX to HTML
    componentHTML = componentHTML
      // Replace className with class
      .replace(/className=/g, 'class=')
      // Remove React-specific syntax
      .replace(/\{[^}]*\}/g, (match) => {
        // Handle simple string literals
        if (match.includes("'") || match.includes('"')) {
          return match.replace(/[{}]/g, '').replace(/['"]/g, '');
        }
        // Handle template literals
        if (match.includes('`')) {
          return match.replace(/[{}]/g, '').replace(/`/g, '');
        }
        return '';
      })
      // Remove onClick and other event handlers
      .replace(/on[A-Z]\w+="[^"]*"/g, '')
      .replace(/on[A-Z]\w+=\{[^}]*\}/g, '')
      // Fix self-closing tags
      .replace(/<([^>]+)\/>/g, '<$1></$1>')
      // Handle Image components (convert to img tags)
      .replace(/<Image([^>]*)\/>/g, (match, attrs) => {
        const srcMatch = attrs.match(/src="([^"]*)"/);
        const altMatch = attrs.match(/alt="([^"]*)"/);
        const src = srcMatch ? srcMatch[1] : 'https://picsum.photos/800/400';
        const alt = altMatch ? altMatch[1] : 'Image';
        return `<img src="${src}" alt="${alt}" class="w-full h-auto">`;
      });

    // Create full HTML page
    const html = `<!DOCTYPE html>
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
    <style>
      /* Additional styles for better rendering */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: system-ui, -apple-system, sans-serif;
      }
      /* Make forms look interactive even if they don't work */
      input, textarea, select {
        cursor: text;
      }
      button {
        cursor: pointer;
        transition: all 0.3s ease;
      }
      button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
    </style>
</head>
<body>
    ${componentHTML}
    <script>
      // Add some basic interactivity
      document.addEventListener('DOMContentLoaded', function() {
        // Make all buttons show alert on click
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            if (button.textContent.toLowerCase().includes('calendly')) {
              alert('Calendly integration would open here in production');
            } else if (button.textContent.toLowerCase().includes('submit') ||
                       button.textContent.toLowerCase().includes('get started') ||
                       button.textContent.toLowerCase().includes('claim')) {
              alert('Form would be submitted in production');
            } else {
              alert('Button clicked: ' + button.textContent);
            }
          });
        });

        // Make form submissions show alert
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Form submitted! This would process in production.');
          });
        });

        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          });
        });
      });
    </script>
</body>
</html>`;

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