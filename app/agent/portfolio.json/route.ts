import { getPortfolioCatalog } from "@/data/portfolio-catalog";

export const dynamic = "force-static";

export async function GET() {
  const portfolio = await getPortfolioCatalog();
  return Response.json(portfolio, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
