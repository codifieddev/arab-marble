"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ReferenceEditButton } from "@/components/cms/reference-editor";
import EditableText from "@/components/shared/EditableText";
import { useAppSelector } from "@/lib/store/hooks";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";

interface ProjectItem {
  id?: string;
  _id?: string;
  title: string;
  location?: string;
  category?: string;
  image?: string;
  gallery?: string[];
  description?: string;
  ctaLabel?: string;
}

const DEFAULT_PROJECTS: Record<string, ProjectItem[]> = {
  latest: [
    {
      id: "boulevard-heights",
      title: "Boulevard Heights",
      location: "Dubai",
      category: "Latest Projects",
      image: "/images/project-boulevard-heights.jpg",
      description:
        "Luxury architectural marble flooring and cladding installation for prestigious high-rise towers in Downtown Dubai.",
    },
    {
      id: "burj-vista",
      title: "Burj Vista",
      location: "Dubai",
      category: "Latest Projects",
      image: "/images/project-burj-vista.jpg",
      description:
        "Custom marble facades and bespoke decorative stone works tailored for prime metropolitan residential residences.",
    },
    {
      id: "clemenceau-medical-center",
      title: "Clemenceau Medical Center",
      location: "Dubai",
      category: "Latest Projects",
      image: "/images/project-clemenceau.jpg",
      description:
        "High-density hygienic stone cladding and elegant lobby marble surfaces engineered for modern healthcare spaces.",
    },
    {
      id: "the-address-fountain-views",
      title: "The Address - Fountain Views",
      location: "Dubai",
      category: "Latest Projects",
      image: "/images/project-fountain-views.jpg",
      description:
        "Five-star hospitality marble application featuring custom bookmatched slabs and intricate waterjet patterns.",
    },
  ],
  iconic: [
    {
      id: "emirates-palace-suites",
      title: "Emirates Palace Luxury Suites",
      location: "Abu Dhabi",
      category: "Iconic",
      image: "/images/home-hero.jpg",
      description:
        "Royal presidential suite marble fit-out, featuring rare onyx and opulent Mediterranean marble in Abu Dhabi.",
    },
    {
      id: "sheikh-zayed-villa",
      title: "Royal Presidential Villa",
      location: "Abu Dhabi",
      category: "Iconic",
      image: "/images/who-we-are.jpg",
      description:
        "Monumental private villa stonework, showcasing bespoke Omani beige marble columns and pristine exterior cladding.",
    },
  ],
  custom: [
    {
      id: "saadiyat-private-residence",
      title: "Saadiyat Island Private Villa",
      location: "Abu Dhabi",
      category: "Custom Projects",
      image: "/images/products-tile.jpg",
      description:
        "Execution of bespoke stonework, high-precision fixing, and premium marble installation for prominent architectural landmarks in the UAE.",
    },
    {
      id: "al-reem-waterfront",
      title: "Al Reem Waterfront Penthouse",
      location: "Abu Dhabi",
      category: "Custom Projects",
      image: "/images/projects-tile.jpg",
      description:
        "Contemporary penthouse renovation featuring imported Italian marble kitchen islands and seamless bathroom vanities.",
    },
  ],
};

const CATEGORY_TITLES: Record<string, { heading: string; subtitle: string }> = {
  latest: { heading: "LATEST", subtitle: "Our Latest Projects" },
  "latest-projects": { heading: "LATEST", subtitle: "Our Latest Projects" },
  iconic: { heading: "ICONIC", subtitle: "Iconic Landmark Projects" },
  "iconic-projects": {
    heading: "ICONIC",
    subtitle: "Iconic Landmark Projects",
  },
  custom: { heading: "CUSTOM", subtitle: "Bespoke Architectural Stonework" },
  "custom-projects": {
    heading: "CUSTOM",
    subtitle: "Bespoke Architectural Stonework",
  },
};

export default function ProjectsCategoryPage({
  categorySlug = "latest",
  locale = "en",
}: {
  categorySlug?: string;
  locale?: string;
}) {
  const isEditable = useAppSelector(
    (state) => state.pages.isEditablePage || state.pages.isEditable,
  );

  const normCategory = categorySlug.toLowerCase().replace(/-projects$/, "");
  const initialCategoryMeta = CATEGORY_TITLES[normCategory] || {
    heading: normCategory.toUpperCase(),
    subtitle: `Our ${normCategory} Projects`,
  };

  const [categoryHeading, setCategoryHeading] = useState(
    initialCategoryMeta.heading,
  );
  const [categorySubtitle, setCategorySubtitle] = useState(
    initialCategoryMeta.subtitle,
  );

  const [projects, setProjects] = useState<ProjectItem[]>(
    DEFAULT_PROJECTS[normCategory] || DEFAULT_PROJECTS.latest,
  );
  const [loading, setLoading] = useState(false);

  // Sync projects from database API
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cms/projects`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data)
          ? data
          : data?.data || data?.items || [];
        if (items.length > 0) {
          const filtered = items.filter((p: any) => {
            const cat = (p.category || "").toLowerCase();
            return (
              cat.includes(normCategory) ||
              cat.includes(categorySlug.toLowerCase())
            );
          });
          if (filtered.length > 0) {
            setProjects(
              filtered.map((p: any) => ({
                id: p._id || p.id,
                _id: p._id || p.id,
                title: p.title || p.name,
                location: p.location || "Abu Dhabi, UAE",
                category: p.category,
                description: p.description,
                image:
                  p.image ||
                  p.imageUrl ||
                  p.primaryImage?.url ||
                  p.gallery?.[0] ||
                  "/images/project-boulevard-heights.jpg",
                ctaLabel: p.ctaLabel || "Inquire on this Project →",
              })),
            );
          }
        }
      }
    } catch (err) {
      console.warn("Error fetching dynamic projects, using fallback", err);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, normCategory]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Listen for real-time project updates from canvas editor
  useEffect(() => {
    const handleProjectUpdated = (e: any) => {
      const updated = e.detail;
      if (!updated) return;
      setProjects((prev) =>
        prev.map((item) => {
          if (
            (updated.id && item.id === updated.id) ||
            (updated._id && item.id === updated._id) ||
            item.title === updated.title
          ) {
            return { ...item, ...updated };
          }
          return item;
        }),
      );
    };

    window.addEventListener("arabmarble:project-updated", handleProjectUpdated);
    return () => {
      window.removeEventListener(
        "arabmarble:project-updated",
        handleProjectUpdated,
      );
    };
  }, []);

  // Save changes from CanvasProjectModal
  const handleProjectSave = async (
    updatedProject: ProjectItem,
    indexOrId: string | number,
  ) => {
    setProjects((prev) =>
      prev.map((item, idx) => {
        if (item.id === indexOrId || idx === indexOrId) {
          return { ...item, ...updatedProject };
        }
        return item;
      }),
    );

    const projId =
      updatedProject.id ||
      updatedProject._id ||
      (typeof indexOrId === "string" ? indexOrId : undefined);
    if (projId && !projId.startsWith("default-")) {
      try {
        await fetch(`/api/cms/projects/${encodeURIComponent(projId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProject),
        });
      } catch (err) {
        console.warn("Failed to persist project update to server", err);
      }
    }
  };

  // Inline text save handler
  const handleInlineSave = async (
    indexOrId: string | number,
    field: keyof ProjectItem,
    value: string,
  ) => {
    let updatedTarget: ProjectItem | null = null;

    setProjects((prev) =>
      prev.map((item, idx) => {
        if (item.id === indexOrId || idx === indexOrId) {
          const updated = { ...item, [field]: value };
          updatedTarget = updated;
          return updated;
        }
        return item;
      }),
    );

    if (updatedTarget && (updatedTarget as ProjectItem).id) {
      const projId = (updatedTarget as ProjectItem).id!;
      try {
        await fetch(`/api/cms/projects/${encodeURIComponent(projId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTarget),
        });
        toast.success(`Project ${String(field)} updated!`);
      } catch (err) {
        console.warn("Failed to persist inline project change", err);
      }
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header matching screenshot */}
      <div
        className="relative py-20 bg-neutral-900 border-b border-neutral-200 text-center bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url('/images/page-banner.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/65 backdrop-brightness-85" />
        <div className="relative z-10 max-w-[1240px] mx-auto px-6">
          <EditableText
            value={categoryHeading}
            onSave={(val) => setCategoryHeading(val)}
            isEditable={isEditable}
            tag="h1"
            className="text-4xl md:text-5xl font-light tracking-widest !text-white uppercase mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] text-center"
            placeholder="Category Heading..."
          />
          <div className="w-16 h-0.5 bg-neutral-300 mx-auto mb-4" />
          <EditableText
            value={categorySubtitle}
            onSave={(val) => setCategorySubtitle(val)}
            isEditable={isEditable}
            tag="p"
            className="text-sm md:text-base font-light !text-neutral-100 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] text-center"
            placeholder="Category Subtitle..."
          />

          {/* Admin Toolbar to Add / Configure Projects */}
          {isEditable && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <ReferenceEditButton
                type="project"
                title="Add New Architectural Project"
                label="Add New Project"
                data={{
                  title: "New Luxury Landmark Project",
                  location: "Abu Dhabi, UAE",
                  category: initialCategoryMeta.subtitle,
                  description:
                    "Comprehensive supply and fixing of natural marble slabs and custom cladding.",
                  image: "/images/products-tile.jpg",
                  ctaLabel: "Inquire on this Project →",
                }}
                onSave={async (newProj) => {
                  try {
                    const res = await fetch("/api/cms/projects", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newProj),
                    });
                    if (res.ok) {
                      toast.success("New project created!");
                      fetchProjects();
                    }
                  } catch (err) {
                    console.error("Failed to create new project", err);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Projects List matching screenshot */}
      <div className="max-w-[1140px] mx-auto px-6 py-16">
        <div className="space-y-12">
          {projects.map((project, idx) => {
            const isEven = idx % 2 === 0;
            const itemId = project.id || idx;

            return (
              <div
                key={itemId}
                className="grid grid-cols-1 md:grid-cols-2 border border-neutral-200 overflow-hidden shadow-xs relative group"
              >
                {/* Project Edit Button for Admin (Canvas Modal) */}
                {isEditable && (
                  <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                    <ReferenceEditButton
                      type="project"
                      title={`Edit Project: ${project.title}`}
                      data={project}
                      label="Edit Project"
                      onSave={(updated) => handleProjectSave(updated, itemId)}
                      compact
                    />
                  </div>
                )}

                {/* Text Block */}
                <div
                  className={`p-8 md:p-14 flex flex-col justify-center bg-[#4A4A4A] text-white ${
                    isEven ? "order-1" : "order-1 md:order-2"
                  }`}
                >
                  <EditableText
                    value={project.title}
                    onSave={(val) => handleInlineSave(itemId, "title", val)}
                    isEditable={isEditable}
                    tag="h2"
                    className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-white"
                    placeholder="Project Title..."
                  />

                  <EditableText
                    value={project.location || "Abu Dhabi, UAE"}
                    onSave={(val) => handleInlineSave(itemId, "location", val)}
                    isEditable={isEditable}
                    tag="p"
                    className="text-xs uppercase tracking-widest text-neutral-300 font-light mb-6"
                    placeholder="Project Location..."
                  />

                  <EditableText
                    value={
                      project.description ||
                      "Execution of bespoke stonework, high-precision fixing, and premium marble installation for prominent architectural landmarks in the UAE."
                    }
                    onSave={(val) =>
                      handleInlineSave(itemId, "description", val)
                    }
                    isEditable={isEditable}
                    tag="p"
                    className="text-sm text-neutral-200 leading-relaxed font-light mb-8"
                    placeholder="Project Scope & Description..."
                  />

                  <div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-white border-b border-white pb-1 hover:border-neutral-400 hover:text-neutral-300 transition-colors"
                    >
                      {project.ctaLabel || "Inquire on this Project →"}
                    </Link>
                  </div>
                </div>

                {/* Project Image with Zoom Effect */}
                <div
                  className={`relative h-[320px] md:h-[420px] bg-neutral-100 overflow-hidden ${
                    isEven ? "order-2" : "order-2 md:order-1"
                  }`}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
