
import React from "react";
import AboutPeekeeper from "../aboutpage/aboutPeekeeper/AboutPeekeeper";
import StatsSection from "../aboutpage/statsSection/StatsSection";
import OurStory from "../aboutpage/ourStory/OurStory";
import Difference from "../aboutpage/difference/Difference";
import OurProcess from "../aboutpage/ourProcess/OurProcess";
import DesignPhilosophy from "../aboutpage/designPhilosophy/DesignPhilosophy";
import WhyChooseUs from "../aboutpage/whyChooseUs/WhyChooseUs";
import { AnnotatorPlugin } from "../annotationPlugin/AnnotatorPlugin";
import GetAllPages from "./GetAllPages";
import { getSection } from "@/lib/cmsUtils";

interface AboutPageServerProps {
  data: {
    content: any[];
    [key: string]: any;
  };
  user?: any;
}

const AboutPageServer = ({ data, user }: AboutPageServerProps) => {
  const content = Array.isArray(data?.content) ? data.content : [];

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

export default AboutPageServer;
