import { CTAProps } from '@funnelai/types';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock } from 'lucide-react';

export function CTA({ headline, sub, primary, secondary }: CTAProps) {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="mb-6 text-3xl md:text-4xl font-bold text-white">
            {headline}
          </h2>

          <p className="mb-8 text-xl text-orange-100">
            {sub}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={primary.href}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-orange-600 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            >
              {primary.label}
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.a>

            {secondary && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={secondary.href}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
              >
                {secondary.label}
              </motion.a>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-orange-100">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>100% Free to Attend</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Limited Time Only</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg"
          >
            <p className="text-white font-medium">
              ⚡ Only 500 spots available. 387 already claimed!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}