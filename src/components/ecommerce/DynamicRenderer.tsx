"use client";

import React from "react";
import { ecommerceRegistry } from "./ecommerceRegistry";

interface DynamicRendererProps {
  content: any[];
}

const DynamicRenderer: React.FC<DynamicRendererProps> = ({ content }) => {
  if (!content || !Array.isArray(content)) return null;

  return (
    <>
      {content.map((section: any) => {
        const Component = ecommerceRegistry[section.type];

        if (!Component) {
          console.warn(`[CMS Warning] Unknown section type: ${section.type}`);
          return null; // Fail safely
        }

        return <Component key={section.id} section={section} />;
      })}
    </>
  );
};

export default DynamicRenderer;
