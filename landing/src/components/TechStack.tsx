import { motion } from 'framer-motion';

const technologies = [
  { name: 'YOLO', category: 'Computer Vision' },
  { name: 'MediaPipe', category: 'Hand Tracking' },
  { name: 'DashScope LLM', category: 'AI Model' },
  { name: 'ESP32', category: 'Hardware' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'PyTorch', category: 'ML Framework' },
  { name: 'OpenCV', category: 'Image Processing' },
  { name: 'WebSocket', category: 'Real-time' },
];

export default function TechStack() {
  return (
    <section id="technology" className="relative py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <span className="text-sm text-text-secondary">Tech Stack</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight"
          >
            Built with{' '}
            <span className="text-gradient">Cutting-Edge</span>
            <br />
            Technology
          </motion.h2>
        </div>

        {/* Tech tags grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="glass-card p-6 text-center group cursor-default"
            >
              <div className="text-lg font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                {tech.name}
              </div>
              <div className="text-xs text-text-tertiary uppercase tracking-wider">
                {tech.category}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Animated marquee of tech names */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 overflow-hidden"
        >
          <div className="relative">
            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

            {/* Scrolling content */}
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex gap-8 whitespace-nowrap"
            >
              {[...technologies, ...technologies, ...technologies, ...technologies].map((tech, index) => (
                <span
                  key={`${tech.name}-${index}`}
                  className="text-6xl sm:text-7xl md:text-8xl font-bold text-white/[0.03] select-none"
                >
                  {tech.name}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
