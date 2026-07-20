"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

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
          <h3 style={titleStyle}>QR-X Sammlung</h3>
          <p style={descriptionStyle}>
            Optional: Verknüpfe eigenständige QR-X, zum Beispiel Produkte,
            Theaterstücke oder Häuser eines Projekts. Bilder, PDFs und
            Anleitungen gehören weiterhin in Medien und Dateien.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          style={actionButtonStyle}
        >
          {open ? "Auswahl schließen" : "+ QR-X sammeln"}
        </button>
      </div>

      {selectedItems.length > 0 ? (
        <div style={selectedBoxStyle}>
          <div style={selectionHeaderStyle}>
            <strong>{selectedItems.length} QR-X verknüpft</strong>
            <span style={hintStyle}>Reihenfolge entspricht deiner Auswahl</span>
          </div>

          <div style={listStyle}>
            {selectedItems.map((item, index) => {
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
                      {item.source === "own"
                        ? "Mein QR-X"
                        : "Gespeicherter QR-X"}{" "}
                      · {item.type === "business" ? "Business" : "Normal"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    style={removeButtonStyle}
                  >
                    Entfernen
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={emptyStyle}>
          Noch keine QR-X verknüpft. Im öffentlichen Detailbereich bleibt die
          Sammlung deshalb ausgeblendet.
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
              Meine QR-X ({ownCount})
            </button>

            <button
              type="button"
              onClick={() => setTab("saved")}
              style={tabButtonStyle(tab === "saved")}
            >
              Gespeicherte ({savedCount})
            </button>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={inputStyle}
            placeholder="QR-X durchsuchen …"
          />

          {loading ? (
            <div style={emptyStyle}>QR-X werden geladen …</div>
          ) : visibleCandidates.length === 0 ? (
            <div style={emptyStyle}>
              In diesem Bereich wurden keine passenden QR-X gefunden.
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
                        {item.type === "business"
                          ? "Business QR-X"
                          : "Normaler QR-X"}
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
