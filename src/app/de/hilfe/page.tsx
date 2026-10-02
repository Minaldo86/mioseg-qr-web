"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { helpArticles, helpCategories } from "./help-content";

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function Page() {
  const [query, setQuery] = useState("");

  const normalizedQuery = normalizeSearch(query);

  const filteredArticles = useMemo(() => {
    if (!normalizedQuery) return helpArticles;

    return helpArticles.filter((article) => {
      const searchable = normalizeSearch(
        [
          article.title,
          article.description,
          article.intro,
          article.category,
          ...(article.points ?? []),
        ].join(" "),
      );

      return searchable.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const visibleCategories = helpCategories.filter((category) =>
    filteredArticles.some((article) => article.category === category),
  );

  return (
    <main className="hp" dir="ltr">
      <section className="hero">
        <Link className="brand" href="/de">
          <img src="/logo-wwhite.png" alt="" />
          <span>mioseg qr</span>
        </Link>

        <div className="hi">
          <span>HILFE-CENTER</span>
          <h1>Wie können wir dir helfen?</h1>
          <p>Alles zu Mioseg QR – vom ersten Scan bis zum Business QR.</p>

          <label className="search">
            <span className="searchIcon" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hilfe durchsuchen …"
              aria-label="Hilfe durchsuchen"
              autoComplete="off"
            />
          </label>

          {normalizedQuery ? (
            <div className="searchMeta">
              {filteredArticles.length} {filteredArticles.length === 1 ? "Artikel" : "Artikel"} gefunden
              <button type="button" className="clearSearch" onClick={() => setQuery("")}>
                Suche löschen
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="intro">
        <div>
          <h2>{helpArticles[0].intro}</h2>
          <p>{helpArticles[4].intro}</p>
        </div>
      </section>

      <section className="content">
        <header className="head">
          <small>ANLEITUNGEN</small>
          <h2>{normalizedQuery ? "Suchergebnisse" : "Entdecke alle Themen"}</h2>
          <p>
            {normalizedQuery
              ? `Passende Hilfeartikel für „${query.trim()}“.`
              : "Wähle einen Bereich oder öffne direkt eine Anleitung."}
          </p>
        </header>

        <div className="grid">
          {filteredArticles.length === 0 ? (
            <div className="empty">
              <strong>Keine passenden Hilfeartikel gefunden.</strong>
              <p>Versuche einen anderen Suchbegriff oder lösche die Suche.</p>
              <button type="button" className="clearSearch" onClick={() => setQuery("")}>
                Alle Themen anzeigen
              </button>
            </div>
          ) : (
            visibleCategories.map((category) => {
              const articles = filteredArticles.filter(
                (article) => article.category === category,
              );

              return (
                <section className="cat" key={category}>
                  <h3>{category}</h3>
                  <small>
                    {articles.length} {articles.length === 1 ? "Artikel" : "Artikel"}
                  </small>
                  <div>
                    {articles.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/de/hilfe/${article.slug}`}
                      >
                        <span>{article.title}</span>
                        <b>›</b>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </section>

      <style>{`*{box-sizing:border-box}.hp,.ap{min-height:100vh;background:#f5f8fc;color:#0a1930;font-family:Inter,system-ui,sans-serif}.hero,.top{background:#071426;color:#fff}.hero{padding:0 24px 68px}.brand{color:#fff;text-decoration:none;font-weight:800}.hero>.brand{width:min(1160px,100%);height:82px;margin:auto;display:flex;align-items:center;gap:9px}.hero img{width:34px;height:34px}.hi{max-width:850px;margin:50px auto 0;text-align:center}.hi>span,.head>small{font-size:12px;letter-spacing:.15em;font-weight:800;color:#7fa8ff}.hi h1{font-size:clamp(38px,6vw,62px);margin:12px 0}.hi p{color:#bdc9da;font-size:18px}.search{max-width:650px;margin:28px auto 0;background:#fff;color:#718096;padding:20px;border-radius:17px}.intro{width:min(1060px,calc(100% - 36px));margin:-28px auto 0;background:#fff;border:1px solid #e4eaf3;border-radius:20px;padding:27px;display:flex;gap:20px}.content,.wrap{width:min(1160px,calc(100% - 36px));margin:68px auto}.head{text-align:center}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:17px}.cat{background:#fff;border:1px solid #e3e9f2;border-radius:19px;padding:21px}.cat a{display:flex;justify-content:space-between;gap:10px;padding:12px 1px;border-bottom:1px solid #f0f3f7;color:#33445c;text-decoration:none;font-size:14px}.top>div{width:min(900px,calc(100% - 36px));height:76px;margin:auto;display:flex;align-items:center;justify-content:space-between}.top a{color:#c7d4e7;text-decoration:none}.wrap{width:min(900px,calc(100% - 36px));margin:0 auto}.crumb{display:flex;gap:9px;padding:24px 0}.crumb a{color:#56709a;text-decoration:none}.article{background:#fff;border:1px solid #e2e8f1;border-radius:24px;overflow:hidden}.ah,.body{padding:42px 52px}.ah{background:#f9fbff}.ah small{color:#2b68e8;font-weight:800}.ah h1{font-size:clamp(32px,5vw,47px);margin:11px 0}.ah p,.lead{color:#64748a;line-height:1.65}.steps{display:grid;gap:12px}.step{display:flex;gap:14px;padding:17px;background:#f7f9fc;border:1px solid #e8edf4;border-radius:14px}.step>span{display:grid;place-items:center;min-width:29px;height:29px;border-radius:9px;background:#e7efff;color:#2462e3;font-weight:800}.step p{margin:3px 0;line-height:1.55}.note{margin-top:32px;padding:18px 20px;border-inline-start:4px solid #2c6cf1;background:#f1f6ff}.related{margin:46px 0}.related>div{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.related a{display:flex;flex-direction:column;gap:7px;background:#fff;border:1px solid #e2e8f1;border-radius:15px;padding:17px;text-decoration:none;color:#152640}.back{padding-bottom:55px}.back a{color:#315fba;text-decoration:none;font-weight:700}@media(max-width:850px){.grid{grid-template-columns:1fr 1fr}}@media(max-width:650px){.grid,.related>div{grid-template-columns:1fr}.ah,.body{padding:28px 22px}}
.search{display:flex;align-items:center;gap:10px}
.search input{width:100%;border:0;outline:0;background:transparent;color:#17243a;font:inherit;font-size:16px}
.search input::placeholder{color:#718096;opacity:1}
.searchIcon{font-size:22px;color:#718096}
.searchMeta{margin:18px 0 0;text-align:center;color:#687990;font-size:14px}
.empty{grid-column:1/-1;background:#fff;border:1px solid #e3e9f2;border-radius:19px;padding:32px;text-align:center;color:#687990}
.clearSearch{border:0;background:transparent;color:#2867e8;font:inherit;font-weight:700;cursor:pointer;margin-inline-start:8px}
`}</style>
    </main>
  );
}
