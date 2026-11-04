"use client";

import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { AnnotatorPlugin } from '../annotationPlugin/AnnotatorPlugin';
import GetAllPages from './GetAllPages';
import { ContactForm } from '../contactpage/contactForm/ContactForm';
import ContactHero from '../contactpage/contactHero/ContactHero';
import { FAQ } from '../contactpage/faq/FAQ';
import { usePathname } from 'next/navigation';
import { Page } from '@/lib/store/pages/pageType';
import { setCurrentPages } from '@/lib/store/pages/pagesSlice';
import EditableText from '../shared/EditableText';

const ContactPage = () => {
  const { user: peekeeperUser } = useSelector((state: RootState) => state.auth);
  const { allPages, currentPages } = useSelector((state: RootState) => state.pages);
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).pop() || "contact";

  const dispatch = useDispatch();

  useEffect(() => {
    if (allPages && allPages.length > 0 && slug) {
      const currentPage = allPages.find((item: Page) => item.slug === slug);
      if (currentPage) {
        dispatch(setCurrentPages(currentPage));
      }
    }
  }, [allPages, slug, dispatch]);

  const lang = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] === "hi" ? "hi" : "en";
  }, [pathname]);

  const content = currentPages?.content || [];

  const getSection = (content: any[], title: string) => {
    return content?.find(
      (s: any) => s.adminTitle?.toLowerCase() === title.toLowerCase()
    );
  };

  const showroomSection = getSection(content, "Contact Showroom");
  const showProps = showroomSection?.props || {};

  const getV = (field: any) => {
    if (!field) return "";
    const val = field.value !== undefined ? field.value : field;
    if (val && typeof val === "object" && !Array.isArray(val))
      return val[lang] || val.en || "";
    return val || "";
  };

  const showroomTitle = getV(showProps.showroomTitle) || "Visit the Showroom";
  const showroomDesc = getV(showProps.showroomDesc) || "Experience premium furniture and free design consultations at our Raja Park showroom. Feel the quality of our craftsmanship in person.";
  const showroomHours = getV(showProps.showroomHours) || "Mon - Sat: 10:30 - 9:00";
  const mapLink = getV(showProps.mapLink) || "https://share.google/UcBYZ8kXdPXVpuhBt";

  return (
    <>
      {/* commentsS Plugin */}
      {peekeeperUser?.role === "admin" && <AnnotatorPlugin />}

      {/* get all page from the database */}
      <GetAllPages />
      <div className="pb-20 bg-background">
        {/* Editorial Hero Section */}
        <ContactHero />

        {/* Main Contact Section */}
        <ContactForm />

        {/* FAQ Section */}
        <FAQ />

        {/* Map Section - Minimalist */}
        <section className="px-[5%] max-w-7xl mx-auto pb-32">
          <div className="relative h-[600px] rounded-[60px] overflow-hidden border border-border shadow-2xl group">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.1622708907225!2d75.82064262512074!3d26.89834471070848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db74615ffdb4d%3A0x21afdb4e447341f4!2sPeekeeper%20Living!5e0!3m2!1sen!2sin!4v1776761345663!5m2!1sen!2sin" width="100% " height="100%" loading="lazy" ></iframe>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

            <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="bg-surface/80 backdrop-blur-xl p-10 rounded-[40px] border border-border max-w-md shadow-2xl">
                <h4 className="text-2xl font-black mb-4 tracking-tight">
                  <EditableText
                    value={showroomTitle}
                    currentPages={currentPages}
                    sectionId={showroomSection?.id}
                    fieldPath="props.showroomTitle"
                  />
                </h4>
                <p className="text-muted font-semibold mb-6">
                  <EditableText
                    value={showroomDesc}
                    currentPages={currentPages}
                    sectionId={showroomSection?.id}
                    fieldPath="props.showroomDesc"
                    tag="p"
                  />
                </p>
                <div className="flex items-center gap-3 text-secondary font-black uppercase tracking-widest text-xs">
                  <Clock size={16} />
                  <EditableText
                    value={showroomHours}
                    currentPages={currentPages}
                    sectionId={showroomSection?.id}
                    fieldPath="props.showroomHours"
                  />
                </div>
              </div>

              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-500"
              >
                <MapPin className="text-primary" size={32} />
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;
