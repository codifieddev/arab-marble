"use client";

import React, { useEffect } from "react";

const InstagramPostEmbed = ({ url }: { url: string }) => {
  useEffect(() => {
    // Check if script already exists
    if (!document.getElementById("instagram-embed-script")) {
      const script = document.createElement("script");
      script.id = "instagram-embed-script";
      script.src = "//www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // If script exists, tell Instagram to process any new embeds
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    }
  }, [url]);

  // Ensure the URL is just the post base and we append the embed query
  // e.g. "https://www.instagram.com/p/XYZ"
  const getEmbedUrl = (rawUrl: string) => {
    try {
      const u = new URL(rawUrl);
      // Remove query parameters
      u.search = "";
      return u.toString();
    } catch {
      return rawUrl;
    }
  };

  const cleanUrl = getEmbedUrl(url);

  return (
    <div className="flex justify-center w-full">
      <blockquote
        className="instagram-media w-full"
        data-instgrm-permalink={`${cleanUrl}?utm_source=ig_embed&amp;utm_campaign=loading`}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: "0",
          borderRadius: "8px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "1px",
          maxWidth: "540px",
          minWidth: "326px",
          padding: "0",
          width: "calc(100% - 2px)",
        }}
      ></blockquote>
    </div>
  );
};

export default InstagramPostEmbed;

// Add type for window.instgrm
declare global {
  interface Window {
    instgrm?: any;
  }
}
