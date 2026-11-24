import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow-kicker">A leaf out of place</span>
      <h1>This path doesn’t grow here.</h1>
      <p>The page may have moved. Return to the portfolio and find another branch.</p>
      <Link className="primary-action" href="/">Back to the mango tree <span aria-hidden="true">↗</span></Link>
    </main>
  );
}
