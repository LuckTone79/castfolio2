'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const scaleVariants: any = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function PortfolioDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock data - replace with actual data from API
  const portfolio = {
    id: '1',
    title: 'Global Brand Identity System',
    category: 'Branding',
    client: 'Luxury Tech Startup',
    date: '2024',
    description:
      'A comprehensive brand identity redesign for a luxury technology startup entering the global market. The project included a complete visual system, guidelines, and implementation across digital and physical touchpoints.',
    heroImage:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=600&fit=crop',
    overview:
      'Working with a forward-thinking tech startup, we developed a brand identity that balances luxury aesthetics with technological innovation. The system was designed to scale across 30+ markets while maintaining cohesive brand presence.',
    metrics: [
      { label: 'Market Coverage', value: '32 Countries', icon: '🌍' },
      { label: 'Brand Recognition', value: '+84%', icon: '📈' },
      { label: 'Implementation Speed', value: '6 Months', icon: '⚡' },
      { label: 'Design Assets', value: '500+', icon: '🎨' },
    ],
    process: [
      {
        step: 'Research & Discovery',
        description:
          'Deep dive into market positioning, competitive landscape, and target audience psychology',
      },
      {
        step: 'Concept Development',
        description:
          'Ideation and exploration of 20+ design directions aligned with brand values',
      },
      {
        step: 'Refinement & Systems',
        description:
          'Development of comprehensive design systems and brand guidelines',
      },
      {
        step: 'Implementation & Training',
        description: 'Global rollout with stakeholder training and support',
      },
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
    ],
    technologies: [
      'Adobe Creative Suite',
      'Figma',
      'Design Systems',
      'Brand Strategy',
      'Typography',
      'Color Theory',
    ],
    testimonial: {
      text: 'The team delivered beyond expectations. The brand system we received was not just beautiful, but strategically sound and incredibly practical for global implementation.',
      author: 'Sarah Chen',
      role: 'CMO, Luxury Tech Startup',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    results: [
      'Increased brand awareness by 84% in target markets',
      'Reduced time to market in new regions by 40%',
      'Achieved 98% brand consistency across global touchpoints',
      'Generated 12M+ impressions in first 6 months',
    ],
    relatedProjects: [
      {
        id: '2',
        title: 'E-Commerce Platform Redesign',
        category: 'Digital Product',
        image:
          'https://images.unsplash.com/photo-1460925895917-adf4e565db15?w=400&h=300&fit=crop',
      },
      {
        id: '3',
        title: 'Sustainable Packaging Design',
        category: 'Packaging',
        image:
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop',
      },
      {
        id: '4',
        title: 'Web Experience Platform',
        category: 'Web Design',
        image:
          'https://images.unsplash.com/photo-1559163499-fb2e4250aa26?w=400&h=300&fit=crop',
      },
    ],
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white text-gray-900"
    >
      {/* Navigation */}
      <motion.nav variants={itemVariants} className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <motion.a
            href="/"
            whileHover={{ x: -4 }}
            className="font-light text-sm tracking-widest uppercase text-gray-600 hover:text-gray-900 transition"
          >
            ← Back
          </motion.a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{portfolio.category}</span>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section variants={itemVariants} className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div variants={containerVariants} className="space-y-8">
            <div className="space-y-4">
              <motion.span variants={itemVariants} className="text-sm uppercase tracking-[0.2em] text-gray-500 font-light">
                {portfolio.client} • {portfolio.date}
              </motion.span>
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-light leading-tight tracking-tight"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {portfolio.title}
              </motion.h1>
            </div>

            <motion.p variants={itemVariants} className="text-lg text-gray-600 max-w-2xl leading-relaxed font-light">
              {portfolio.description}
            </motion.p>
          </motion.div>
        </div>

        {/* Hero Image */}
        <motion.div
          variants={scaleVariants}
          className="mt-16 max-w-7xl mx-auto px-6 md:px-12"
        >
          <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={portfolio.heroImage}
              alt={portfolio.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Overview Section */}
      <motion.section variants={itemVariants} className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl md:text-3xl font-light mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                Project Overview
              </h2>
              <p className="text-gray-600 leading-relaxed font-light text-base">
                {portfolio.overview}
              </p>
            </div>

            {/* Metrics */}
            <motion.div variants={containerVariants} className="grid grid-cols-2 gap-8">
              {portfolio.metrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="space-y-3 p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="text-3xl">{metric.icon}</div>
                  <div className="text-2xl font-light" style={{ fontFamily: 'Georgia, serif' }}>
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-600 uppercase tracking-widest font-light">
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Process Section */}
      <motion.section variants={itemVariants} className="py-20 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-light mb-16"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Our Approach
          </motion.h2>

          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {portfolio.process.map((item, idx) => (
              <motion.div key={idx} variants={itemVariants} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-light text-gray-400">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="h-px bg-gray-300 flex-grow" />
                </div>
                <h3 className="text-lg font-light" style={{ fontFamily: 'Georgia, serif' }}>
                  {item.step}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Gallery Section */}
      <motion.section variants={itemVariants} className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-light mb-12"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Project Work
          </motion.h2>

          {/* Main Gallery Image */}
          <motion.div
            variants={scaleVariants}
            className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-8"
          >
            <Image
              src={portfolio.galleryImages[currentImageIndex]}
              alt="Gallery"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Gallery Navigation */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-light">
              {currentImageIndex + 1} / {portfolio.galleryImages.length}
            </span>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? portfolio.galleryImages.length - 1 : prev - 1
                  )
                }
                className="p-3 rounded-full border border-gray-300 hover:border-gray-900 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === portfolio.galleryImages.length - 1 ? 0 : prev + 1
                  )
                }
                className="p-3 rounded-full border border-gray-300 hover:border-gray-900 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Technologies Section */}
      <motion.section variants={itemVariants} className="py-20 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-light mb-12"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Technologies & Tools
          </motion.h2>

          <motion.div variants={containerVariants} className="flex flex-wrap gap-4">
            {portfolio.technologies.map((tech, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-light hover:border-gray-900 transition"
              >
                {tech}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Results Section */}
      <motion.section variants={itemVariants} className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-light" style={{ fontFamily: 'Georgia, serif' }}>
                Results & Impact
              </h2>
            </div>

            <motion.div variants={containerVariants} className="space-y-6">
              {portfolio.results.map((result, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="flex gap-4 items-start"
                >
                  <div className="w-1 h-1 bg-gray-900 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed font-light">{result}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonial Section */}
      <motion.section variants={itemVariants} className="py-20 border-t border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <motion.blockquote variants={containerVariants} className="text-center space-y-8">
            <motion.p
              variants={itemVariants}
              className="text-3xl md:text-4xl font-light leading-relaxed"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              &quot;{portfolio.testimonial.text}&quot;
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                <Image
                  src={portfolio.testimonial.image}
                  alt={portfolio.testimonial.author}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="font-light">{portfolio.testimonial.author}</p>
                <p className="text-sm text-gray-600 font-light">
                  {portfolio.testimonial.role}
                </p>
              </div>
            </motion.div>
          </motion.blockquote>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section variants={itemVariants} className="py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-8">
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-light" style={{ fontFamily: 'Georgia, serif' }}>
              Let&apos;s Create Something Remarkable
            </h2>
            <p className="text-gray-600 font-light">
              Ready to transform your brand or launch your next project?
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gray-900 text-white rounded-lg font-light flex items-center justify-center gap-2 hover:bg-gray-800 transition"
            >
              Start a Project <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 border border-gray-300 rounded-lg font-light hover:border-gray-900 transition"
            >
              Get in Touch
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Related Projects */}
      <motion.section variants={itemVariants} className="py-20 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-light mb-12"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Other Projects
          </motion.h2>

          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {portfolio.relatedProjects.map((project, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 mb-6">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-gray-600 font-light">
                    {project.category}
                  </p>
                  <h3 className="text-lg font-light" style={{ fontFamily: 'Georgia, serif' }}>
                    {project.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 border border-gray-300 rounded-lg font-light hover:border-gray-900 transition inline-flex items-center gap-2"
            >
              View All Projects <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer variants={itemVariants} className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-600 font-light">
          <p>© 2024 Castfolio. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gray-900 transition">
              Instagram
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              LinkedIn
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Twitter
            </a>
          </div>
        </div>
      </motion.footer>
    </motion.main>
  );
}
