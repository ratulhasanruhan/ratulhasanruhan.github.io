import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortfolioShell from "@/components/PortfolioShell";
import { branches } from "@/data/catalog";
import type { BranchId } from "@/data/types";

const siteUrl = "https://also.ratulruhan.cv";

export const dynamicParams = false;

const branchDescriptions: Record<string, string> = {
  projects: "Explore 30 software projects and experiments by Ratul Hasan Ruhan.",
  awards: "Explore awards, recognitions, and milestones in Ratul Hasan Ruhan’s portfolio.",
  communities: "Explore community roles and volunteer work by Ratul Hasan Ruhan.",
  research: "Explore publications and research interests by Ratul Hasan Ruhan.",
  writing: "Read practical engineering notes by Ratul Hasan Ruhan.",
  experience: "Explore Ratul Hasan Ruhan’s professional experience, credentials, and résumé.",
  contact: "Contact Ratul Hasan Ruhan, book a meeting, or download his résumé.",
};

export async function generateStaticParams() {
  return [...branches.map(({ id }) => ({ branch: id })), { branch: "contact" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ branch: string }>;
}): Promise<Metadata> {
  const { branch } = await params;
  const branchLabel = branches.find((entry) => entry.id === branch)?.label ?? "Contact";
  if (!branchDescriptions[branch]) return { title: "Not found" };

  return {
    title: branchLabel,
    description: branchDescriptions[branch],
    alternates: { canonical: `${siteUrl}/${branch}/` },
    openGraph: {
      title: `${branchLabel} | Ratul Hasan Ruhan`,
      description: branchDescriptions[branch],
      url: `${siteUrl}/${branch}/`,
      images: ["/assets/images/ratulhasan-avatar.png"],
    },
  };
}

export default async function BranchPage({
  params,
}: {
  params: Promise<{ branch: string }>;
}) {
  const { branch } = await params;
  if (branch !== "contact" && !branches.some((entry) => entry.id === branch)) notFound();

  return <PortfolioShell initialBranch={branch as BranchId | "contact"} />;
}
