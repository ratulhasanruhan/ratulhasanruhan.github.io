import type { Metadata, Viewport } from "next";
import WebMcp from "@/components/WebMcp";
import profile from "@/data/profile.snapshot.json";
import "./globals.css";
import "./home.css";

const siteUrl = "https://also.ratulruhan.cv";
const title = "Ratul Hasan Ruhan | Software Engineer & Creator of Ojogor";
const description =
  "Ratul Hasan Ruhan — award-winning software engineer in Dhaka, Bangladesh. Founder of Appibrium, creator of Ojogor (the first Bengali programming language). Expert in Flutter, cross-platform mobile development, AI/ML, systems engineering, and IoT. Winner of Bangladesh ICT & Innovation Award 2025.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Ratul Hasan Ruhan",
  },
  description,
  keywords: [
    "Ratul Hasan Ruhan",
    "Software Engineer",
    "Ojogor",
    "Flutter",
    "systems engineering",
    "Bangladesh",
  ],
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      bn: "/bn/",
      "x-default": "/",
    },
    types: {
      "text/markdown": "/ratul-hasan-ruhan.md",
      "application/ld+json": "/ratul-hasan-ruhan.json",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: "Ratul Hasan Ruhan’s Portfolio",
    locale: "en_US",
    images: [
      {
        url: "/assets/images/ratulhasan-avatar.png",
        width: 1200,
        height: 630,
        alt: "Ratul Hasan Ruhan — Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "Award-winning Software Engineer & Founder of Appibrium. Creator of Ojogor, the first Bengali programming language. Expert in Flutter, AI/ML & systems. Winner of Bangladesh ICT & Innovation Award 2025.",
    creator: "@ratulhasanruhan",
    site: "@ratulhasanruhan",
    images: ["/assets/images/ratulhasan-avatar.png"],
  },
  icons: {
    icon: "/assets/images/ratulhasan-favicon.ico",
    apple: "/assets/images/ratulhasan-avatar.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f1eadb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const personJson = JSON.stringify(profile).replace(/</g, "\\u003c");

  return (
    <html lang="en">
      <head>
        <link rel="alternate" href="/ratul-hasan-ruhan.json" type="application/ld+json" title="Ratul Hasan Ruhan — Professional Data" />
        <link rel="alternate" href="/ratul-hasan-ruhan.md" type="text/markdown" title="Ratul Hasan Ruhan — Markdown Profile" />
        <link rel="alternate" href="/.well-known/api-catalog" type="application/linkset+json" title="API Catalog" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: personJson }}
        />
        {children}
        <WebMcp />
      </body>
    </html>
  );
}
