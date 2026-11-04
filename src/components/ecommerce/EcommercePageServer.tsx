import React from "react";
import { AnnotatorPlugin } from "../annotationPlugin/AnnotatorPlugin";
import GetAllPages from "../pages/GetAllPages";
import DynamicRenderer from "./DynamicRenderer";

interface EcommercePageServerProps {
  data: any;
  user?: any;
}

const EcommercePageServer = ({ data, user }: EcommercePageServerProps) => {
  const content = Array.isArray(data?.content) ? data.content : [];

  return (
    <>

      <GetAllPages />

      <div data-annotate-id="ecommerce-page-root" className="bg-background text-foreground">
        <DynamicRenderer content={content} />
      </div>
    </>
  );
};

export default EcommercePageServer;
