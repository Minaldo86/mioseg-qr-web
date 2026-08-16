"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

type CollectionLanguage = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

const COLLECTION_TEXT = {
  de: { title: "QR-X Sammlung", description: "Optional: Verknüpfe eigenständige QR-X, zum Beispiel Produkte, Theaterstücke oder Häuser eines Projekts. Bilder, PDFs und Anleitungen gehören weiterhin in Medien und Dateien.", close: "Auswahl schließen", collect: "+ QR-X sammeln", linked: "{{count}} QR-X verknüpft", order: "Reihenfolge entspricht deiner Auswahl", untitled: "Unbenannter QR-X", own: "Mein QR-X", saved: "Gespeicherter QR-X", remove: "Entfernen", empty: "Noch keine QR-X verknüpft. Im öffentlichen Detailbereich bleibt die Sammlung deshalb ausgeblendet.", ownTab: "Meine QR-X", savedTab: "Gespeicherte", search: "QR-X durchsuchen …", loading: "QR-X werden geladen …", noResults: "In diesem Bereich wurden keine passenden QR-X gefunden.", business: "Business QR-X", normal: "Normaler QR-X" },
  en: { title: "QR-X Collection", description: "Optionally link standalone QR-X, such as products, references or projects. Images, PDFs and instructions still belong in media and files.", close: "Close selection", collect: "+ Collect QR-X", linked: "{{count}} QR-X linked", order: "Order follows your selection", untitled: "Untitled QR-X", own: "My QR-X", saved: "Saved QR-X", remove: "Remove", empty: "No QR-X linked yet. The collection therefore remains hidden in the public detail view.", ownTab: "My QR-X", savedTab: "Saved", search: "Search QR-X …", loading: "Loading QR-X …", noResults: "No matching QR-X were found in this section.", business: "Business QR-X", normal: "Normal QR-X" },
  tr: { title: "QR-X Koleksiyonu", description: "İsteğe bağlı olarak ürünler, referanslar veya projeler gibi bağımsız QR-X'leri bağla. Görseller, PDF'ler ve talimatlar medya ve dosyalarda kalır.", close: "Seçimi kapat", collect: "+ QR-X topla", linked: "{{count}} QR-X bağlı", order: "Sıralama seçimine göre", untitled: "Adsız QR-X", own: "QR-X'im", saved: "Kaydedilen QR-X", remove: "Kaldır", empty: "Henüz QR-X bağlanmadı. Bu nedenle koleksiyon herkese açık ayrıntı görünümünde gizli kalır.", ownTab: "QR-X'lerim", savedTab: "Kaydedilenler", search: "QR-X ara …", loading: "QR-X yükleniyor …", noResults: "Bu bölümde eşleşen QR-X bulunamadı.", business: "Business QR-X", normal: "Normal QR-X" },
  pl: { title: "Kolekcja QR-X", description: "Opcjonalnie połącz niezależne QR-X, np. produkty, referencje lub projekty. Obrazy, PDF-y i instrukcje nadal należą do mediów i plików.", close: "Zamknij wybór", collect: "+ Dodaj QR-X", linked: "Połączono {{count}} QR-X", order: "Kolejność odpowiada Twojemu wyborowi", untitled: "QR-X bez nazwy", own: "Mój QR-X", saved: "Zapisany QR-X", remove: "Usuń", empty: "Nie połączono jeszcze żadnych QR-X. Kolekcja pozostaje więc ukryta w publicznym widoku szczegółów.", ownTab: "Moje QR-X", savedTab: "Zapisane", search: "Szukaj QR-X …", loading: "Ładowanie QR-X …", noResults: "W tej sekcji nie znaleziono pasujących QR-X.", business: "Business QR-X", normal: "Normalny QR-X" },
  ar: { title: "مجموعة QR-X", description: "يمكنك اختياريًا ربط عناصر QR-X مستقلة مثل المنتجات أو المراجع أو المشاريع. تبقى الصور وملفات PDF والتعليمات ضمن الوسائط والملفات.", close: "إغلاق التحديد", collect: "+ إضافة QR-X", linked: "تم ربط {{count}} QR-X", order: "الترتيب يتبع اختيارك", untitled: "QR-X بلا عنوان", own: "QR-X الخاص بي", saved: "QR-X محفوظ", remove: "إزالة", empty: "لم يتم ربط أي QR-X بعد، لذلك تبقى المجموعة مخفية في صفحة التفاصيل العامة.", ownTab: "QR-X الخاصة بي", savedTab: "المحفوظة", search: "البحث في QR-X …", loading: "جارٍ تحميل QR-X …", noResults: "لم يتم العثور على QR-X مطابق في هذا القسم.", business: "Business QR-X", normal: "QR-X عادي" },
  fr: { title: "Collection QR-X", description: "Associez facultativement des QR-X autonomes, par exemple des produits, références ou projets. Les images, PDF et instructions restent dans les médias et fichiers.", close: "Fermer la sélection", collect: "+ Ajouter des QR-X", linked: "{{count}} QR-X associés", order: "L’ordre suit votre sélection", untitled: "QR-X sans titre", own: "Mon QR-X", saved: "QR-X enregistré", remove: "Supprimer", empty: "Aucun QR-X n’est encore associé. La collection reste donc masquée dans la vue publique.", ownTab: "Mes QR-X", savedTab: "Enregistrés", search: "Rechercher un QR-X …", loading: "Chargement des QR-X …", noResults: "Aucun QR-X correspondant n’a été trouvé dans cette section.", business: "QR-X Business", normal: "QR-X normal" },
  es: { title: "Colección QR-X", description: "Vincula opcionalmente QR-X independientes, como productos, referencias o proyectos. Las imágenes, PDF e instrucciones siguen perteneciendo a medios y archivos.", close: "Cerrar selección", collect: "+ Añadir QR-X", linked: "{{count}} QR-X vinculados", order: "El orden sigue tu selección", untitled: "QR-X sin título", own: "Mi QR-X", saved: "QR-X guardado", remove: "Eliminar", empty: "Todavía no hay ningún QR-X vinculado. Por ello, la colección permanece oculta en la vista pública.", ownTab: "Mis QR-X", savedTab: "Guardados", search: "Buscar QR-X …", loading: "Cargando QR-X …", noResults: "No se encontraron QR-X coincidentes en esta sección.", business: "QR-X Business", normal: "QR-X normal" },
  it: { title: "Raccolta QR-X", description: "Collega facoltativamente QR-X autonomi, ad esempio prodotti, referenze o progetti. Immagini, PDF e istruzioni restano nei media e nei file.", close: "Chiudi selezione", collect: "+ Aggiungi QR-X", linked: "{{count}} QR-X collegati", order: "L’ordine segue la tua selezione", untitled: "QR-X senza titolo", own: "Il mio QR-X", saved: "QR-X salvato", remove: "Rimuovi", empty: "Non è ancora stato collegato alcun QR-X. La raccolta rimane quindi nascosta nella vista pubblica.", ownTab: "I miei QR-X", savedTab: "Salvati", search: "Cerca QR-X …", loading: "Caricamento QR-X …", noResults: "In questa sezione non sono stati trovati QR-X corrispondenti.", business: "QR-X Business", normal: "QR-X normale" },
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
                      · {item.type === "business" ? "Business" : "Normal"}
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
                  "Unbenannter QR-X";
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
