import Image from "next/image";
import Link from "next/link";
import { branches, getEventsForItem } from "@/data/catalog";
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
  if (item.kind === "education") return "Education";
  return item.kind;
}

function formatMonthYear(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const month = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)).toLocaleString("en", {
    month: "short",
    timeZone: "UTC",
  });
  return `${month} ${match[1]}`;
}

export default function ItemDetail({ item }: { item: PortfolioItem }) {
  const images = itemImages(item);
  const repeatedDescription = item.summary.trim().toLocaleLowerCase() === item.description.trim().toLocaleLowerCase();
  const relatedEvents = getEventsForItem(item);
  const eventPhotos = relatedEvents.flatMap((event) =>
    event.photos.map((photo) => ({
      src: `/assets/images/events/${photo.file}`,
      alt: `${event.event} — ${event.caption}`,
      href: event.postUrl,
      event,
    })),
  );
  const branch = branches.find((entry) => entry.id === item.branch);
  const breadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://ratulx.tech/" },
      { "@type": "ListItem", position: 2, name: branch?.label ?? item.branch, item: `https://ratulx.tech/${item.branch}/` },
      { "@type": "ListItem", position: 3, name: item.title },
    ],
  }).replace(/</g, "\\u003c");

  return (
    <article id="item-detail" className="item-detail" tabIndex={-1} aria-labelledby="item-detail-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <div className="item-detail-heading">
        <div className="item-detail-copy">
          <Link className="detail-backlink" href={`/${item.branch}/`}>
            <span aria-hidden="true">←</span> Back to {item.branch}
          </Link>
          <p className="eyebrow-kicker">{itemTypeLabel(item)}{item.year ? ` · ${item.year}` : ""}</p>
          <h2 id="item-detail-title">{item.title}</h2>
          <p className="item-detail-summary">{item.summary}</p>
          {!repeatedDescription && <p className="item-detail-description">{item.description}</p>}
          <div className="item-detail-facts">
            {"category" in item && <span>{item.category}</span>}
            {"issuer" in item && item.issuer && <span>Issued by {item.issuer}</span>}
            {"organization" in item && item.organization && <span>{item.organization}</span>}
            {"role" in item && item.role && <span>{item.role}</span>}
            {"tenure" in item && item.tenure && <span>{item.tenure}</span>}
            {item.kind === "project" && item.period && <span>{item.period}</span>}
            {item.kind === "award" && item.receivedAt && <span>Received {formatMonthYear(item.receivedAt)}</span>}
            {item.kind === "writing" && <time dateTime={item.publishedAt}>{item.publishedAt} · UTC</time>}
            {item.kind === "community" && item.contactEmail && (
              <a className="item-detail-email" href={`mailto:${item.contactEmail}`}>
                {item.contactEmail}
              </a>
            )}
          </div>
          <div className="item-detail-actions">
            {item.href && (
              <a className="primary-action item-detail-action" href={item.href} target="_blank" rel="noreferrer">
                {item.kind === "writing" ? "Read the article" : item.kind === "publication" ? "View publication" : `Visit ${item.organization ?? "source"}`}
                <span aria-hidden="true">↗</span>
              </a>
            )}
            {item.kind === "community" && item.contactEmail && (
              <a className="text-action item-detail-action" href={`mailto:${item.contactEmail}`}>
                Email this role
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
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
      {eventPhotos.length > 0 && (
        <section className="item-detail-events" aria-labelledby="item-detail-events-title">
          <div className="item-detail-events-copy">
            <p className="eyebrow-kicker">Related events</p>
            <h3 id="item-detail-events-title">Moments from the orchard</h3>
            <p>
              {relatedEvents.length === 1
                ? relatedEvents[0].caption
                : `${relatedEvents.length} related gatherings with photographs.`}
            </p>
          </div>
          <div className="item-detail-events-gallery">
            {eventPhotos.map((photo) => {
              const figure = (
                <figure>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={320}
                    height={220}
                    loading="lazy"
                  />
                  <figcaption>{photo.event.event}</figcaption>
                </figure>
              );
              return photo.href ? (
                <a key={photo.src} href={photo.href} target="_blank" rel="noreferrer">
                  {figure}
                </a>
              ) : (
                <div key={photo.src}>{figure}</div>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
