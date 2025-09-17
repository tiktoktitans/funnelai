import { ProofProps } from '@funnelai/types';
import { motion } from 'framer-motion';
import { TrendingUp, Award } from 'lucide-react';

export function Proof({ headline, caseStudies }: ProofProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl"
        >
          <h2 className="mb-12 text-3xl md:text-4xl font-bold text-center text-gray-900">
            {headline}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="absolute -top-4 -right-4">
                  <Award className="h-8 w-8 text-orange-500" />
                </div>

                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {study.title}
                </h3>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-orange-600">
                    {study.metric}
                  </p>
                  <p className="text-gray-600">
                    {study.line}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Verified Result</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 p-8 bg-blue-50 rounded-lg text-center"
          >
            <p className="text-lg text-gray-700">
              <span className="font-bold">Over 10,000+ students</span> have transformed their business
              using our proven strategies
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}