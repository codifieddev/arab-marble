"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Search, MessageCircle, Phone, Mail } from 'lucide-react';

const FAQPage = ({ initialData }: { initialData?: any }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract FAQs from initialData if available
  const cmsFaqs = initialData?.content?.flatMap((section: any) => 
    section.columns?.flatMap((col: any) => 
      col.filter((item: any) => item.type === 'features')
         .flatMap((item: any) => item.items?.map((f: any) => ({
           category: 'General',
           q: f.title,
           a: f.description
         })) || [])
    )
  ) || [];

  const faqs = cmsFaqs.length > 0 ? cmsFaqs : [
    { 
      category: 'General',
      q: 'Where is your furniture store located?', 
      a: 'Our premium furniture showroom is located in Raja Park, Jaipur. You are always welcome to visit us, check the quality of our solid wood, and try out our furniture in person before buying.' 
    },
    { 
      category: 'Shipping',
      q: 'Do you deliver furniture outside Jaipur?', 
      a: 'Yes, absolutely! While our main store is in Jaipur, we safely deliver our home furniture all across Rajasthan. Whether you live in Jodhpur, Udaipur, or any other city, we will bring your order right to your doorstep.' 
    },
    { 
      category: 'Customization',
      q: 'Can I get customized furniture for my home?', 
      a: 'Yes, we love making custom furniture! If you have a specific design, size, or color in mind, just let us know. We will create the perfect sofa, bed, or dining table that fits your home perfectly.' 
    },
    { 
      category: 'Quality',
      q: 'What type of wood do you use for your furniture?', 
      a: 'We mainly use high-quality solid wood, like pure Sheesham and Teak. These woods are very strong, look beautiful, and are naturally perfect for Rajasthan\'s hot and dry climate.' 
    },
    { 
      category: 'Delivery',
      q: 'Is it safe to buy heavy furniture online from your website?', 
      a: 'Yes, it is 100% safe. We use strong, multi-layer packaging to pack every item. Our trusted delivery team handles heavy solid wood furniture with great care so it reaches your home without a single scratch.' 
    },
    { 
      category: 'Care',
      q: 'How should I clean and take care of my solid wood furniture?', 
      a: 'It is very simple. Just wipe your furniture regularly with a soft, dry cloth. To keep the wood looking new for years, try to keep it away from direct sunlight and avoid putting hot mugs directly on the wooden surface.' 
    }
  ];

  const filteredFaqs = faqs.filter((faq: { q: string; a: string }) => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Support Center
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[48px] lg:text-[64px] font-bold leading-tight tracking-tight mb-6"
          >
            How can we help?
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-[600px] mx-auto relative mt-10"
          >
            <input 
              type="text" 
              placeholder="Search for answers..." 
              className="w-full h-14 pl-14 pr-6 rounded-full bg-background border border-border outline-none focus:border-secondary transition-all font-semibold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={20} />
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-24 px-[5%] max-w-4xl mx-auto">
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq: { q: string; a: string; category: string }, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-border rounded-2xl overflow-hidden bg-background hover:border-secondary/50 transition-all"
              >
                <button 
                  className="w-full p-8 flex justify-between items-center gap-6 text-left"
                  onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-[2px] text-secondary">{faq.category}</span>
                    <h4 className="text-xl font-bold tracking-tight">{faq.q}</h4>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeIndex === idx ? 'bg-secondary text-white' : 'bg-muted/10 text-muted'}`}>
                    {activeIndex === idx ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                <AnimatePresence>
                  {activeIndex === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-8 pt-0 text-muted font-semibold leading-relaxed border-t border-border/50 mt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-muted font-bold text-lg">No results found for "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-secondary font-black tracking-[2px] uppercase text-xs border-b border-secondary"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-24 px-[5%] bg-surface/50 border-y border-border">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-[38px] font-bold tracking-tight mb-12">Still have questions?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MessageCircle, title: 'Live Chat', sub: 'Chat with our support team in real-time.', action: 'Start Chat' },
              { icon: Phone, title: 'Phone Support', sub: 'Call us at +91 123 456 7890 (Mon-Fri).', action: 'Call Now' },
              { icon: Mail, title: 'Email Us', sub: 'Send us an email at support@peekeeper.com.', action: 'Send Email' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 bg-background border border-border rounded-2xl shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                  <item.icon size={28} />
                </div>
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className="text-sm text-muted font-semibold mb-8">{item.sub}</p>
                <button className="text-xs font-black tracking-[2px] uppercase text-secondary border-b border-secondary pb-1 hover:text-primary hover:border-primary transition-all">
                  {item.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
