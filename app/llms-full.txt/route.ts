import { getPortfolioCatalog, toPortfolioMarkdown } from "@/data/portfolio-catalog";

export const dynamic = "force-static";

export async function GET() {
  const portfolio = await getPortfolioCatalog();
  return new Response(toPortfolioMarkdown(portfolio), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
    },
  });
}
