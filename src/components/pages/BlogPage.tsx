"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Search, Tag, Calendar, User } from 'lucide-react';
import Link from 'next/link';

const BlogPage = () => {
  const posts = [
    { 
      id: 1,
      title: 'The Rise of Soft Minimalism', 
      tag: 'Design Trends', 
      date: 'Mar 15, 2026',
      author: 'Elena Rossi',
      img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200',
      excerpt: 'Soft minimalism is about creating spaces that are clean and uncluttered, but also warm and inviting. We explore how to achieve this balance in your own home.'
    },
    { 
      id: 2,
      title: 'Working with Sustainable Oak', 
      tag: 'Craftsmanship', 
      date: 'Mar 10, 2026',
      author: 'Julian Vane',
      img: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=1200',
      excerpt: 'Oak is a timeless material that is both durable and beautiful. We discuss our commitment to sustainable sourcing and how we work with this incredible wood.'
    },
    { 
      id: 3,
      title: 'Curating Your Home Gallery', 
      tag: 'Interior Tips', 
      date: 'Mar 05, 2026',
      author: 'Marcus Thorne',
      img: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=1200',
      excerpt: 'A well-curated home gallery can transform any room. We share our tips for choosing the right pieces and arranging them for maximum impact.'
    },
    { 
      id: 4,
      title: 'Layering Textures Like a Pro', 
      tag: 'Styling', 
      date: 'Feb 28, 2026',
      author: 'Sarah Jenkins',
      img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200',
      excerpt: 'Texture is the secret ingredient to a well-designed space. We show you how to layer different materials to create depth and interest in your rooms.'
    },
    { 
      id: 5,
      title: 'The Art of Small Space Living', 
      tag: 'Design Solutions', 
      date: 'Feb 20, 2026',
      author: 'Elena Rossi',
      img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200',
      excerpt: 'Living in a small space doesn\'t mean you have to compromise on style. We share our favorite furniture pieces and design tricks for compact homes.'
    },
    { 
      id: 6,
      title: 'Choosing the Perfect Lighting', 
      tag: 'Interior Tips', 
      date: 'Feb 15, 2026',
      author: 'Marcus Thorne',
      img: 'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&q=80&w=1200',
      excerpt: 'Lighting can make or break a room. We discuss the different types of lighting and how to use them to create the perfect atmosphere.'
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
            The Journal
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[48px] lg:text-[64px] font-bold leading-tight tracking-tight mb-6"
          >
            Inspiration for <br className="hidden md:block" /> Modern Living.
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-[600px] mx-auto relative mt-10"
          >
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full h-14 pl-14 pr-6 rounded-full bg-background border border-border outline-none focus:border-secondary transition-all font-semibold"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={20} />
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-24 px-[5%] max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-12 items-center bg-surface border border-border rounded-3xl overflow-hidden shadow-xl"
        >
          <div className="h-[400px] lg:h-[600px] overflow-hidden">
            <img src={posts[0].img} alt={posts[0].title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-8 lg:p-16">
            <div className="flex gap-4 items-center mb-6">
              <span className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider">{posts[0].tag}</span>
              <span className="text-muted text-xs font-bold flex items-center gap-1.5"><Calendar size={14} /> {posts[0].date}</span>
            </div>
            <h2 className="text-[38px] lg:text-[48px] font-bold leading-tight mb-6 tracking-tight">{posts[0].title}</h2>
            <p className="text-lg text-muted font-semibold mb-8 leading-relaxed">{posts[0].excerpt}</p>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-full bg-muted/20 overflow-hidden border border-border">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt={posts[0].author} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold">{posts[0].author}</p>
                <p className="text-xs text-muted font-semibold">Design Editor</p>
              </div>
            </div>
            <button className="bg-primary text-white px-10 h-14 rounded-full text-[15px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2">
              Read Article <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 px-[5%] max-w-7xl mx-auto pt-0">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.slice(1).map((post, idx) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-border mb-6 shadow-sm group-hover:shadow-xl transition-all duration-300">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex gap-4 items-center mb-4">
                <span className="text-[11px] text-secondary tracking-[2px] uppercase font-black">{post.tag}</span>
                <span className="text-muted text-[11px] font-bold">• {post.date}</span>
              </div>
              <h4 className="text-2xl font-bold mb-4 leading-tight group-hover:text-secondary transition-colors tracking-tight">{post.title}</h4>
              <p className="text-muted font-semibold text-sm leading-relaxed mb-6 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2.5">
                  <User size={14} className="text-muted" />
                  <span className="text-xs font-bold text-muted">{post.author}</span>
                </div>
                <ArrowRight size={18} className="text-secondary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pagination */}
      <section className="py-12 px-[5%] flex justify-center gap-3">
        {[1, 2, 3].map(page => (
          <button 
            key={page}
            className={`w-12 h-12 rounded-full border border-border flex items-center justify-center font-bold transition-all ${page === 1 ? 'bg-primary text-white border-primary' : 'hover:border-secondary hover:text-secondary'}`}
          >
            {page}
          </button>
        ))}
        <button className="w-12 h-12 rounded-full border border-border flex items-center justify-center font-bold hover:border-secondary hover:text-secondary transition-all">
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
};

export default BlogPage;
