import { ProblemProps } from '@funnelai/types';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';

export function Problem({ headline, bullets }: ProblemProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-12 text-3xl md:text-4xl font-bold text-center text-gray-900">
              {headline}
            </h2>

            <div className="space-y-6">
              {bullets.map((bullet, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-6 bg-red-50 rounded-lg border border-red-100"
                >
                  <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 text-lg">
                    {bullet}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-gray-100 rounded-lg">
              <p className="text-center text-gray-600 font-medium">
                If any of these sound familiar, you're not alone. But there's a better way...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}