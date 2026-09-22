"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

type CollectionLanguage = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

const COLLECTION_TEXT = {
  de: { title: "Mioseg QR Sammlung", description: "Optional: Verknüpfe eigenständige Mioseg QR, zum Beispiel Produkte, Theaterstücke oder Häuser eines Projekts. Bilder, PDFs und Anleitungen gehören weiterhin in Medien und Dateien.", close: "Auswahl schließen", collect: "+ Mioseg QR sammeln", linked: "{{count}} Mioseg QR verknüpft", order: "Reihenfolge entspricht deiner Auswahl", untitled: "Unbenannter Mioseg QR", own: "Mein Mioseg QR", saved: "Gespeicherter Mioseg QR", remove: "Entfernen", empty: "Noch keine Mioseg QR verknüpft. Im öffentlichen Detailbereich bleibt die Sammlung deshalb ausgeblendet.", ownTab: "Meine Mioseg QR", savedTab: "Gespeicherte", search: "Mioseg QR durchsuchen …", loading: "Mioseg QR werden geladen …", noResults: "In diesem Bereich wurden keine passenden Mioseg QR gefunden.", business: "Business Mioseg QR", normal: "Normaler Mioseg QR" },
  en: { title: "Mioseg QR Collection", description: "Optionally link standalone Mioseg QR, such as products, references or projects. Images, PDFs and instructions still belong in media and files.", close: "Close selection", collect: "+ Collect Mioseg QR", linked: "{{count}} Mioseg QR linked", order: "Order follows your selection", untitled: "Untitled Mioseg QR", own: "My Mioseg QR", saved: "Saved Mioseg QR", remove: "Remove", empty: "No Mioseg QR linked yet. The collection therefore remains hidden in the public detail view.", ownTab: "My Mioseg QR", savedTab: "Saved", search: "Search Mioseg QR …", loading: "Loading Mioseg QR …", noResults: "No matching Mioseg QR were found in this section.", business: "Business Mioseg QR", normal: "Normal Mioseg QR" },
  tr: { title: "Mioseg QR Koleksiyonu", description: "İsteğe bağlı olarak ürünler, referanslar veya projeler gibi bağımsız Mioseg QR'leri bağla. Görseller, PDF'ler ve talimatlar medya ve dosyalarda kalır.", close: "Seçimi kapat", collect: "+ Mioseg QR topla", linked: "{{count}} Mioseg QR bağlı", order: "Sıralama seçimine göre", untitled: "Adsız Mioseg QR", own: "Mioseg QR'im", saved: "Kaydedilen Mioseg QR", remove: "Kaldır", empty: "Henüz Mioseg QR bağlanmadı. Bu nedenle koleksiyon herkese açık ayrıntı görünümünde gizli kalır.", ownTab: "Mioseg QR'lerim", savedTab: "Kaydedilenler", search: "Mioseg QR ara …", loading: "Mioseg QR yükleniyor …", noResults: "Bu bölümde eşleşen Mioseg QR bulunamadı.", business: "Business Mioseg QR", normal: "Normal Mioseg QR" },
  pl: { title: "Kolekcja Mioseg QR", description: "Opcjonalnie połącz niezależne Mioseg QR, np. produkty, referencje lub projekty. Obrazy, PDF-y i instrukcje nadal należą do mediów i plików.", close: "Zamknij wybór", collect: "+ Dodaj Mioseg QR", linked: "Połączono {{count}} Mioseg QR", order: "Kolejność odpowiada Twojemu wyborowi", untitled: "Mioseg QR bez nazwy", own: "Mój Mioseg QR", saved: "Zapisany Mioseg QR", remove: "Usuń", empty: "Nie połączono jeszcze żadnych Mioseg QR. Kolekcja pozostaje więc ukryta w publicznym widoku szczegółów.", ownTab: "Moje Mioseg QR", savedTab: "Zapisane", search: "Szukaj Mioseg QR …", loading: "Ładowanie Mioseg QR …", noResults: "W tej sekcji nie znaleziono pasujących Mioseg QR.", business: "Business Mioseg QR", normal: "Normalny Mioseg QR" },
  ar: { title: "مجموعة Mioseg QR", description: "يمكنك اختياريًا ربط عناصر Mioseg QR مستقلة مثل المنتجات أو المراجع أو المشاريع. تبقى الصور وملفات PDF والتعليمات ضمن الوسائط والملفات.", close: "إغلاق التحديد", collect: "+ إضافة Mioseg QR", linked: "تم ربط {{count}} Mioseg QR", order: "الترتيب يتبع اختيارك", untitled: "Mioseg QR بلا عنوان", own: "Mioseg QR الخاص بي", saved: "Mioseg QR محفوظ", remove: "إزالة", empty: "لم يتم ربط أي Mioseg QR بعد، لذلك تبقى المجموعة مخفية في صفحة التفاصيل العامة.", ownTab: "Mioseg QR الخاصة بي", savedTab: "المحفوظة", search: "البحث في Mioseg QR …", loading: "جارٍ تحميل Mioseg QR …", noResults: "لم يتم العثور على Mioseg QR مطابق في هذا القسم.", business: "Business Mioseg QR", normal: "Mioseg QR عادي" },
  fr: { title: "Collection Mioseg QR", description: "Associez facultativement des Mioseg QR autonomes, par exemple des produits, références ou projets. Les images, PDF et instructions restent dans les médias et fichiers.", close: "Fermer la sélection", collect: "+ Ajouter des Mioseg QR", linked: "{{count}} Mioseg QR associés", order: "L’ordre suit votre sélection", untitled: "Mioseg QR sans titre", own: "Mon Mioseg QR", saved: "Mioseg QR enregistré", remove: "Supprimer", empty: "Aucun Mioseg QR n’est encore associé. La collection reste donc masquée dans la vue publique.", ownTab: "Mes Mioseg QR", savedTab: "Enregistrés", search: "Rechercher un Mioseg QR …", loading: "Chargement des Mioseg QR …", noResults: "Aucun Mioseg QR correspondant n’a été trouvé dans cette section.", business: "Mioseg QR Business", normal: "Mioseg QR normal" },
  es: { title: "Colección Mioseg QR", description: "Vincula opcionalmente Mioseg QR independientes, como productos, referencias o proyectos. Las imágenes, PDF e instrucciones siguen perteneciendo a medios y archivos.", close: "Cerrar selección", collect: "+ Añadir Mioseg QR", linked: "{{count}} Mioseg QR vinculados", order: "El orden sigue tu selección", untitled: "Mioseg QR sin título", own: "Mi Mioseg QR", saved: "Mioseg QR guardado", remove: "Eliminar", empty: "Todavía no hay ningún Mioseg QR vinculado. Por ello, la colección permanece oculta en la vista pública.", ownTab: "Mis Mioseg QR", savedTab: "Guardados", search: "Buscar Mioseg QR …", loading: "Cargando Mioseg QR …", noResults: "No se encontraron Mioseg QR coincidentes en esta sección.", business: "Mioseg QR Business", normal: "Mioseg QR normal" },
  it: { title: "Raccolta Mioseg QR", description: "Collega facoltativamente Mioseg QR autonomi, ad esempio prodotti, referenze o progetti. Immagini, PDF e istruzioni restano nei media e nei file.", close: "Chiudi selezione", collect: "+ Aggiungi Mioseg QR", linked: "{{count}} Mioseg QR collegati", order: "L’ordine segue la tua selezione", untitled: "Mioseg QR senza titolo", own: "Il mio Mioseg QR", saved: "Mioseg QR salvato", remove: "Rimuovi", empty: "Non è ancora stato collegato alcun Mioseg QR. La raccolta rimane quindi nascosta nella vista pubblica.", ownTab: "I miei Mioseg QR", savedTab: "Salvati", search: "Cerca Mioseg QR …", loading: "Caricamento Mioseg QR …", noResults: "In questa sezione non sono stati trovati Mioseg QR corrispondenti.", business: "Mioseg QR Business", normal: "Mioseg QR normale" },
} as const;

function normalizeCollectionLanguage(value: unknown): CollectionLanguage {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && ["de","en","tr","pl","ar","fr","es","it"].includes(raw)
    ? (raw as CollectionLanguage)
    : "de";
}

export type QrxCollectionCandidate = {
  id: string;
  title: string | null;
  company_name: string | null;
  type: "normal" | "business" | string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  source: "own" | "saved";
  custom_title?: string | null;
};

type CollectionSelectorProps = {
  candidates: QrxCollectionCandidate[];
  selectedIds: string[];
  loading?: boolean;
  onChange: (selectedIds: string[]) => void;
};

export default function CollectionSelector({
  candidates,
  selectedIds,
  loading = false,
  onChange,
}: CollectionSelectorProps) {
  const params = useParams<{ locale?: string }>();
  const ui = COLLECTION_TEXT[normalizeCollectionLanguage(params?.locale)];

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"own" | "saved">("own");
  const [search, setSearch] = useState("");

  const selectedItems = useMemo(
    () =>
      selectedIds
        .map((id) => candidates.find((item) => item.id === id))
        .filter((item): item is QrxCollectionCandidate => Boolean(item)),
    [candidates, selectedIds],
  );

  const visibleCandidates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return candidates.filter((item) => {
      if (item.source !== tab) return false;
      if (!normalizedSearch) return true;

      return [item.title, item.company_name, item.custom_title]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [candidates, search, tab]);

  const ownCount = candidates.filter((item) => item.source === "own").length;
  const savedCount = candidates.filter((item) => item.source === "saved").length;

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((value) => value !== id)
        : [...selectedIds, id],
    );
  }

  function remove(id: string) {
    onChange(selectedIds.filter((value) => value !== id));
  }

  return (
    <div style={sectionStyle}>
      <div style={headerStyle}>
        <div>
          <h3 style={titleStyle}>{ui.title}</h3>
          <p style={descriptionStyle}>{ui.description}</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          style={actionButtonStyle}
        >
          {open ? ui.close : ui.collect}
        </button>
      </div>

      {selectedItems.length > 0 ? (
        <div style={selectedBoxStyle}>
          <div style={selectionHeaderStyle}>
            <strong>{ui.linked.replace("{{count}}", String(selectedItems.length))}</strong>
            <span style={hintStyle}>{ui.order}</span>
          </div>

          <div style={listStyle}>
            {selectedItems.map((item, index) => {
              const displayTitle =
                item.custom_title?.trim() ||
                item.company_name?.trim() ||
                item.title?.trim() ||
                ui.untitled;
              const image =
                item.logo_url?.trim() ||
                item.cover_image_url?.trim() ||
                null;

              return (
                <div key={item.id} style={selectedRowStyle}>
                  <div style={indexStyle}>{index + 1}</div>

                  <div style={thumbStyle}>
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        style={imageStyle}
                      />
                    ) : (
                      <span>▣</span>
                    )}
                  </div>

                  <div style={itemTextStyle}>
                    <div style={itemTitleStyle}>{displayTitle}</div>
                    <div style={itemMetaStyle}>
                      {item.source === "own" ? ui.own : ui.saved}{" "}
                      · {item.type === "business" ? ui.business : ui.normal}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    style={removeButtonStyle}
                  >
                    {ui.remove}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={emptyStyle}>
          {ui.empty}
        </div>
      )}

      {open ? (
        <div style={pickerStyle}>
          <div style={tabsStyle}>
            <button
              type="button"
              onClick={() => setTab("own")}
              style={tabButtonStyle(tab === "own")}
            >
              {ui.ownTab} ({ownCount})
            </button>

            <button
              type="button"
              onClick={() => setTab("saved")}
              style={tabButtonStyle(tab === "saved")}
            >
              {ui.savedTab} ({savedCount})
            </button>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={inputStyle}
            placeholder={ui.search}
          />

          {loading ? (
            <div style={emptyStyle}>{ui.loading}</div>
          ) : visibleCandidates.length === 0 ? (
            <div style={emptyStyle}>
              {ui.noResults}
            </div>
          ) : (
            <div style={candidateListStyle}>
              {visibleCandidates.map((item) => {
                const selected = selectedIds.includes(item.id);
                const displayTitle =
                  item.custom_title?.trim() ||
                  item.company_name?.trim() ||
                  item.title?.trim() ||
                  ui.untitled;
                const image =
                  item.logo_url?.trim() ||
                  item.cover_image_url?.trim() ||
                  null;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    style={candidateButtonStyle(selected)}
                  >
                    <span style={checkboxStyle(selected)}>
                      {selected ? "✓" : ""}
                    </span>

                    <span style={thumbStyle}>
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          style={imageStyle}
                        />
                      ) : (
                        <span>▣</span>
                      )}
                    </span>

                    <span style={candidateTextStyle}>
                      <span style={candidateTitleStyle}>{displayTitle}</span>
                      <span style={candidateMetaStyle}>
                        {item.type === "business" ? ui.business : ui.normal}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 22,
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  color: "#ffffff",
  fontSize: 18,
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  lineHeight: 1.55,
};

const actionButtonStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 14,
  padding: "0 14px",
  border: "1px solid rgba(147,197,253,0.28)",
  background: "rgba(37,99,235,0.16)",
  color: "#dbeafe",
  fontWeight: 900,
  cursor: "pointer",
};

const selectedBoxStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 14,
  borderRadius: 18,
  background: "rgba(37,99,235,0.08)",
  border: "1px solid rgba(147,197,253,0.16)",
};

const selectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  color: "#ffffff",
};

const hintStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
};

const listStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const selectedRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "34px 46px minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 10,
  padding: 10,
  borderRadius: 16,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.07)",
};

const indexStyle: CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.08)",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 950,
};

const thumbStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 12,
  overflow: "hidden",
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.07)",
  color: "#dbeafe",
  flexShrink: 0,
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const itemTextStyle: CSSProperties = {
  minWidth: 0,
};

const itemTitleStyle: CSSProperties = {
  color: "#ffffff",
  fontWeight: 950,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const itemMetaStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  marginTop: 3,
};

const removeButtonStyle: CSSProperties = {
  minHeight: 34,
  borderRadius: 12,
  padding: "0 10px",
  border: "1px solid rgba(248,113,113,0.26)",
  background: "rgba(239,68,68,0.12)",
  color: "#fecaca",
  fontWeight: 850,
  cursor: "pointer",
};

const emptyStyle: CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,255,255,0.035)",
  border: "1px dashed rgba(148,163,184,0.18)",
  color: "#94a3b8",
  lineHeight: 1.55,
};

const pickerStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  padding: 14,
  borderRadius: 18,
  background: "rgba(2,6,23,0.46)",
  border: "1px solid rgba(148,163,184,0.14)",
};

const tabsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

function tabButtonStyle(active: boolean): CSSProperties {
  return {
    minHeight: 42,
    borderRadius: 14,
    border: active
      ? "1px solid rgba(147,197,253,0.32)"
      : "1px solid rgba(255,255,255,0.08)",
    background: active
      ? "rgba(37,99,235,0.22)"
      : "rgba(255,255,255,0.04)",
    color: active ? "#dbeafe" : "#94a3b8",
    fontWeight: 900,
    cursor: "pointer",
  };
}

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(255,255,255,0.045)",
  color: "#ffffff",
  padding: "0 14px",
  outline: "none",
};

const candidateListStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  maxHeight: 420,
  overflowY: "auto",
  paddingRight: 3,
};

function candidateButtonStyle(selected: boolean): CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "30px 42px minmax(0, 1fr)",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: 10,
    borderRadius: 16,
    border: selected
      ? "1px solid rgba(96,165,250,0.42)"
      : "1px solid rgba(255,255,255,0.07)",
    background: selected
      ? "rgba(37,99,235,0.14)"
      : "rgba(255,255,255,0.035)",
    cursor: "pointer",
  };
}

function checkboxStyle(selected: boolean): CSSProperties {
  return {
    width: 26,
    height: 26,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    border: selected
      ? "1px solid rgba(147,197,253,0.55)"
      : "1px solid rgba(148,163,184,0.28)",
    background: selected ? "#2563eb" : "transparent",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 950,
  };
}

const candidateTextStyle: CSSProperties = {
  minWidth: 0,
  textAlign: "left",
};

const candidateTitleStyle: CSSProperties = {
  display: "block",
  color: "#ffffff",
  fontWeight: 950,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const candidateMetaStyle: CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: 12,
  marginTop: 3,
};
