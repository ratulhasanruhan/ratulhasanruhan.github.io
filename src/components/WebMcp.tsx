"use client";

import { useEffect } from "react";
import { getWebMcpHandlers } from "@/components/webmcp-actions";
import { profile } from "@/data/catalog";
import profileSnapshot from "@/data/profile.snapshot.json";
import projectsSnapshot from "@/data/projects.snapshot.json";

type ToolInput = Record<string, unknown>;
type ToolOptions = { signal?: AbortSignal };
type ModelTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, boolean>;
  execute: (input: ToolInput, options?: ToolOptions) => unknown;
};
type ModelContext = {
  provideContext?: (context: { tools: ModelTool[]; signal?: AbortSignal }) => Promise<unknown> | unknown;
  registerTool?: (tool: ModelTool, options?: ToolOptions) => Promise<unknown> | unknown;
  unregisterTool?: (name: string) => Promise<unknown> | unknown;
};

const pages = ["about", "resume", "projects", "research", "writings", "recognition", "contact"];
const categories = [...new Set(projectsSnapshot.map((project) => project.category))];

export default function WebMcp() {
  useEffect(() => {
    const browserNavigator = navigator as Navigator & { modelContext?: ModelContext };
    const browserDocument = document as Document & { modelContext?: ModelContext };
    const context = browserNavigator.modelContext ?? browserDocument.modelContext;
    if (!context) return;

    const controller = new AbortController();
    const tools: ModelTool[] = [
      {
        name: "get_profile",
        title: "Get profile",
        description:
          "Return Ratul Hasan Ruhan's full structured profile, including roles, education, credentials, awards, memberships, publications, and expertise.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true },
        execute: () => profileSnapshot,
      },
      {
        name: "list_projects",
        title: "List projects",
        description:
          "List portfolio projects, optionally filtered by category and/or a free-text query matched against title and subtitle.",
        inputSchema: {
          type: "object",
          properties: {
            category: { type: "string", description: "Exact category label (case-insensitive)." },
            query: { type: "string", description: "Text matched against project title and subtitle." },
          },
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: (input) => {
          const category = typeof input.category === "string" ? input.category.toLowerCase() : "";
          const query = typeof input.query === "string" ? input.query.toLowerCase() : "";
          const matches = projectsSnapshot
            .filter((project) => !category || project.category.toLowerCase() === category)
            .filter((project) => !query || `${project.title} ${project.subtitle}`.toLowerCase().includes(query))
            .map((project) => ({
              ...project,
              image: `${window.location.origin}/assets/projects/${project.image}`,
            }));
          return { count: matches.length, categories, projects: matches };
        },
      },
      {
        name: "get_contact_info",
        title: "Get contact info",
        description:
          "Return ways to reach Ratul, including email, WhatsApp, LinkedIn, GitHub, location, meeting booking, résumé, and contact form.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true },
        execute: () => ({
          name: profile.name,
          email: profile.email,
          whatsapp: profile.whatsapp,
          linkedin: profile.linkedin,
          github: profile.github,
          location: profile.location,
          booking_url: profile.booking,
          resume_pdf: new URL(profile.resume, window.location.origin).href,
          contact_form_page: `${window.location.origin}/contact/`,
        }),
      },
      {
        name: "navigate",
        title: "Open a section",
        description: "Navigate to a portfolio section in the current tab.",
        inputSchema: {
          type: "object",
          properties: { page: { type: "string", enum: pages } },
          required: ["page"],
          additionalProperties: false,
        },
        execute: (input) => {
          const page = String(input.page);
          if (!pages.includes(page)) throw new Error("Choose a listed portfolio section.");
          const handlers = getWebMcpHandlers();
          if (!handlers) throw new Error("The portfolio view is not ready.");
          handlers.onNavigate(page);
          return { page };
        },
      },
      {
        name: "show_projects",
        title: "Filter projects",
        description: 'Open Projects and filter by a category label or a title/description query. Use "All" to clear.',
        inputSchema: {
          type: "object",
          properties: { category: { type: "string", description: "Category label or free-text query." } },
          required: ["category"],
          additionalProperties: false,
        },
        execute: (input) => {
          const filter = String(input.category);
          const handlers = getWebMcpHandlers();
          if (!handlers) throw new Error("The portfolio view is not ready.");
          handlers.onFilterProjects(filter);
          return { page: "projects", filter, applied: true };
        },
      },
      {
        name: "prefill_contact_form",
        title: "Prefill contact form",
        description:
          "Open Contact and fill in name, email, and message. The form is not submitted; the user reviews and sends it.",
        inputSchema: {
          type: "object",
          properties: {
            fullname: { type: "string", maxLength: 200 },
            email: { type: "string", format: "email", maxLength: 200 },
            message: { type: "string", maxLength: 5000 },
          },
          required: ["fullname", "email", "message"],
          additionalProperties: false,
        },
        execute: (input) => {
          const values = {
            fullname: String(input.fullname),
            email: String(input.email),
            message: String(input.message),
          };
          const handlers = getWebMcpHandlers();
          if (!handlers) throw new Error("The portfolio view is not ready.");
          handlers.onPrefillContact(values);
          return { page: "contact", filled: true, submitted: false };
        },
      },
      {
        name: "open_booking_page",
        title: "Book a meeting",
        description: "Open the Google Calendar appointment page so the user can pick a slot.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { consequentialHint: true },
        execute: () => ({ opened: Boolean(window.open(profile.booking, "_blank", "noopener")), url: profile.booking }),
      },
      {
        name: "download_resume",
        title: "Download résumé",
        description: "Open Ratul's résumé PDF in a new tab.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        execute: () => {
          const url = new URL(profile.resume, window.location.origin).href;
          return { opened: Boolean(window.open(url, "_blank", "noopener")), url };
        },
      },
    ];

    const registration = context.registerTool
      ? Promise.all(tools.map((tool) => context.registerTool?.(tool, { signal: controller.signal })))
      : context.provideContext
        ? context.provideContext({ tools, signal: controller.signal })
        : Promise.resolve();
    const usesUnregisterFallback = !context.registerTool;
    let disposed = false;
    let registrationSettled = false;
    let unregistered = false;
    const unregister = () => {
      if (unregistered || !usesUnregisterFallback || !context.unregisterTool) return;
      unregistered = true;
      for (const tool of tools) {
        void Promise.resolve(context.unregisterTool(tool.name)).catch(() => undefined);
      }
    };
    void Promise.resolve(registration).then(
      () => {
        registrationSettled = true;
        if (disposed) unregister();
      },
      () => {
        registrationSettled = true;
        if (disposed) unregister();
      },
    );
    return () => {
      disposed = true;
      controller.abort();
      if (registrationSettled) unregister();
    };
  }, []);

  return null;
}
