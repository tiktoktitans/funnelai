import { HeroProps } from '@funnelai/types';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock } from 'lucide-react';

export function Hero({ eyebrow, headline, subheadline, cta, proofLogos }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          {eyebrow && (
            <span className="inline-block px-4 py-1 mb-6 text-sm font-semibold text-orange-600 bg-orange-100 rounded-full">
              {eyebrow}
            </span>
          )}

          <h1 className="mb-6 text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            {headline}
          </h1>

          <p className="mb-8 text-xl text-gray-600">
            {subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={cta.href}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-orange-600 rounded-lg shadow-lg hover:bg-orange-700 transition-colors"
            >
              {cta.label}
            </motion.a>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Next Session: Tomorrow</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>2,847 Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>60 Minutes</span>
            </div>
          </div>

          {proofLogos && proofLogos.length > 0 && (
            <div className="mt-12 pt-12 border-t border-gray-200">
              <p className="mb-6 text-sm text-gray-500">Trusted by industry leaders</p>
              <div className="flex flex-wrap justify-center gap-8">
                {proofLogos.map((logo, index) => (
                  <div key={index} className="h-8 w-24 bg-gray-300 rounded" />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}