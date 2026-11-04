"use client";

import React from 'react';
import { motion } from 'motion/react';
import { PenTool, Hammer, Package, Layout, Ruler, Lightbulb } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    { 
      icon: PenTool, 
      title: 'Interior Design', 
      sub: 'Personalized consultations to transform your living spaces into a reflection of your personality.',
      details: 'Our expert designers work with you to understand your lifestyle, aesthetic preferences, and spatial requirements. We provide full 3D visualizations and material boards to help you see your dream home before it exists.'
    },
    { 
      icon: Hammer, 
      title: 'Custom Crafting', 
      sub: 'Each piece is tailored to your specific measurements and material preferences by master artisans.',
      details: 'From bespoke dining tables to custom-fitted wardrobes, our artisans use traditional techniques combined with modern technology to create furniture that fits your space perfectly.'
    },
    { 
      icon: Package, 
      title: 'White-Glove Setup', 
      sub: 'Room placement + assembly service so your furniture arrives ready to live beautifully.',
      details: 'Our professional delivery team handles everything. We place each piece in its designated room, perform full assembly, and remove all packaging materials, leaving your home spotless and styled.'
    },
    { 
      icon: Layout, 
      title: 'Space Planning', 
      sub: 'Optimizing your floor plan for better flow, functionality, and aesthetic balance.',
      details: 'We analyze your floor plan to ensure every square foot is used effectively. Our plans prioritize movement, lighting, and the perfect placement of key furniture pieces.'
    },
    { 
      icon: Ruler, 
      title: 'On-Site Measurement', 
      sub: 'Precision measuring services to ensure a perfect fit for every custom installation.',
      details: 'Our team visits your location to take precise measurements, accounting for architectural details, electrical outlets, and structural elements that might affect furniture placement.'
    },
    { 
      icon: Lightbulb, 
      title: 'Lighting Consultation', 
      sub: 'Expert advice on layering light to enhance the mood and functionality of your rooms.',
      details: 'We help you choose the right combination of ambient, task, and accent lighting to complement your furniture and create the perfect atmosphere in every room.'
    }
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="py-24 px-[5%] bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary uppercase tracking-[4px] text-sm font-black mb-4"
          >
            What we offer
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[48px] lg:text-[64px] font-bold leading-tight tracking-tight mb-6"
          >
            Bespoke Services for a <br className="hidden md:block" /> Beautiful Home.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted font-semibold max-w-[700px] mx-auto"
          >
            From initial concept to final installation, we provide a comprehensive range of services to help you create a space that is uniquely yours.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-[5%] max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-10 bg-background border border-border rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                <service.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{service.title}</h3>
              <p className="text-muted font-semibold mb-6 leading-relaxed">{service.sub}</p>
              <div className="h-px bg-border mb-6" />
              <p className="text-sm text-muted/80 font-medium leading-relaxed">{service.details}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-[5%]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto bg-primary text-white p-12 lg:p-20 rounded-3xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-[38px] lg:text-[48px] font-bold tracking-tight mb-6">Ready to start your project?</h2>
            <p className="text-white/70 font-semibold text-lg max-w-[600px] mx-auto mb-10">
              Book a free 30-minute consultation with one of our design experts to discuss your vision.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-secondary text-dark px-10 h-14 rounded-full text-[15px] font-bold uppercase tracking-wider hover:bg-secondary/90 transition-all">Book Consultation</button>
              <button className="px-10 h-14 rounded-full border border-white/55 text-white text-[15px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all">View Our Work</button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ServicesPage;
