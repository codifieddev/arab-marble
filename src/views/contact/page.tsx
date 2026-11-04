'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ContactPage() {
  const searchParams = useSearchParams();
  const prefillSubject = searchParams.get('subject') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: prefillSubject,
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (prefillSubject) {
      setFormData((prev) => ({ ...prev, subject: prefillSubject }));
    }
  }, [prefillSubject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      setErrorMessage('Please fill in your email and message.');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.message || 'Failed to send message. Please try again.');
        setStatus('error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Banner matching storefront theme */}
      <div
        className="relative py-24 bg-neutral-900 border-b border-neutral-200 text-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url('/images/page-banner.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/65 backdrop-brightness-85" />
        <div className="relative z-10 max-w-[1240px] mx-auto px-6">
          <h1
            className="text-4xl md:text-5xl font-light tracking-widest !text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
          >
            CONTACT US
          </h1>
        </div>
      </div>

      {/* Google Map Embed matching screenshot (Arab Marble Est, Musaffah M9) */}
      <div className="max-w-[1240px] mx-auto px-6 pt-12">
        <div className="w-full h-[380px] md:h-[450px] overflow-hidden border border-neutral-200 shadow-sm relative">
          <iframe
            title="Arab Marble Est Location Map"
            src="https://maps.google.com/maps?q=Arab%20Marble%20Est,%209th%20St,%20Musaffah%20Industrial%20Area%20M9,%20Abu%20Dhabi&t=&z=14&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>

      {/* Two Column Section: Contact Us (Left) & Email Us (Right) */}
      <div className="max-w-[1240px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Left Column: Contact Us Details */}
          <div>
            <h2 className="text-2xl font-normal text-neutral-800 mb-8 tracking-wide">
              Contact Us
            </h2>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">
                    Phone
                  </div>
                  <a
                    href="tel:+97125554008"
                    className="text-base text-neutral-800 hover:text-black font-normal"
                  >
                    +971 2 555 4008
                  </a>
                </div>
              </div>

              {/* FAX */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V3"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">
                    FAX
                  </div>
                  <div className="text-base text-neutral-800 font-normal">
                    +971 2 555 4005
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">
                    Email
                  </div>
                  <a
                    href="mailto:am@arabmarble.ae"
                    className="text-base text-neutral-800 hover:text-black font-normal"
                  >
                    am@arabmarble.ae
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">
                    Address
                  </div>
                  <div className="text-base text-neutral-800 font-normal leading-relaxed">
                    Arab Marble, Musaffah Abu Dhabi – UAE
                    <br />
                    P.O.Box: 3835
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Email Us Form */}
          <div>
            <h2 className="text-2xl font-normal text-neutral-800 mb-8 tracking-wide">
              Email Us
            </h2>

            {status === 'success' && (
              <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                Thank you. Your message has been received. Our team will get back to you shortly.
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 text-sm text-neutral-800 focus:outline-none focus:border-neutral-600 transition-colors"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 text-sm text-neutral-800 focus:outline-none focus:border-neutral-600 transition-colors"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 text-sm text-neutral-800 focus:outline-none focus:border-neutral-600 transition-colors"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  placeholder="Message *"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 text-sm text-neutral-800 focus:outline-none focus:border-neutral-600 transition-colors resize-y"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-3 bg-[#404040] hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
