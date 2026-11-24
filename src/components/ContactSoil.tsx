"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { education, expertise, profile } from "@/data/catalog";

const socialNames: Record<string, string> = {
  "https://www.linkedin.com/in/ratul-hasan-ruhan/": "LinkedIn",
  "https://www.facebook.com/ratulhasan.ruhan": "Facebook",
  "https://www.youtube.com/@ratulicious": "YouTube",
  "https://ratulhasan.hashnode.dev": "Hashnode",
  "https://ratulhasanruhan.medium.com": "Medium",
  "https://peerlist.io/ratulhasan": "Peerlist",
  "https://github.com/ratulhasanruhan": "GitHub",
  "https://ratuler.vercel.app/": "Portfolio",
  "https://ratulhasan.web.app/": "Web profile",
};

export default function ContactSoil({ bangla = false }: { bangla?: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [seedState, setSeedState] = useState<"idle" | "falling" | "sprout">("idle");

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;

    try {
      const response = await fetch(profile.contactForm, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Contact form request failed");

      form.reset();
      setStatus("success");
      setSeedState("falling");
      window.setTimeout(() => setSeedState("sprout"), 800);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="soil-section" id="roots" aria-labelledby="roots-title">
      <div className="soil-section-inner">
        <div className="section-eyebrow"><span /> {bangla ? "ছায়ার নিচে" : "Beneath the canopy"}</div>
        <div className="soil-heading">
          <p className="eyebrow-kicker">{bangla ? "শুরুটা যেখানে" : "Where it all began"}</p>
          <h2 id="roots-title">{bangla ? <>শক্ত শিকড়। <em>খোলা মাটি।</em></> : <>Strong roots. <em>Open ground.</em></>}</h2>
          <p className="soil-intro">
            {bangla
              ? "আগের অভিজ্ঞতার ওপর ভর করেই গাছ বেড়ে ওঠে। এই জায়গাগুলোই আমার পথ গড়েছে।"
              : "A tree grows because of what came before it. These are the places that shaped my path."}
          </p>
        </div>

        <div className="root-map">
          <svg viewBox="0 0 1000 190" aria-hidden="true">
            <path d="M500 0v34c0 34-82 34-82 75v76M500 34c0 34 82 34 82 75v76M500 34v151M418 109c-72 0-108 10-108 76M582 109c72 0 108 10 108 76" />
            <path d="M500 0v34c0 34-82 34-82 75v76M500 34c0 34 82 34 82 75v76M500 34v151M418 109c-72 0-108 10-108 76M582 109c72 0 108 10 108 76" />
          </svg>
          {education.map((school, index) => (
            <article className={`root-card root-card-${index + 1}`} key={school.title}>
              <span className="root-year">{school.tenure}</span>
              <h3>{school.title}</h3>
              <p>{school.organization}</p>
            </article>
          ))}
        </div>

        <div className="craft-panel">
          <div className="craft-heading">
            <span className="craft-stamp">{bangla ? <>কাজের<br />নোট</> : <>FIELD<br />NOTES</>}</span>
            <div>
              <p className="eyebrow-kicker">{bangla ? "কাজে যা নিয়ে আসি" : "What I bring to the work"}</p>
              <h2>{bangla ? <>কৌতূহল, <em>কাজে লাগাই।</em></> : <>Curiosity, <em>made useful.</em></>}</h2>
            </div>
          </div>
          <div className="expertise-grid">
            {expertise.map((item, index) => (
              <article className="expertise-card" key={item.title}>
                <span className="expertise-number">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="contact-ground" id="contact">
          <div className="contact-story">
            <div className="section-eyebrow"><span /> {bangla ? "একটি বীজ বুনুন" : "Plant a seed"}</div>
            <h2>{bangla ? <>ভালো কিছু <em>ছোট করেই শুরু।</em></> : <>Good things <em>start small.</em></>}</h2>
            <p>
              {bangla
                ? "ভাবনার কোনো চ্যালেঞ্জ, গবেষণার প্রশ্ন বা বড় হওয়ার মতো কোনো ধারণা আছে? লিখে পাঠান, দেখা যাক কোথায় যায়।"
                : <>Have a thoughtful challenge, a research question, or an idea worth growing? Leave a note and let&apos;s see where it leads.</>}
            </p>
            <div className="contact-actions">
              <a className="primary-action" href={profile.booking} target="_blank" rel="noreferrer">
                {bangla ? "একটি ছোট আলাপ ঠিক করুন" : "Book a quick sync"} <span aria-hidden="true">↗</span>
              </a>
              <a className="text-action" href={profile.resume} download>
                {bangla ? "জীবনবৃত্তান্ত ডাউনলোড" : "Download résumé"} <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="contact-links">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <span>{profile.location}</span>
            </div>
            <nav className="social-links" aria-label={bangla ? "সামাজিক যোগাযোগ" : "Social profiles"}>
              {profile.sameAs
                .filter((url) => socialNames[url])
                .map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    {socialNames[url]}
                  </a>
                ))}
            </nav>
          </div>

          <div className="seed-form-shell">
            <div className={`seed-art seed-${seedState}`} aria-hidden="true">
              <span className="seed-dot" />
              <span className="seed-stem" />
              <span className="seed-leaf seed-leaf-left" />
              <span className="seed-leaf seed-leaf-right" />
            </div>
            <p className="eyebrow-kicker">{bangla ? "আগামী মৌসুমের জন্য একটি বার্তা" : "A note for the next season"}</p>
            <form className="seed-form" onSubmit={submitForm}>
              <label>
                <span>{bangla ? "আপনার নাম" : "Your name"}</span>
                <input name="fullname" autoComplete="name" placeholder={bangla ? "আপনাকে কী নামে ডাকব?" : "How should I address you?"} required />
              </label>
              <label>
                <span>{bangla ? "ইমেইল ঠিকানা" : "Email address"}</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={bangla ? "you@example.com" : "you@example.com"}
                  required
                />
              </label>
              <label>
                <span>{bangla ? "আপনার বার্তা" : "Your message"}</span>
                <textarea name="message" rows={4} placeholder={bangla ? "আপনার ভাবনাটি লিখুন…" : "Tell me what you're thinking…"} required />
              </label>
              <button className="primary-action seed-submit" type="submit" disabled={status === "sending"}>
                {status === "sending"
                  ? bangla ? "পাঠানো হচ্ছে…" : "Sending…"
                  : bangla ? "বার্তা পাঠান" : "Send your note"}
                <span aria-hidden="true">↗</span>
              </button>
              <p className="form-status" aria-live="polite">
                {status === "success"
                  ? bangla ? "ধন্যবাদ — আপনার বীজটি বোনা হয়েছে। যোগাযোগ করব।" : "Thank you — your seed is planted. I’ll be in touch."
                  : status === "error"
                    ? bangla ? "বার্তাটি পাঠানো যায়নি। আবার চেষ্টা করুন বা সরাসরি ইমেইল করুন।" : "The note didn’t go through. Please try again or email me directly."
                    : bangla ? "আপনার বার্তাটি সরাসরি Ratul-এর কাছে যাবে।" : "Your message is sent directly to Ratul."}
              </p>
            </form>
          </div>
        </div>

        <footer className="site-footer">
          <Link className="footer-mark" href="/" aria-label="Back to the mango tree">
            <span className="mark-leaf" /> RHR
          </Link>
          <p>{bangla ? "ঢাকা, বাংলাদেশে যত্ন নিয়ে তৈরি।" : "Made with care in Dhaka, Bangladesh."}</p>
          <Link href="/bn/">{bangla ? "বাংলা সাইট" : "বাংলা"}</Link>
          <a href="#top">{bangla ? "গাছের ছায়ায় ফিরুন ↑" : "Back to the canopy ↑"}</a>
        </footer>
      </div>
    </section>
  );
}
