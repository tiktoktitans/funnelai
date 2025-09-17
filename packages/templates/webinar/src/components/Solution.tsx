import { SolutionProps } from '@funnelai/types';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export function Solution({ headline, bullets }: SolutionProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white">
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
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-md border border-green-100"
                >
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 text-lg">
                    {bullet}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 p-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white text-center"
            >
              <p className="text-xl font-semibold">
                This is exactly what you'll learn in our exclusive training
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}