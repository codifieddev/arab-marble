"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import GetAllPages from "./GetAllPages";
import { AnnotatorPlugin } from "../annotationPlugin/AnnotatorPlugin";
import AboutPeekeeper from "../aboutpage/aboutPeekeeper/AboutPeekeeper";
import OurStory from "../aboutpage/ourStory/OurStory";
import Difference from "../aboutpage/difference/Difference";
import OurProcess from "../aboutpage/ourProcess/OurProcess";
import DesignPhilosophy from "../aboutpage/designPhilosophy/DesignPhilosophy";
import WhyChooseUs from "../aboutpage/whyChooseUs/WhyChooseUs";
import StatsSection from "../aboutpage/statsSection/StatsSection";
import { resetPageComments } from "@/lib/store/comments/commentSlice";
import { usePathname } from "next/navigation";
import { Page } from "@/lib/store/pages/pageType";
import { setCurrentPages } from "@/lib/store/pages/pagesSlice";





const AboutPage = () => {
  const { user: peekeeperUser } = useSelector((state: RootState) => state.auth);
  const { allPages, currentPages } = useSelector((state: RootState) => state.pages);
  const pathname = usePathname();
  const slug = pathname.split("/").filter(Boolean).pop();

  const dispatch = useDispatch();

  useEffect(() => {
    if (allPages && allPages.length > 0 && slug) {
      const currentPage = allPages.find((item: Page) => item.slug === slug);
      if (currentPage) {
        dispatch(setCurrentPages(currentPage));
      }
    }
  }, [allPages, slug, dispatch]);

  const content = currentPages?.content || [];

  const getSection = (content: any[], title: string) => {
    return content?.find(
      (s: any) => s.adminTitle?.toLowerCase() === title.toLowerCase()
    );
  };

  return (
    <>

      <GetAllPages />

      <div data-annotate-id="about-page-root" className="bg-background text-foreground">
        <AboutPeekeeper section={getSection(content, "About Peekeeper")} />
        <StatsSection section={getSection(content, "Stats Section")} />
        <OurStory section={getSection(content, "Our Story")} />
        <Difference section={getSection(content, "Difference Section")} />
        <OurProcess section={getSection(content, "Our Process")} />
        <DesignPhilosophy section={getSection(content, "Design Philosophy")} />
        <WhyChooseUs section={getSection(content, "Why Choose Us")} />
      </div>
    </>
  );
};

export default AboutPage;











// "use client";

// import React, { useEffect } from "react";
// import { motion } from "motion/react";
// import {
//   ArrowRight,
//   BadgeCheck,
//   CheckCircle2,
//   HeartHandshake,
//   Leaf,
//   RefreshCcw,
//   Ruler,
//   ShieldCheck,
//   Sofa,
//   Sparkles,
//   Truck,
// } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/lib/store/store";
// import GetAllPages from "./GetAllPages";
// import { AnnotatorPlugin } from "../annotationPlugin/AnnotatorPlugin";
// import { resetPageComments } from "@/lib/store/comments/commentSlice";

// const stats = [
//   { value: "12+", label: "Years of Craftsmanship" },
//   { value: "8k+", label: "Homes Furnished" },
//   { value: "150+", label: "Design-Led Pieces" },
//   { value: "24/7", label: "Customer Support" },
// ];

// const values = [
//   {
//     icon: Leaf,
//     title: "Sustainable Materials",
//     desc: "We source premium woods, fabrics, and finishes with a long-term view on quality and responsibility.",
//   },
//   {
//     icon: BadgeCheck,
//     title: "Made to Last",
//     desc: "Every detail is engineered for daily living, from frame strength to stitching precision.",
//   },
//   {
//     icon: HeartHandshake,
//     title: "Human-Centered Design",
//     desc: "Our furniture is built around comfort, proportion, and the way real people live at home.",
//   },
//   {
//     icon: Sparkles,
//     title: "Timeless Aesthetic",
//     desc: "We create versatile pieces that feel modern today and still beautiful years from now.",
//   },
// ];

// const process = [
//   {
//     step: "01",
//     title: "Design First",
//     desc: "Each collection begins with a clear design language focused on comfort, silhouette, and utility.",
//   },
//   {
//     step: "02",
//     title: "Material Selection",
//     desc: "We carefully choose woods, metals, foams, fabrics, and finishes for both durability and feel.",
//   },
//   {
//     step: "03",
//     title: "Craft & Build",
//     desc: "Our makers shape, stitch, assemble, and finish every piece with close attention to detail.",
//   },
//   {
//     step: "04",
//     title: "Deliver & Support",
//     desc: "From doorstep delivery to after-sales care, we make ownership smooth and reliable.",
//   },
// ];

// const assurances = [
//   {
//     icon: Truck,
//     title: "Fast Delivery",
//     desc: "Doorstep shipping with careful packaging and reliable updates at every stage.",
//   },
//   {
//     icon: ShieldCheck,
//     title: "Secure Checkout",
//     desc: "Safe transactions and trusted systems to protect your purchase and data.",
//   },
//   {
//     icon: RefreshCcw,
//     title: "Easy Returns",
//     desc: "Changed your mind? Our return support is designed to be simple and stress-free.",
//   },
//   {
//     icon: Ruler,
//     title: "Made for Real Spaces",
//     desc: "Pieces designed with practical sizing, everyday comfort, and lasting usability.",
//   },
// ];

// const AboutPage = () => {
//     const {peekeeperUser}= useSelector((state:RootState)=>state.auth)
//    const dispatch= useDispatch()
//     //update the page
//     // useEffect(()=>{
//     //   dispatch(resetPageComments())
//     // },[])
//   return (
//     <>
//         {/* commentsS Plugin */}
//    {peekeeperUser?.role=="admin" && <AnnotatorPlugin />}
//    {/* get all page from the database */}
//    <GetAllPages/>
         
//     <div data-annotate-id="about-page-root" className="bg-background text-foreground">
//       {/* HERO */}
//       <section
//         data-annotate-id="about-hero-section"
//         className="relative overflow-hidden border-b border-border bg-[#0f1f17] text-white"
//       >
//         <div className="absolute inset-0">
//           <img
//             src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1800"
//             alt="Peekeeper living room"
//             className="h-full w-full object-cover opacity-35"
//           />
//           <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" />
//         </div>

//         <div className="relative mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-[5%] py-24 lg:grid-cols-[1.1fr_0.9fr]">
//           <div>
//             <motion.p
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mb-5 text-[12px] font-black uppercase tracking-[4px] text-secondary"
//             >
//               About Peekeeper
//             </motion.p>

//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.08 }}
//               className="max-w-[780px] font-heading text-[30px] font-bold leading-[0.95] tracking-tight sm:text-[40px] lg:text-[50px]"
//             >
//               Furniture that brings
//               <br />
//               warmth, purpose, and
//               <br />
//               modern character home.
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.14 }}
//               className="mt-6 max-w-[620px] text-[16px] font-semibold leading-8 text-white/80 sm:text-[18px]"
//             >
//               Since 2012, Peekeeper has been creating design-led furniture that
//               blends sculptural form with everyday function—helping people build
//               homes that feel calm, personal, and beautifully lived in.
//             </motion.p>

//             <motion.div
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="mt-9 flex flex-wrap gap-4"
//             >
//               <a
//                 href="/shop"
//                 className="inline-flex h-12 items-center rounded-full bg-secondary px-6 text-[13px] font-black uppercase tracking-[2px] text-black transition hover:opacity-90"
//               >
//                 Explore Collection
//               </a>
//               <a
//                 href="/contact"
//                 className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-[13px] font-black uppercase tracking-[2px] text-white transition hover:bg-white/10"
//               >
//                 Contact Us
//               </a>
//             </motion.div>
//           </div>

//           <motion.div
//             initial={{ opacity: 0, scale: 0.96 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.18 }}
//             className="grid gap-4 sm:grid-cols-2"
//           >
//             <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/10 backdrop-blur-md">
//               <img
//                 src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1200"
//                 alt="Sofa interior"
//                 className="h-[240px] w-full object-cover"
//               />
//             </div>
//             <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/10 backdrop-blur-md sm:translate-y-10">
//               <img
//                 src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200"
//                 alt="Chair and decor"
//                 className="h-[240px] w-full object-cover"
//               />
//             </div>
//             {/* <div className="rounded-[26px] border border-white/10 bg-white/10 p-6 backdrop-blur-md sm:col-span-2">
//               <div className="flex items-center gap-3">
//                 <Sofa className="text-secondary" size={24} />
//                 <p className="text-[13px] font-black uppercase tracking-[2px] text-secondary">
//                   Design Philosophy
//                 </p>
//               </div>
//               <p className="mt-4 max-w-[580px] text-[15px] font-semibold leading-7 text-white/80">
//                 We believe furniture should feel elevated without feeling
//                 distant—comfortable enough for daily life, refined enough to
//                 define the room.
//               </p>
//             </div> */}
//           </motion.div>
//         </div>
//       </section>

//       {/* STATS */}
//       <section
//         data-annotate-id="about-stats-section"
//         className="border-b border-border bg-surface px-[5%] py-8"
//       >
//         <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           {stats.map((item, idx) => (
//             <motion.div
//               key={item.label}
//               initial={{ opacity: 0, y: 18 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: idx * 0.08 }}
//               className="rounded-2xl border border-border bg-background px-6 py-6 text-center"
//             >
//               <div className="text-[34px] font-bold tracking-tight text-foreground">
//                 {item.value}
//               </div>
//               <div className="mt-2 text-[13px] font-black uppercase tracking-[2px] text-muted">
//                 {item.label}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       {/* STORY + MISSION */}
//       <section
//         data-annotate-id="about-story-section"
//         className="mx-auto max-w-7xl px-[5%] py-24"
//       >
//         <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
//           <motion.div
//             initial={{ opacity: 0, x: -24 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             className="overflow-hidden rounded-[28px] border border-border shadow-xl"
//           >
//             <img
//               src="https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=1400"
//               alt="Craftsmanship workshop"
//               className="h-full w-full object-cover"
//             />
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, x: 24 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//           >
//             <p className="mb-3 text-[12px] font-black uppercase tracking-[3px] text-secondary">
//               Our Story
//             </p>
//             <h2 className="max-w-[700px] text-[34px] font-bold leading-tight tracking-tight sm:text-[42px]">
//               Built around thoughtful living, not just furniture.
//             </h2>

//             <p className="mt-6 text-[16px] font-semibold leading-8 text-muted">
//               Peekeeper started with a simple belief: the furniture you live with
//               every day should be both beautiful and deeply usable. We saw too
//               many homes forced to choose between comfort, quality, and design.
//               Our goal was to remove that compromise.
//             </p>

//             <p className="mt-5 text-[16px] font-semibold leading-8 text-muted">
//               Today, we create collections for living rooms, bedrooms, dining
//               spaces, work corners, and beyond—pieces designed to settle into
//               real homes with ease while still making a strong visual statement.
//             </p>

//             <div className="mt-8 grid gap-4">
//               {[
//                 "Sustainably sourced premium materials",
//                 "Artisanal craftsmanship in every detail",
//                 "Timeless forms with everyday comfort",
//                 "Quality-focused production and support",
//               ].map((item) => (
//                 <div
//                   key={item}
//                   className="flex items-center gap-3 font-bold text-foreground/90"
//                 >
//                   <CheckCircle2 className="text-secondary" size={20} />
//                   <span>{item}</span>
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* VALUES */}
//       <section
//         data-annotate-id="about-values-section"
//         className="border-y border-border bg-surface/50 px-[5%] py-24"
//       >
//         <div className="mx-auto max-w-7xl">
//           <div className="mb-16 text-center">
//             <p className="mb-3 text-[12px] font-black uppercase tracking-[3px] text-secondary">
//               What Defines Us
//             </p>
//             <h2 className="text-[34px] font-bold tracking-tight sm:text-[42px]">
//               The Peekeeper difference
//             </h2>
//             <p className="mx-auto mt-4 max-w-3xl text-[16px] font-semibold leading-8 text-muted">
//               We design with intention, build with care, and support every order
//               with the same attention we give to the furniture itself.
//             </p>
//           </div>

//           <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
//             {values.map((item, idx) => (
//               <motion.div
//                 key={item.title}
//                 initial={{ opacity: 0, y: 18 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: idx * 0.08 }}
//                 className="rounded-[22px] border border-border bg-background p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
//               >
//                 <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
//                   <item.icon className="text-secondary" size={26} />
//                 </div>
//                 <h3 className="text-[18px] font-bold tracking-tight">
//                   {item.title}
//                 </h3>
//                 <p className="mt-3 text-[14px] font-semibold leading-7 text-muted">
//                   {item.desc}
//                 </p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* PROCESS */}
//       <section
//         data-annotate-id="about-process-section"
//         className="mx-auto max-w-7xl px-[5%] py-24"
//       >
//         <div className="mb-14 max-w-3xl">
//           <p className="mb-3 text-[12px] font-black uppercase tracking-[3px] text-secondary">
//             Our Process
//           </p>
//           <h2 className="text-[34px] font-bold tracking-tight sm:text-[42px]">
//             How we turn ideas into lasting pieces
//           </h2>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
//           {process.map((item, idx) => (
//             <motion.div
//               key={item.step}
//               initial={{ opacity: 0, y: 18 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: idx * 0.07 }}
//               className="rounded-[22px] border border-border bg-surface p-7"
//             >
//               <div className="text-[12px] font-black uppercase tracking-[3px] text-secondary">
//                 Step {item.step}
//               </div>
//               <h3 className="mt-4 text-[22px] font-bold tracking-tight">
//                 {item.title}
//               </h3>
//               <p className="mt-3 text-[14px] font-semibold leading-7 text-muted">
//                 {item.desc}
//               </p>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       {/* MATERIALS / SHOWROOM */}
//       <section
//         data-annotate-id="about-materials-section"
//         className="border-y border-border bg-[#f7f4ef] px-[5%] py-24"
//       >
//         <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
//           <motion.div
//             initial={{ opacity: 0, y: 18 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="grid gap-5 sm:grid-cols-2"
//           >
//             <div className="overflow-hidden rounded-[24px] border border-[#e4ddd3] shadow-lg sm:translate-y-8">
//               <img
//                 src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200"
//                 alt="Interior setup"
//                 className="h-full w-full object-cover"
//               />
//             </div>
//             <div className="overflow-hidden rounded-[24px] border border-[#e4ddd3] shadow-lg">
//               <img
//                 src="https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=1200"
//                 alt="Furniture detail"
//                 className="h-full w-full object-cover"
//               />
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, x: 22 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//           >
//             <p className="mb-3 text-[12px] font-black uppercase tracking-[3px] text-secondary">
//               Design Philosophy
//             </p>
//             <h2 className="text-[34px] font-bold tracking-tight sm:text-[42px]">
//               Materials, comfort, and form—balanced with purpose.
//             </h2>
//             <p className="mt-6 text-[16px] font-semibold leading-8 text-[#665f58]">
//               From soft upholstery and structured foam to warm woods and refined
//               finishes, every element is chosen to enhance how a piece looks,
//               feels, and lasts in the home.
//             </p>
//             <p className="mt-5 text-[16px] font-semibold leading-8 text-[#665f58]">
//               We don’t chase noise. We focus on proportion, texture, calm
//               palettes, and strong silhouettes that make everyday spaces feel
//               more complete.
//             </p>

//             <div className="mt-8 flex flex-wrap gap-3">
//               {[
//                 "Solid wood details",
//                 "Comfort-first cushioning",
//                 "Soft neutral palettes",
//                 "Modern timeless silhouettes",
//               ].map((item) => (
//                 <span
//                   key={item}
//                   className="inline-flex rounded-full border border-[#ddd5ca] bg-white px-4 py-2 text-[13px] font-bold text-[#4c443d]"
//                 >
//                   {item}
//                 </span>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* ASSURANCES */}
//       <section
//         data-annotate-id="about-assurances-section"
//         className="mx-auto max-w-7xl px-[5%] py-24"
//       >
//         <div className="mb-14 text-center">
//           <p className="mb-3 text-[12px] font-black uppercase tracking-[3px] text-secondary">
//             Why Choose Us
//           </p>
//           <h2 className="text-[34px] font-bold tracking-tight sm:text-[42px]">
//             Confidence in every order
//           </h2>
//         </div>

//         <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
//           {assurances.map((item, idx) => (
//             <motion.div
//               key={item.title}
//               initial={{ opacity: 0, y: 18 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: idx * 0.08 }}
//               className="rounded-[22px] border border-border bg-surface p-7 text-center"
//             >
//               <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
//                 <item.icon className="text-secondary" size={26} />
//               </div>
//               <h3 className="text-[18px] font-bold tracking-tight">
//                 {item.title}
//               </h3>
//               <p className="mt-3 text-[14px] font-semibold leading-7 text-muted">
//                 {item.desc}
//               </p>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       {/* CTA */}
//       <section data-annotate-id="about-cta-section" className="px-[5%] pb-20">
//         <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-primary px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-16">
//           <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
//             <div>
//               <p className="mb-3 text-[12px] font-black uppercase tracking-[3px] text-secondary">
//                 Visit Peekeeper
//               </p>
//               <h2 className="max-w-3xl text-[34px] font-bold leading-tight tracking-tight sm:text-[44px]">
//                 Discover furniture designed to make everyday living feel better.
//               </h2>
//               <p className="mt-5 max-w-2xl text-[16px] font-semibold leading-8 text-white/80">
//                 Explore our collections, discover timeless pieces, and create a
//                 home that feels personal from the first glance to the last detail.
//               </p>
//             </div>

//             <div className="flex flex-wrap gap-4">
//               <a
//                 href="/shop"
//                 className="inline-flex h-12 items-center rounded-full bg-secondary px-6 text-[13px] font-black uppercase tracking-[2px] text-black transition hover:opacity-90"
//               >
//                 Shop Now
//               </a>
//               <a
//                 href="/contact"
//                 className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-[13px] font-black uppercase tracking-[2px] text-white transition hover:bg-white/10"
//               >
//                 Speak to Us <ArrowRight size={16} />
//               </a>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//     </>
//   );
// };

// export default AboutPage;
