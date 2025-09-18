import { promises as fs } from 'fs';
import path from 'path';
import { Hero } from '../components/Hero';
import { Problem } from '../components/Problem';
import { Solution } from '../components/Solution';
import { Proof } from '../components/Proof';
import { CTA } from '../components/CTA';

async function getSpec() {
  try {
    // Read spec at runtime (development)
    const specPath = path.join(process.cwd(), 'public', 'specs', 'landing.json');
    const specContent = await fs.readFile(specPath, 'utf-8');
    return JSON.parse(specContent);
  } catch (error) {
    // Fallback for production (specs injected at build time)
    try {
      const specPath = path.join(process.cwd(), 'specs', 'landing.json');
      const specContent = await fs.readFile(specPath, 'utf-8');
      return JSON.parse(specContent);
    } catch {
      // Default spec if not found
      return {
        copy: {
          hero: {
            headline: "Transform Your Business",
            subheadline: "Join our exclusive training",
            cta: { label: "Register Now", href: "/apply" }
          },
          problem: {
            headline: "Common Challenges",
            bullets: ["Challenge 1", "Challenge 2", "Challenge 3"]
          },
          solution: {
            headline: "Our Solution",
            bullets: ["Solution 1", "Solution 2", "Solution 3"]
          },
          proof: {
            headline: "Success Stories",
            caseStudies: [
              { title: "Client A", metric: "$100k", line: "in 30 days" }
            ]
          },
          cta: {
            headline: "Ready to Start?",
            sub: "Limited spots available",
            primary: { label: "Get Started", href: "/apply" }
          }
        },
        structure: {
          layout: "WebinarLanding",
          sections: [
            { type: "Hero", propsRef: "copy.hero" },
            { type: "Problem", propsRef: "copy.problem" },
            { type: "Solution", propsRef: "copy.solution" },
            { type: "Proof", propsRef: "copy.proof" },
            { type: "CTA", propsRef: "copy.cta" }
          ]
        }
      };
    }
  }
}

function resolveProps(spec: any, propsRef: string) {
  const keys = propsRef.split('.');
  let result = spec;
  for (const key of keys) {
    result = result?.[key];
  }
  return result || {};
}

export default async function LandingPage() {
  const spec = await getSpec();

  const renderSection = (section: any) => {
    const props = resolveProps(spec, section.propsRef);

    switch (section.type) {
      case 'Hero':
        return <Hero key="hero" {...props} />;
      case 'Problem':
        return <Problem key="problem" {...props} />;
      case 'Solution':
        return <Solution key="solution" {...props} />;
      case 'Proof':
        return <Proof key="proof" {...props} />;
      case 'CTA':
        return <CTA key="cta" {...props} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen">
      {spec.structure?.sections?.map(renderSection) || (
        <>
          <Hero {...spec.copy?.hero} />
          <Problem {...spec.copy?.problem} />
          <Solution {...spec.copy?.solution} />
          <Proof {...spec.copy?.proof} />
          <CTA {...spec.copy?.cta} />
        </>
      )}
    </main>
  );
}