import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  className?: string;
}

export default function FeatureCard({ icon: Icon, title, description, index, className = '' }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`glass-card-hover p-8 ${className}`}
    >
      {/* Icon container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
        <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center">
          <Icon className="w-7 h-7 text-primary" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-text-primary mb-3">
        {title}
      </h3>
      <p className="text-text-secondary leading-relaxed">
        {description}
      </p>

      {/* Decorative gradient line */}
      <div className="mt-6 h-px w-16 bg-gradient-to-r from-primary/50 to-transparent" />
    </motion.div>
  );
}
