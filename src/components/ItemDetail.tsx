import Image from "next/image";
import Link from "next/link";
import type { PortfolioItem } from "@/data/types";

function itemImages(item: PortfolioItem) {
  if (item.kind === "project") return [{ src: item.image, alt: item.title }];
  if (item.kind === "award") return item.images;
  if (item.kind === "community") return [{ src: item.image, alt: `${item.title} logo` }];
  if (item.kind === "writing" && item.cover) return [{ src: item.cover, alt: `Cover for ${item.title}` }];
  return [];
}

function itemTypeLabel(item: PortfolioItem) {
  if (item.kind === "certification") return "Certification";
  if (item.kind === "publication") return "Research publication";
  if (item.kind === "interest") return "Research interest";
  return item.kind;
}

export default function ItemDetail({ item }: { item: PortfolioItem }) {
  const images = itemImages(item);

  return (
    <article className="item-detail" aria-labelledby="item-detail-title">
      <div className="item-detail-heading">
        <div className="item-detail-copy">
          <Link className="detail-backlink" href={`/${item.branch}/`}>
            <span aria-hidden="true">←</span> Back to {item.branch}
          </Link>
          <p className="eyebrow-kicker">{itemTypeLabel(item)}{item.year ? ` · ${item.year}` : ""}</p>
          <h2 id="item-detail-title">{item.title}</h2>
          <p className="item-detail-summary">{item.summary}</p>
          <p className="item-detail-description">{item.description}</p>
          <div className="item-detail-facts">
            {"category" in item && <span>{item.category}</span>}
            {"issuer" in item && item.issuer && <span>Issued by {item.issuer}</span>}
            {"role" in item && item.role && <span>{item.role}</span>}
            {"tenure" in item && item.tenure && <span>{item.tenure}</span>}
            {item.kind === "writing" && <time dateTime={item.publishedAt}>{item.publishedAt} · UTC</time>}
          </div>
          {item.href && (
            <a className="primary-action item-detail-action" href={item.href} target="_blank" rel="noreferrer">
              {item.kind === "writing" ? "Read the article" : item.kind === "publication" ? "View publication" : "Visit source"}
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        {images.length > 0 && (
          <div className={`item-detail-gallery${images.length > 1 ? " item-detail-gallery-multiple" : ""}`}>
            {images.map((image) => (
              <figure key={image.src}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 760px) 90vw, 580px"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
