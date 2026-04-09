import { motion } from 'framer-motion';
import { MapPin, TrafficCone, Search, MessageSquare } from 'lucide-react';
import FeatureCard from './FeatureCard';

const features = [
  {
    icon: MapPin,
    title: 'Real-time Tactile Paving Navigation',
    description: 'Advanced blind path tracking with intelligent obstacle avoidance, ensuring safe and confident mobility.',
  },
  {
    icon: TrafficCone,
    title: 'Smart Crosswalk Assistant',
    description: 'Real-time traffic light and zebra crossing detection for safe street navigation.',
  },
  {
    icon: Search,
    title: 'Open-Vocabulary Object Search',
    description: 'Instantly locate any object using natural voice commands—no pre-training required.',
  },
  {
    icon: MessageSquare,
    title: 'Multimodal Voice AI',
    description: 'Powered by real-time LLM interactions for intelligent, context-aware conversations.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <span className="text-sm text-text-secondary">Core Capabilities</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            <span className="text-gradient">Intelligent Features</span>
            <br />
            <span className="text-text-primary">for Independent Living</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-text-secondary"
          >
            Our AI-powered smart glasses combine cutting-edge computer vision with natural language processing to provide a seamless navigation experience.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 flex justify-center"
        >
          <div className="glass px-8 py-4 rounded-full flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background"
                  style={{ opacity: 1 - (i - 1) * 0.2 }}
                />
              ))}
            </div>
            <span className="text-sm text-text-secondary">
              Trusted by <span className="text-text-primary font-medium">10,000+</span> users worldwide
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
