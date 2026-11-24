import { notFound } from "next/navigation";
import ItemDetail from "@/components/ItemDetail";
import MangoExperience from "@/components/MangoExperience";
import { getTreeItems } from "@/data/catalog";
import { getFreshContent } from "@/data/fresh-content";
import type { BranchId } from "@/data/types";

export default async function PortfolioShell({
  initialBranch,
  slug,
}: {
  initialBranch?: BranchId | "contact";
  slug?: string;
}) {
  const { writings, repositories } = await getFreshContent();
  const item = slug
    ? getTreeItems(writings).find((entry) => entry.slug === slug && entry.branch === initialBranch)
    : undefined;

  if (slug && !item) notFound();

  return (
    <MangoExperience
      key={`${initialBranch ?? "home"}:${slug ?? ""}`}
      writings={writings}
      repositories={repositories}
      initialBranch={item ? undefined : initialBranch}
      initialFocus={item?.slug}
    >
      {item && <ItemDetail item={item} />}
    </MangoExperience>
  );
}
