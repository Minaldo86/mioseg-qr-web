"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import CollectionSelector, { type QrxCollectionCandidate } from "@/components/qrx/CollectionSelector";
import { supabase } from "@/lib/supabase";
import styles from "../../../dashboard.module.css";


type QrxWebLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";

function normalizeQrxLocale(value: string): QrxWebLocale {
  const normalized = value.trim().toLowerCase().split(/[-_]/)[0];
  return (["de", "en", "tr", "pl", "ar", "fr", "es", "it"] as const).includes(normalized as QrxWebLocale)
    ? (normalized as QrxWebLocale)
    : "de";
}


async function createPositionedCoverFile(
  file: File,
  positionX: number,
  positionY: number,
  zoomPercent: number,
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const targetWidth = 1600;
  const targetHeight = 900;
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = bitmap.width / bitmap.height;

  let cropWidth = bitmap.width;
  let cropHeight = bitmap.height;
  if (sourceRatio > targetRatio) cropWidth = bitmap.height * targetRatio;
  else cropHeight = bitmap.width / targetRatio;

  const zoom = Math.min(2, Math.max(1, zoomPercent / 100));
  cropWidth /= zoom;
  cropHeight /= zoom;

  const maxX = Math.max(0, bitmap.width - cropWidth);
  const maxY = Math.max(0, bitmap.height - cropHeight);
  const sourceX = maxX * (Math.min(100, Math.max(0, positionX)) / 100);
  const sourceY = maxY * (Math.min(100, Math.max(0, positionY)) / 100);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Coverbild konnte nicht vorbereitet werden.");

  context.drawImage(
    bitmap,
    sourceX, sourceY, cropWidth, cropHeight,
    0, 0, targetWidth, targetHeight,
  );
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("Coverbild konnte nicht erstellt werden.")),
      "image/jpeg",
      0.92,
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, "") || "cover";
  return new File([blob], `${baseName}-cover.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

function drawPositionedCoverPreview(
  canvas: HTMLCanvasElement,
  bitmap: ImageBitmap,
  positionX: number,
  positionY: number,
  zoomPercent: number,
) {
  const targetWidth = 1600;
  const targetHeight = 900;
  const targetRatio = targetWidth / targetHeight;
  const sourceRatio = bitmap.width / bitmap.height;

  let cropWidth = bitmap.width;
  let cropHeight = bitmap.height;
  if (sourceRatio > targetRatio) cropWidth = bitmap.height * targetRatio;
  else cropHeight = bitmap.width / targetRatio;

  const zoom = Math.min(2, Math.max(1, zoomPercent / 100));
  cropWidth /= zoom;
  cropHeight /= zoom;

  const maxX = Math.max(0, bitmap.width - cropWidth);
  const maxY = Math.max(0, bitmap.height - cropHeight);
  const sourceX = maxX * (Math.min(100, Math.max(0, positionX)) / 100);
  const sourceY = maxY * (Math.min(100, Math.max(0, positionY)) / 100);

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, targetWidth, targetHeight);
  context.drawImage(
    bitmap,
    sourceX, sourceY, cropWidth, cropHeight,
    0, 0, targetWidth, targetHeight,
  );
}

const QR_FORM_TEXT = {
  de: {
    dashboard: "Dashboard",
    myQrx: "Meine QR-X",
    createKicker: "QR-X erstellen",
    newTitle: "Neuen QR-X erstellen",
    createHero: "Erstelle deinen QR-X inklusive Logo, Coverbild, Galerie-Bildern, Dateien/PDFs, Standort, Passwortschutz und Credit-Prüfung.",
    backMyQrx: "Zurück zu Meine QR-X",
    baseData: "Basisdaten",
    baseHint: "Wähle den Typ und trage die wichtigsten Informationen ein.",
    businessQrx: "Business QR-X",
    normalQrx: "Normaler QR-X",
    hideNotice: "Hinweis ausblenden",
    creditCheck: "Credit-Prüfung",
    currentCredits: "Aktuelle Credits",
    refreshing: "Aktualisiere …",
    refreshCredits: "Credits aktualisieren",
    costsLoading: "Kosten werden geladen …",
    firstNormalFree: "Dieser normale QR-X ist kostenlos, weil es dein erster normaler QR-X ist.",
    costs: "kostet",
    verification: "Verifizierung",
    insufficient: "Nicht genügend Credits.",
    required: "Benötigt",
    available: "vorhanden",
    buyCredits: "Credits kaufen",
    logo: "Logo",
    logoHint: "Optional: Lade ein Logo hoch. Es wird später in deinem QR-X angezeigt.",
    chooseLogo: "Logo auswählen",
    cover: "Coverbild",
    coverHint: "Optional: Das Coverbild erscheint später als großes Titelbild.",
    chooseCover: "Coverbild auswählen",
    title: "Titel *",
    category: "Kategorie",
    categoryHint: "Hilft später für Explore, Karte und Rankings. Du kannst die Kategorie später wieder ändern.",
    description: "Beschreibung",
    news: "News & Updates",
    newsHint: "Optional: Informiere Nutzer direkt über Änderungen, Angebote, Öffnungszeiten oder wichtige Hinweise.",
    newsPlaceholder: "z. B. Neue Speisekarte verfügbar, geänderte Öffnungszeiten oder aktuelles Angebot …",
    addNews: "+ News hinzufügen",
    delete: "Löschen",
    collection: "Sammlung",
    collectionHint: "Verknüpfe weitere eigenständige QR-X, zum Beispiel Produkte, Referenzen oder Projekte.",
    collectionTitle: "Titel der Sammlung",
    collectionTitlePlaceholder: "z. B. Unsere Referenzen, Aktuelle Projekte oder Unsere Produkte",
    collectionDescription: "Beschreibung der Sammlung",
    collectionDescriptionPlaceholder: "Optional: Beschreibe kurz, was Nutzer in dieser Sammlung finden.",
    collectionAutoHint: "Ohne eigenen Titel wird im Detailbereich automatisch „Sammlung“ angezeigt. Eine leere Beschreibung wird vollständig ausgeblendet.",
    location: "Standort",
    locationHint: "Lege fest, ob dieser QR-X ohne Standort gespeichert wird, den aktuellen Standort nutzt oder manuelle Koordinaten bekommt.",
    noLocation: "Kein Standort",
    currentLocation: "Aktuellen Standort übernehmen",
    locationLoading: "Standort wird geladen …",
    locationPlaceholder: "z. B. Mioseg Köln",
    latitude: "Breitengrad",
    longitude: "Längengrad",
    contact: "Kontakt & Aktionen",
    contactHint: "Diese Angaben erscheinen später als Buttons in der QR-X Webansicht.",
    phone: "Telefon",
    website: "Webseite",
    email: "E-Mail",
    navigation: "Navigation",
    addressPlaceholder: "Adresse oder Google-Maps-Link",
    gallery: "Galerie-Bilder",
    galleryHint: "Optional: Lade direkt Bilder hoch, die später in deinem QR-X erscheinen.",
    chooseGallery: "Galerie-Bilder auswählen",
    selectedImages: "{{count}} Bild(er) ausgewählt",
    removeAllImages: "Alle Bilder entfernen",
    files: "Dateien / PDFs",
    chooseFiles: "Dateien auswählen",
    selectedFiles: "{{count}} Datei(en) ausgewählt",
    removeAllFiles: "Alle Dateien entfernen",
    file: "Datei",
    verificationTitle: "Verifizierung",
    verificationIntro: "Mit einer Verifizierung zeigst du Besuchern, dass Angaben und Nachweise zu diesem QR-X geprüft wurden.",
    verifiedBadgeBenefit: "Das Verifiziert-Abzeichen macht den geprüften Status für Nutzer sofort erkennbar.",
    credibility: "Höhere Glaubwürdigkeit",
    credibilityText: "Besonders wertvoll für Unternehmen, Vereine, Wohltätigkeitsorganisationen und Sehenswürdigkeiten.",
    badge: "Sichtbares Verifiziert-Abzeichen",
    badgeText: "Nach erfolgreicher Prüfung erscheint ein dezentes Verifiziert-Abzeichen direkt am QR-X.",
    privateDocs: "Nachweise bleiben privat",
    privateDocsText: "Hochgeladene Nachweise dienen nur der Prüfung und werden nicht öffentlich im QR-X angezeigt.",
    requestVerification: "Verifizierung beantragen",
    refundHint: "Bei Ablehnung werden die Verifizierungs-Credits zurückerstattet.",
    proofHint: "Lade für die Prüfung einen geeigneten Nachweis als Bild oder PDF hoch.",
    chooseProof: "Nachweis auswählen (Bild oder PDF)",
    proofInstruction: "Bitte lade einen Gewerbenachweis, eine Rechnung, ein offizielles Dokument oder einen ähnlichen Nachweis hoch.",
    passwordProtection: "QR-X mit Passwort schützen",
    passwordHint: "Wenn aktiviert, müssen Besucher vor dem Öffnen dieses QR-X ein Passwort eingeben.",
    password: "Passwort *",
    repeatPassword: "Passwort wiederholen *",
    selected: "Ausgewählt",
    storageCredits: "Speicher-Credits",
    storageHint: "Für den ausgewählten Speicher werden voraussichtlich zusätzliche Credits benötigt. Das Kontingent bleibt diesem QR-X erhalten, auch wenn später Dateien gelöscht werden.",
    noStorageCost: "Voraussichtlich keine zusätzlichen Speicher-Credits nötig.",
    costOverview: "Übersicht der geschätzten Kosten vor dem Erstellen.",
    cancel: "Abbrechen",
    creating: "Erstellt & lädt Medien hoch …",
    notEnoughCredits: "Nicht genug Credits",
    createQrx: "QR-X erstellen",
    editKicker: "QR-X bearbeiten",
    editTitle: "QR-X bearbeiten",
    editHero: "Bearbeite die Basisdaten deines QR-X, verwalte den Passwortschutz und beantrage für Business QR-X die Verifizierung.",
    openQrx: "QR-X öffnen",
    baseMedia: "Basisdaten & Medien",
    editBaseHint: "Ändere Typ, Titel, Beschreibung, Standort, Kontaktaktionen und Medien in einem Formular.",
    collectionEmptyConfirm: "Die Sammlung ist jetzt leer. Möchtest du auch Titel und Beschreibung der Sammlung entfernen?\n\nOK = entfernen\nAbbrechen = behalten",
    locationAutoFailed: "Standort konnte nicht automatisch ermittelt werden. Bitte gib die Koordinaten manuell ein.",
    enterTitle: "Bitte gib einen Titel ein.",
    passwordMin: "Das Passwort muss mindestens 4 Zeichen lang sein.",
    passwordMismatch: "Die beiden Passwörter stimmen nicht überein.",
    login: "Bitte melde dich zuerst an.",
    sessionExpired: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
    unknownError: "Unbekannter Fehler",
    validNumber: "{{label}} muss eine gültige Zahl sein.",
    creditsLoadFailed: "Credits und QR-X-Kosten konnten nicht geladen werden.",
    creditsChargeFailed: "Credits konnten nicht abgezogen werden.",
    creditsRefundFailed: "Credits konnten nicht zurückgebucht werden.",
    newsRequired: "Bitte gib zuerst einen Text für die News ein.",
    verificationImagePdf: "Bitte lade für die Verifizierung nur ein Bild oder eine PDF-Datei hoch.",
    verificationBusinessOnly: "Eine Verifizierung ist nur für Business QR-X möglich.",
    verificationProofRequired: "Bitte lade für die Verifizierung ein Dokument oder Bild hoch.",
    pricingStillLoading: "Credits und QR-X-Kosten werden noch geladen. Bitte versuche es gleich erneut.",
    draftRestored: "Dein QR-X Entwurf wurde wiederhergestellt. Bitte wähle Logo, Cover, Galerie-Bilder, Dateien/PDFs und Verifizierungsnachweise bei Bedarf erneut aus.",
    save: "QR-X speichern",
    saving: "Speichert …",
    saved: "QR-X wurde gespeichert.",
    savedMedia: "QR-X und Medien wurden gespeichert.",
    media: "Bilder & Medien",
    availableStorage: "Verfügbar",
    storagePermanent: "Dein gekauftes Speicherkontingent bleibt erhalten, auch wenn du Bilder oder Dateien später löschst.",
    afterSave: "Nach dem Speichern",
    newSelected: "Neu ausgewählt",
    additionalCost: "Zusatzkosten",
    creditsAdditional: "Credits & Zusatzkosten",
    creditsAdditionalHint: "Wenn beim Bearbeiten zusätzlicher Speicher benötigt wird, werden nur die neuen Speicherpakete berechnet.",
    additionalStorageCredits: "Zusätzliche Speicher-Credits",
    missingCredits: "Fehlende Credits",
    noAdditionalCredits: "Für die aktuelle Auswahl sind keine zusätzlichen Speicher-Credits nötig.",
    deleteLogo: "Logo löschen",
    deleteCover: "Cover löschen",
    remove: "Entfernen",
    verificationLater: "Business-Verifizierung nachträglich beantragen",
    cost: "Kosten",
    currentCreditsShort: "Aktuelle Credits",
    chooseEvidence: "Nachweis auswählen",
    submitting: "Antrag wird eingereicht …",
    verificationSubmitted: "Verifizierungsantrag wurde eingereicht. Dein QR-X wird nun geprüft.",
    lastRequest: "Letzter Antrag",
    pending: "In Prüfung",
    pendingText: "Dein Verifizierungsantrag liegt vor und wird geprüft.",
    rejectedText: "Dein letzter Verifizierungsantrag wurde abgelehnt. Du kannst einen neuen Antrag einreichen.",
    notVerified: "Noch nicht verifiziert.",
    onlyBusinessVerify: "Nur Business QR-X können verifiziert werden.",
    alreadyVerification: "Für diesen QR-X liegt bereits ein Verifizierungsantrag vor.",
    proofImagePdf: "Bitte lade einen Nachweis als Bild oder PDF hoch.",
    chooseLogoImage: "Bitte wähle für das Logo ein Bild aus.",
    chooseCoverImage: "Bitte wähle für das Cover ein Bild aus.",
    confirmDeleteMedia: "Möchtest du „{{name}}“ wirklich löschen? Das gekaufte Speicherkontingent bleibt erhalten.",
    mediaRemoved: "Medium wurde entfernt. Dein gekauftes Speicherlimit bleibt erhalten.",
    mediaDeleteFailed: "Medium konnte nicht gelöscht werden.",
    confirmRemoveLogo: "Möchtest du das Logo wirklich entfernen?",
    confirmRemoveCover: "Möchtest du das Coverbild wirklich entfernen?",
    creditsUpdated: "Credits wurden aktualisiert.",
    removeLogo: "Logo entfernen",
    coverPreviewAlt: "Coverbild Vorschau",
    removeCover: "Coverbild entfernen",
    locationNameLabel: "Standortname",
    filesHint: "Optional: Lade Dateien wie PDF, Preisliste, Speisekarte, Dokumente oder Bilder direkt mit hoch.",
    verificationPreviewAlt: "Verifizierungsnachweis Vorschau",
    mediaManageHint: "Verwalte Logo, Coverbild, Galerie-Bilder und Dateien direkt auf dieser Bearbeitungsseite.",
    currentCoverAlt: "Aktuelles Coverbild",
    noCover: "Noch kein Coverbild hinterlegt.",
    removeSelection: "Auswahl entfernen",
    companyName: "Firmenname",
    categoryLabel: "Kategorie",
    manualCoordinates: "Koordinaten manuell eingeben",
    exampleLat: "z. B. 50.9375",
    exampleLng: "z. B. 6.9603",
    storageQuota: "Speicher-Kontingent",
    storageQuotaHint: "{{free}} MB sind pro QR-X inklusive. Danach kostet jedes weitere Paket mit {{pack}} MB genau 1 Credit.",
    quotaAfterCreation: "Kontingent nach Erstellung",
    totalCosts: "Gesamtkosten",
    qrxCreation: "QR-X Erstellung",
    totalLabel: "Gesamt",
    buyCreditsTitle: "Credits kaufen",
    buyCreditsHint: "Kaufe Credits in einem neuen Tab. Deine Eingaben auf dieser Seite bleiben erhalten.",
    newsScrollHint: "Max. {{count}} sichtbar · Bereich ist scrollbar",
    logoPreviewAlt: "Logo Vorschau",
    currentLogoAlt: "Aktuelles Logo",
    noLogo: "Noch kein Logo hinterlegt.",
    storageRuleShort: "2 MB kostenlos · danach +5 MB = 1 Credit",
    coverAdjustTitle: "Bildausschnitt anpassen",
    coverAdjustHint: "Verschiebe und zoome das Bild, bis das Motiv im sichtbaren Bereich richtig sitzt.",
    coverHorizontal: "Horizontal",
    coverVertical: "Vertikal",
    coverZoom: "Zoom",
    coverCenter: "Zentrieren",
    createFailed: "QR-X konnte nicht erstellt werden.",
  },
  en: {
    dashboard: "Dashboard",
    myQrx: "My QR-X",
    createKicker: "Create QR-X",
    newTitle: "Create a new QR-X",
    createHero: "Create your QR-X with logo, cover image, gallery images, files/PDFs, location, password protection and Credit check.",
    backMyQrx: "Back to My QR-X",
    baseData: "Basic data",
    baseHint: "Choose the type and enter the most important information.",
    businessQrx: "Business QR-X",
    normalQrx: "Normal QR-X",
    hideNotice: "Dismiss notice",
    creditCheck: "Credit check",
    currentCredits: "Current Credits",
    refreshing: "Refreshing …",
    refreshCredits: "Refresh Credits",
    costsLoading: "Loading costs …",
    firstNormalFree: "This normal QR-X is free because it is your first normal QR-X.",
    costs: "costs",
    verification: "Verification",
    insufficient: "Not enough Credits.",
    required: "Required",
    available: "available",
    buyCredits: "Buy Credits",
    logo: "Logo",
    logoHint: "Optional: Upload a logo. It will later be shown in your QR-X.",
    chooseLogo: "Choose logo",
    cover: "Cover image",
    coverHint: "Optional: The cover image will later appear as the large header image.",
    chooseCover: "Choose cover image",
    title: "Title *",
    category: "Category",
    categoryHint: "Helps with Explore, map and rankings. You can change the category later.",
    description: "Description",
    news: "News & updates",
    newsHint: "Optional: Inform users directly about changes, offers, opening hours or important notices.",
    newsPlaceholder: "e.g. new menu available, changed opening hours or current offer …",
    addNews: "+ Add news",
    delete: "Delete",
    collection: "Collection",
    collectionHint: "Link additional standalone QR-X, such as products, references or projects.",
    collectionTitle: "Collection title",
    collectionTitlePlaceholder: "e.g. Our references, Current projects or Our products",
    collectionDescription: "Collection description",
    collectionDescriptionPlaceholder: "Optional: Briefly describe what users can find in this collection.",
    collectionAutoHint: "Without a custom title, “Collection” is shown automatically in the detail view. An empty description is hidden completely.",
    location: "Location",
    locationHint: "Choose whether this QR-X is saved without a location, uses your current location or manual coordinates.",
    noLocation: "No location",
    currentLocation: "Use current location",
    locationLoading: "Loading location …",
    locationPlaceholder: "e.g. Mioseg Cologne",
    latitude: "Latitude",
    longitude: "Longitude",
    contact: "Contact & actions",
    contactHint: "These details later appear as buttons in the QR-X web view.",
    phone: "Phone",
    website: "Website",
    email: "Email",
    navigation: "Navigation",
    addressPlaceholder: "Address or Google Maps link",
    gallery: "Gallery images",
    galleryHint: "Optional: Upload images now that will later appear in your QR-X.",
    chooseGallery: "Choose gallery images",
    selectedImages: "{{count}} image(s) selected",
    removeAllImages: "Remove all images",
    files: "Files / PDFs",
    chooseFiles: "Choose files",
    selectedFiles: "{{count}} file(s) selected",
    removeAllFiles: "Remove all files",
    file: "File",
    verificationTitle: "Verification",
    verificationIntro: "Verification shows visitors that information and evidence for this QR-X have been reviewed.",
    verifiedBadgeBenefit: "The verified badge makes the reviewed status immediately visible to users.",
    credibility: "Higher credibility",
    credibilityText: "Especially valuable for companies, clubs, charities and attractions.",
    badge: "Visible verified badge",
    badgeText: "After successful review, a subtle verified badge appears directly on the QR-X.",
    privateDocs: "Evidence stays private",
    privateDocsText: "Uploaded evidence is used only for review and is not displayed publicly in the QR-X.",
    requestVerification: "Request verification",
    refundHint: "Verification Credits are refunded if the request is rejected.",
    proofHint: "Upload suitable evidence as an image or PDF for review.",
    chooseProof: "Choose evidence (image or PDF)",
    proofInstruction: "Please upload a business document, invoice, official document or similar evidence.",
    passwordProtection: "Protect QR-X with password",
    passwordHint: "When enabled, visitors must enter a password before opening this QR-X.",
    password: "Password *",
    repeatPassword: "Repeat password *",
    selected: "Selected",
    storageCredits: "Storage Credits",
    storageHint: "Additional Credits may be required for the selected storage. The purchased allowance remains assigned to this QR-X even if files are deleted later.",
    noStorageCost: "No additional storage Credits are expected.",
    costOverview: "Overview of estimated costs before creation.",
    cancel: "Cancel",
    creating: "Creating & uploading media …",
    notEnoughCredits: "Not enough Credits",
    createQrx: "Create QR-X",
    editKicker: "Edit QR-X",
    editTitle: "Edit QR-X",
    editHero: "Edit the basic data of your QR-X, manage password protection and request verification for Business QR-X.",
    openQrx: "Open QR-X",
    baseMedia: "Basic data & media",
    editBaseHint: "Edit type, title, description, location, contact actions and media in one form.",
    collectionEmptyConfirm: "The collection is now empty. Do you also want to remove its title and description?\n\nOK = remove\nCancel = keep",
    locationAutoFailed: "Location could not be determined automatically. Please enter coordinates manually.",
    enterTitle: "Please enter a title.",
    passwordMin: "The password must be at least 4 characters long.",
    passwordMismatch: "The two passwords do not match.",
    login: "Please sign in first.",
    sessionExpired: "Your session has expired. Please sign in again.",
    unknownError: "Unknown error",
    validNumber: "{{label}} must be a valid number.",
    creditsLoadFailed: "Credits and QR-X costs could not be loaded.",
    creditsChargeFailed: "Credits could not be charged.",
    creditsRefundFailed: "Credits could not be refunded.",
    newsRequired: "Please enter text for the news item first.",
    verificationImagePdf: "Please upload only an image or PDF for verification.",
    verificationBusinessOnly: "Verification is only available for Business QR-X.",
    verificationProofRequired: "Please upload a document or image for verification.",
    pricingStillLoading: "Credits and QR-X costs are still loading. Please try again shortly.",
    draftRestored: "Your QR-X draft was restored. Please select logo, cover, gallery images, files/PDFs and verification evidence again if needed.",
    save: "Save QR-X",
    saving: "Saving …",
    saved: "QR-X saved.",
    savedMedia: "QR-X and media saved.",
    media: "Images & media",
    availableStorage: "Available",
    storagePermanent: "Your purchased storage allowance remains available even if you delete images or files later.",
    afterSave: "After saving",
    newSelected: "Newly selected",
    additionalCost: "Additional cost",
    creditsAdditional: "Credits & additional costs",
    creditsAdditionalHint: "When editing requires additional storage, only the new storage packages are charged.",
    additionalStorageCredits: "Additional storage Credits",
    missingCredits: "Missing Credits",
    noAdditionalCredits: "No additional storage Credits are required for the current selection.",
    deleteLogo: "Delete logo",
    deleteCover: "Delete cover",
    remove: "Remove",
    verificationLater: "Request Business verification later",
    cost: "Cost",
    currentCreditsShort: "Current Credits",
    chooseEvidence: "Choose evidence",
    submitting: "Submitting request …",
    verificationSubmitted: "Verification request submitted. Your QR-X will now be reviewed.",
    lastRequest: "Last request",
    pending: "Under review",
    pendingText: "Your verification request has been submitted and is being reviewed.",
    rejectedText: "Your last verification request was rejected. You can submit a new request.",
    notVerified: "Not verified yet.",
    onlyBusinessVerify: "Only Business QR-X can be verified.",
    alreadyVerification: "A verification request already exists for this QR-X.",
    proofImagePdf: "Please upload evidence as an image or PDF.",
    chooseLogoImage: "Please choose an image for the logo.",
    chooseCoverImage: "Please choose an image for the cover.",
    confirmDeleteMedia: "Do you really want to delete “{{name}}”? The purchased storage allowance remains.",
    mediaRemoved: "Media removed. Your purchased storage limit remains.",
    mediaDeleteFailed: "Media could not be deleted.",
    confirmRemoveLogo: "Do you really want to remove the logo?",
    confirmRemoveCover: "Do you really want to remove the cover image?",
    creditsUpdated: "Credits refreshed.",
    removeLogo: "Remove logo",
    coverPreviewAlt: "Cover image preview",
    removeCover: "Remove cover image",
    locationNameLabel: "Location name",
    filesHint: "Optional: Upload files such as PDFs, price lists, menus, documents or images directly.",
    verificationPreviewAlt: "Verification evidence preview",
    mediaManageHint: "Manage logo, cover image, gallery images and files directly on this edit page.",
    currentCoverAlt: "Current cover image",
    noCover: "No cover image has been added yet.",
    removeSelection: "Remove selection",
    companyName: "Company name",
    categoryLabel: "Category",
    manualCoordinates: "Enter coordinates manually",
    exampleLat: "e.g. 50.9375",
    exampleLng: "e.g. 6.9603",
    storageQuota: "Storage allowance",
    storageQuotaHint: "{{free}} MB are included per QR-X. Each additional {{pack}} MB package costs exactly 1 Credit.",
    quotaAfterCreation: "Allowance after creation",
    totalCosts: "Total cost",
    qrxCreation: "QR-X creation",
    totalLabel: "Total",
    buyCreditsTitle: "Buy Credits",
    buyCreditsHint: "Buy Credits in a new tab. Your entries on this page will be preserved.",
    newsScrollHint: "Max. {{count}} visible · section is scrollable",
    logoPreviewAlt: "Logo preview",
    currentLogoAlt: "Current logo",
    noLogo: "No logo added yet.",
    storageRuleShort: "2 MB free · then +5 MB = 1 Credit",
    coverAdjustTitle: "Adjust image crop",
    coverAdjustHint: "Move and zoom the image until the subject is positioned correctly in the visible area.",
    coverHorizontal: "Horizontal",
    coverVertical: "Vertical",
    coverZoom: "Zoom",
    coverCenter: "Center",
    createFailed: "QR-X could not be created.",
  },
  tr: {
    dashboard: "Kontrol paneli",
    myQrx: "QR-X'lerim",
    createKicker: "QR-X oluştur",
    newTitle: "Yeni QR-X oluştur",
    createHero: "Logo, kapak görseli, galeri, dosya/PDF, konum, şifre koruması ve Credit kontrolüyle QR-X oluştur.",
    backMyQrx: "QR-X'lerime dön",
    baseData: "Temel bilgiler",
    baseHint: "Türü seç ve en önemli bilgileri gir.",
    businessQrx: "Business QR-X",
    normalQrx: "Normal QR-X",
    hideNotice: "Bildirimi kapat",
    creditCheck: "Credit kontrolü",
    currentCredits: "Mevcut Credits",
    refreshing: "Güncelleniyor …",
    refreshCredits: "Credits güncelle",
    costsLoading: "Maliyetler yükleniyor …",
    firstNormalFree: "Bu normal QR-X ilk normal QR-X'in olduğu için ücretsiz.",
    costs: "maliyeti",
    verification: "Doğrulama",
    insufficient: "Yeterli Credit yok.",
    required: "Gerekli",
    available: "mevcut",
    buyCredits: "Credits satın al",
    logo: "Logo",
    logoHint: "İsteğe bağlı: Logo yükle. Daha sonra QR-X'inde gösterilir.",
    chooseLogo: "Logo seç",
    cover: "Kapak görseli",
    coverHint: "İsteğe bağlı: Kapak görseli daha sonra büyük başlık görseli olarak görünür.",
    chooseCover: "Kapak seç",
    title: "Başlık *",
    category: "Kategori",
    categoryHint: "Explore, harita ve sıralamalara yardımcı olur. Kategoriyi daha sonra değiştirebilirsin.",
    description: "Açıklama",
    news: "Haberler ve güncellemeler",
    newsHint: "İsteğe bağlı: Kullanıcıları değişiklikler, teklifler, çalışma saatleri veya önemli bilgiler hakkında bilgilendir.",
    newsPlaceholder: "örn. yeni menü, değişen çalışma saatleri veya güncel teklif …",
    addNews: "+ Haber ekle",
    delete: "Sil",
    collection: "Koleksiyon",
    collectionHint: "Ürün, referans veya proje gibi başka bağımsız QR-X'leri bağla.",
    collectionTitle: "Koleksiyon başlığı",
    collectionTitlePlaceholder: "örn. Referanslarımız, Güncel projeler veya Ürünlerimiz",
    collectionDescription: "Koleksiyon açıklaması",
    collectionDescriptionPlaceholder: "İsteğe bağlı: Kullanıcıların bu koleksiyonda ne bulacağını kısaca açıkla.",
    collectionAutoHint: "Özel başlık yoksa detay görünümünde otomatik olarak “Koleksiyon” gösterilir. Boş açıklama tamamen gizlenir.",
    location: "Konum",
    locationHint: "Bu QR-X'in konumsuz, mevcut konumla veya manuel koordinatlarla kaydedilmesini seç.",
    noLocation: "Konum yok",
    currentLocation: "Mevcut konumu kullan",
    locationLoading: "Konum yükleniyor …",
    locationPlaceholder: "örn. Mioseg Köln",
    latitude: "Enlem",
    longitude: "Boylam",
    contact: "İletişim ve eylemler",
    contactHint: "Bu bilgiler daha sonra QR-X web görünümünde butonlar olarak görünür.",
    phone: "Telefon",
    website: "Web sitesi",
    email: "E-posta",
    navigation: "Navigasyon",
    addressPlaceholder: "Adres veya Google Maps bağlantısı",
    gallery: "Galeri görselleri",
    galleryHint: "İsteğe bağlı: QR-X'inde görünecek görselleri şimdi yükle.",
    chooseGallery: "Galeri görsellerini seç",
    selectedImages: "{{count}} görsel seçildi",
    removeAllImages: "Tüm görselleri kaldır",
    files: "Dosyalar / PDF",
    chooseFiles: "Dosya seç",
    selectedFiles: "{{count}} dosya seçildi",
    removeAllFiles: "Tüm dosyaları kaldır",
    file: "Dosya",
    verificationTitle: "Doğrulama",
    verificationIntro: "Doğrulama, ziyaretçilere bu QR-X'in bilgilerinin ve belgelerinin incelendiğini gösterir.",
    verifiedBadgeBenefit: "Doğrulandı rozeti, incelenmiş durumu kullanıcılara hemen gösterir.",
    credibility: "Daha yüksek güvenilirlik",
    credibilityText: "Şirketler, dernekler, yardım kuruluşları ve turistik yerler için özellikle değerlidir.",
    badge: "Görünür doğrulandı rozeti",
    badgeText: "Başarılı incelemeden sonra QR-X üzerinde sade bir doğrulandı rozeti görünür.",
    privateDocs: "Belgeler gizli kalır",
    privateDocsText: "Yüklenen belgeler yalnızca inceleme için kullanılır ve QR-X'te herkese gösterilmez.",
    requestVerification: "Doğrulama iste",
    refundHint: "Reddedilirse doğrulama Credits iade edilir.",
    proofHint: "İnceleme için uygun bir belgeyi görsel veya PDF olarak yükle.",
    chooseProof: "Belge seç (görsel veya PDF)",
    proofInstruction: "Lütfen işletme belgesi, fatura, resmi belge veya benzeri bir kanıt yükle.",
    passwordProtection: "QR-X’i şifreyle koru",
    passwordHint: "Etkinleştirildiğinde ziyaretçiler QR-X'i açmadan önce şifre girmelidir.",
    password: "Şifre *",
    repeatPassword: "Şifreyi tekrarla *",
    selected: "Seçildi",
    storageCredits: "Depolama Credits",
    storageHint: "Seçilen depolama için ek Credits gerekebilir. Dosyalar daha sonra silinse bile satın alınan kota bu QR-X'e bağlı kalır.",
    noStorageCost: "Ek depolama Credits gerekmiyor.",
    costOverview: "Oluşturmadan önce tahmini maliyet özeti.",
    cancel: "İptal",
    creating: "Oluşturuluyor ve medya yükleniyor …",
    notEnoughCredits: "Yeterli Credit yok",
    createQrx: "QR-X oluştur",
    editKicker: "QR-X düzenle",
    editTitle: "QR-X düzenle",
    editHero: "QR-X'in temel bilgilerini düzenle, şifre korumasını yönet ve Business QR-X için doğrulama iste.",
    openQrx: "QR-X'i aç",
    baseMedia: "Temel bilgiler ve medya",
    editBaseHint: "Tür, başlık, açıklama, konum, iletişim eylemleri ve medyayı tek formda düzenle.",
    collectionEmptyConfirm: "Koleksiyon artık boş. Koleksiyon başlığı ve açıklaması da kaldırılsın mı?\n\nOK = kaldır\nİptal = koru",
    locationAutoFailed: "Konum otomatik belirlenemedi. Lütfen koordinatları manuel gir.",
    enterTitle: "Lütfen bir başlık gir.",
    passwordMin: "Şifre en az 4 karakter olmalıdır.",
    passwordMismatch: "İki şifre eşleşmiyor.",
    login: "Lütfen önce giriş yap.",
    sessionExpired: "Oturumunun süresi doldu. Lütfen tekrar giriş yap.",
    unknownError: "Bilinmeyen hata",
    validNumber: "{{label}} geçerli bir sayı olmalıdır.",
    creditsLoadFailed: "Credits ve QR-X maliyetleri yüklenemedi.",
    creditsChargeFailed: "Credits düşülemedi.",
    creditsRefundFailed: "Credits geri yüklenemedi.",
    newsRequired: "Önce haber metni gir.",
    verificationImagePdf: "Doğrulama için yalnızca görsel veya PDF yükle.",
    verificationBusinessOnly: "Doğrulama yalnızca Business QR-X için kullanılabilir.",
    verificationProofRequired: "Doğrulama için belge veya görsel yükle.",
    pricingStillLoading: "Credits ve QR-X maliyetleri hâlâ yükleniyor. Kısa süre sonra tekrar dene.",
    draftRestored: "QR-X taslağın geri yüklendi. Gerekirse logo, kapak, galeri, dosya/PDF ve doğrulama belgesini yeniden seç.",
    save: "QR-X'i kaydet",
    saving: "Kaydediliyor …",
    saved: "QR-X kaydedildi.",
    savedMedia: "QR-X ve medya kaydedildi.",
    media: "Görseller ve medya",
    availableStorage: "Kullanılabilir",
    storagePermanent: "Satın alınan depolama kotan, görselleri veya dosyaları sonradan silsen de korunur.",
    afterSave: "Kaydettikten sonra",
    newSelected: "Yeni seçildi",
    additionalCost: "Ek maliyet",
    creditsAdditional: "Credits ve ek maliyetler",
    creditsAdditionalHint: "Düzenleme sırasında ek depolama gerekirse yalnızca yeni depolama paketleri ücretlendirilir.",
    additionalStorageCredits: "Ek depolama Credits",
    missingCredits: "Eksik Credits",
    noAdditionalCredits: "Mevcut seçim için ek depolama Credits gerekmiyor.",
    deleteLogo: "Logoyu sil",
    deleteCover: "Kapağı sil",
    remove: "Kaldır",
    verificationLater: "Business doğrulamasını sonradan iste",
    cost: "Maliyet",
    currentCreditsShort: "Mevcut Credits",
    chooseEvidence: "Belge seç",
    submitting: "İstek gönderiliyor …",
    verificationSubmitted: "Doğrulama isteği gönderildi. QR-X'in şimdi incelenecek.",
    lastRequest: "Son başvuru",
    pending: "İnceleniyor",
    pendingText: "Doğrulama isteğin alındı ve inceleniyor.",
    rejectedText: "Son doğrulama isteğin reddedildi. Yeni bir istek gönderebilirsin.",
    notVerified: "Henüz doğrulanmadı.",
    onlyBusinessVerify: "Yalnızca Business QR-X doğrulanabilir.",
    alreadyVerification: "Bu QR-X için zaten bir doğrulama isteği var.",
    proofImagePdf: "Belgeyi görsel veya PDF olarak yükle.",
    chooseLogoImage: "Logo için bir görsel seç.",
    chooseCoverImage: "Kapak için bir görsel seç.",
    confirmDeleteMedia: "“{{name}}” gerçekten silinsin mi? Satın alınan depolama kotası korunur.",
    mediaRemoved: "Medya kaldırıldı. Satın alınan depolama limitin korunur.",
    mediaDeleteFailed: "Medya silinemedi.",
    confirmRemoveLogo: "Logo gerçekten kaldırılsın mı?",
    confirmRemoveCover: "Kapak görseli gerçekten kaldırılsın mı?",
    creditsUpdated: "Credits güncellendi.",
    removeLogo: "Logoyu kaldır",
    coverPreviewAlt: "Kapak görseli önizlemesi",
    removeCover: "Kapak görselini kaldır",
    locationNameLabel: "Konum adı",
    filesHint: "İsteğe bağlı: PDF, fiyat listesi, menü, belge veya görselleri doğrudan yükle.",
    verificationPreviewAlt: "Doğrulama belgesi önizlemesi",
    mediaManageHint: "Logo, kapak görseli, galeri görselleri ve dosyaları doğrudan bu düzenleme sayfasından yönet.",
    currentCoverAlt: "Mevcut kapak görseli",
    noCover: "Henüz kapak görseli eklenmedi.",
    removeSelection: "Seçimi kaldır",
    companyName: "Şirket adı",
    categoryLabel: "Kategori",
    manualCoordinates: "Koordinatları manuel gir",
    exampleLat: "örn. 50.9375",
    exampleLng: "örn. 6.9603",
    storageQuota: "Depolama kotası",
    storageQuotaHint: "Her QR-X için {{free}} MB dahildir. Sonraki her {{pack}} MB paket tam 1 Credit tutar.",
    quotaAfterCreation: "Oluşturma sonrası kota",
    totalCosts: "Toplam maliyet",
    qrxCreation: "QR-X oluşturma",
    totalLabel: "Toplam",
    buyCreditsTitle: "Credits satın al",
    buyCreditsHint: "Credits'i yeni bir sekmede satın al. Bu sayfadaki girişlerin korunur.",
    newsScrollHint: "En fazla {{count}} görünür · alan kaydırılabilir",
    logoPreviewAlt: "Logo önizlemesi",
    currentLogoAlt: "Mevcut logo",
    noLogo: "Henüz logo eklenmedi.",
    storageRuleShort: "2 MB ücretsiz · ardından +5 MB = 1 Credit",
    coverAdjustTitle: "Görüntü alanını ayarla",
    coverAdjustHint: "Motif görünür alanda doğru konuma gelene kadar görüntüyü taşı ve yakınlaştır.",
    coverHorizontal: "Yatay",
    coverVertical: "Dikey",
    coverZoom: "Yakınlaştırma",
    coverCenter: "Ortala",
    createFailed: "QR-X oluşturulamadı.",
  },
  pl: {
    dashboard: "Panel",
    myQrx: "Moje QR-X",
    createKicker: "Utwórz QR-X",
    newTitle: "Utwórz nowy QR-X",
    createHero: "Utwórz QR-X z logo, okładką, galerią, plikami/PDF, lokalizacją, ochroną hasłem i kontrolą Credits.",
    backMyQrx: "Wróć do Moich QR-X",
    baseData: "Dane podstawowe",
    baseHint: "Wybierz typ i podaj najważniejsze informacje.",
    businessQrx: "Business QR-X",
    normalQrx: "Zwykły QR-X",
    hideNotice: "Ukryj informację",
    creditCheck: "Kontrola Credits",
    currentCredits: "Aktualne Credits",
    refreshing: "Odświeżanie …",
    refreshCredits: "Odśwież Credits",
    costsLoading: "Ładowanie kosztów …",
    firstNormalFree: "Ten zwykły QR-X jest bezpłatny, ponieważ to Twój pierwszy zwykły QR-X.",
    costs: "kosztuje",
    verification: "Weryfikacja",
    insufficient: "Za mało Credits.",
    required: "Wymagane",
    available: "dostępne",
    buyCredits: "Kup Credits",
    logo: "Logo",
    logoHint: "Opcjonalnie: prześlij logo. Będzie później widoczne w QR-X.",
    chooseLogo: "Wybierz logo",
    cover: "Okładka",
    coverHint: "Opcjonalnie: okładka będzie później dużym obrazem nagłówka.",
    chooseCover: "Wybierz okładkę",
    title: "Tytuł *",
    category: "Kategoria",
    categoryHint: "Pomaga w Explore, mapie i rankingach. Kategorię można później zmienić.",
    description: "Opis",
    news: "Aktualności",
    newsHint: "Opcjonalnie: informuj użytkowników o zmianach, ofertach, godzinach otwarcia lub ważnych wiadomościach.",
    newsPlaceholder: "np. nowe menu, zmienione godziny otwarcia lub aktualna oferta …",
    addNews: "+ Dodaj aktualność",
    delete: "Usuń",
    collection: "Kolekcja",
    collectionHint: "Połącz dodatkowe niezależne QR-X, np. produkty, referencje lub projekty.",
    collectionTitle: "Tytuł kolekcji",
    collectionTitlePlaceholder: "np. Nasze referencje, Aktualne projekty lub Nasze produkty",
    collectionDescription: "Opis kolekcji",
    collectionDescriptionPlaceholder: "Opcjonalnie: krótko opisz zawartość kolekcji.",
    collectionAutoHint: "Bez własnego tytułu w widoku szczegółowym automatycznie pojawi się „Kolekcja”. Pusty opis zostanie ukryty.",
    location: "Lokalizacja",
    locationHint: "Wybierz zapis bez lokalizacji, z aktualną lokalizacją lub ręcznymi współrzędnymi.",
    noLocation: "Bez lokalizacji",
    currentLocation: "Użyj aktualnej lokalizacji",
    locationLoading: "Ładowanie lokalizacji …",
    locationPlaceholder: "np. Mioseg Köln",
    latitude: "Szerokość geograficzna",
    longitude: "Długość geograficzna",
    contact: "Kontakt i działania",
    contactHint: "Te dane pojawią się później jako przyciski w widoku QR-X.",
    phone: "Telefon",
    website: "Strona internetowa",
    email: "E-mail",
    navigation: "Nawigacja",
    addressPlaceholder: "Adres lub link Google Maps",
    gallery: "Galeria",
    galleryHint: "Opcjonalnie: od razu prześlij obrazy, które będą widoczne w QR-X.",
    chooseGallery: "Wybierz obrazy galerii",
    selectedImages: "Wybrano obrazów: {{count}}",
    removeAllImages: "Usuń wszystkie obrazy",
    files: "Pliki / PDF",
    chooseFiles: "Wybierz pliki",
    selectedFiles: "Wybrano plików: {{count}}",
    removeAllFiles: "Usuń wszystkie pliki",
    file: "Plik",
    verificationTitle: "Weryfikacja",
    verificationIntro: "Weryfikacja pokazuje odwiedzającym, że dane i dokumenty tego QR-X zostały sprawdzone.",
    verifiedBadgeBenefit: "Odznaka weryfikacji od razu pokazuje sprawdzony status.",
    credibility: "Większa wiarygodność",
    credibilityText: "Szczególnie wartościowe dla firm, stowarzyszeń, organizacji charytatywnych i atrakcji.",
    badge: "Widoczna odznaka weryfikacji",
    badgeText: "Po pomyślnej kontroli na QR-X pojawia się dyskretna odznaka weryfikacji.",
    privateDocs: "Dokumenty pozostają prywatne",
    privateDocsText: "Przesłane dokumenty służą tylko do kontroli i nie są publicznie wyświetlane w QR-X.",
    requestVerification: "Poproś o weryfikację",
    refundHint: "W przypadku odrzucenia Credits za weryfikację zostaną zwrócone.",
    proofHint: "Prześlij odpowiedni dokument jako obraz lub PDF.",
    chooseProof: "Wybierz dokument (obraz lub PDF)",
    proofInstruction: "Prześlij dokument firmy, fakturę, dokument urzędowy lub podobny dowód.",
    passwordProtection: "Chroń QR-X hasłem",
    passwordHint: "Po włączeniu odwiedzający muszą podać hasło przed otwarciem QR-X.",
    password: "Hasło *",
    repeatPassword: "Powtórz hasło *",
    selected: "Wybrano",
    storageCredits: "Credits za pamięć",
    storageHint: "Wybrana pamięć może wymagać dodatkowych Credits. Zakupiony limit pozostaje przy QR-X nawet po późniejszym usunięciu plików.",
    noStorageCost: "Nie przewiduje się dodatkowych Credits za pamięć.",
    costOverview: "Szacowane koszty przed utworzeniem.",
    cancel: "Anuluj",
    creating: "Tworzenie i przesyłanie mediów …",
    notEnoughCredits: "Za mało Credits",
    createQrx: "Utwórz QR-X",
    editKicker: "Edytuj QR-X",
    editTitle: "Edytuj QR-X",
    editHero: "Edytuj dane podstawowe QR-X, zarządzaj ochroną hasłem i poproś o weryfikację Business QR-X.",
    openQrx: "Otwórz QR-X",
    baseMedia: "Dane podstawowe i media",
    editBaseHint: "Edytuj typ, tytuł, opis, lokalizację, działania kontaktowe i media w jednym formularzu.",
    collectionEmptyConfirm: "Kolekcja jest teraz pusta. Usunąć także jej tytuł i opis?\n\nOK = usuń\nAnuluj = zachowaj",
    locationAutoFailed: "Nie udało się automatycznie ustalić lokalizacji. Wprowadź współrzędne ręcznie.",
    enterTitle: "Podaj tytuł.",
    passwordMin: "Hasło musi mieć co najmniej 4 znaki.",
    passwordMismatch: "Hasła nie są zgodne.",
    login: "Najpierw się zaloguj.",
    sessionExpired: "Sesja wygasła. Zaloguj się ponownie.",
    unknownError: "Nieznany błąd",
    validNumber: "{{label}} musi być prawidłową liczbą.",
    creditsLoadFailed: "Nie udało się wczytać Credits i kosztów QR-X.",
    creditsChargeFailed: "Nie udało się pobrać Credits.",
    creditsRefundFailed: "Nie udało się zwrócić Credits.",
    newsRequired: "Najpierw wpisz tekst aktualności.",
    verificationImagePdf: "Do weryfikacji prześlij tylko obraz lub PDF.",
    verificationBusinessOnly: "Weryfikacja jest dostępna tylko dla Business QR-X.",
    verificationProofRequired: "Prześlij dokument lub obraz do weryfikacji.",
    pricingStillLoading: "Credits i koszty QR-X nadal się ładują. Spróbuj ponownie za chwilę.",
    draftRestored: "Przywrócono szkic QR-X. W razie potrzeby ponownie wybierz logo, okładkę, galerię, pliki/PDF i dokumenty weryfikacyjne.",
    save: "Zapisz QR-X",
    saving: "Zapisywanie …",
    saved: "QR-X zapisany.",
    savedMedia: "QR-X i media zapisane.",
    media: "Obrazy i media",
    availableStorage: "Dostępne",
    storagePermanent: "Zakupiony limit pamięci pozostaje dostępny nawet po późniejszym usunięciu obrazów lub plików.",
    afterSave: "Po zapisaniu",
    newSelected: "Nowo wybrane",
    additionalCost: "Dodatkowy koszt",
    creditsAdditional: "Credits i dodatkowe koszty",
    creditsAdditionalHint: "Jeśli podczas edycji potrzebna jest dodatkowa pamięć, naliczane są tylko nowe pakiety pamięci.",
    additionalStorageCredits: "Dodatkowe Credits za pamięć",
    missingCredits: "Brakujące Credits",
    noAdditionalCredits: "Dla aktualnego wyboru nie są potrzebne dodatkowe Credits za pamięć.",
    deleteLogo: "Usuń logo",
    deleteCover: "Usuń okładkę",
    remove: "Usuń",
    verificationLater: "Poproś później o weryfikację Business",
    cost: "Koszt",
    currentCreditsShort: "Aktualne Credits",
    chooseEvidence: "Wybierz dokument",
    submitting: "Wysyłanie wniosku …",
    verificationSubmitted: "Wniosek o weryfikację został wysłany. QR-X zostanie teraz sprawdzony.",
    lastRequest: "Ostatni wniosek",
    pending: "W trakcie weryfikacji",
    pendingText: "Wniosek o weryfikację został złożony i jest sprawdzany.",
    rejectedText: "Ostatni wniosek o weryfikację został odrzucony. Możesz wysłać nowy.",
    notVerified: "Jeszcze nie zweryfikowano.",
    onlyBusinessVerify: "Weryfikować można tylko Business QR-X.",
    alreadyVerification: "Dla tego QR-X istnieje już wniosek o weryfikację.",
    proofImagePdf: "Prześlij dokument jako obraz lub PDF.",
    chooseLogoImage: "Wybierz obraz dla logo.",
    chooseCoverImage: "Wybierz obraz dla okładki.",
    confirmDeleteMedia: "Czy na pewno usunąć „{{name}}”? Zakupiony limit pamięci pozostanie.",
    mediaRemoved: "Medium usunięte. Zakupiony limit pamięci pozostaje.",
    mediaDeleteFailed: "Nie udało się usunąć medium.",
    confirmRemoveLogo: "Czy na pewno usunąć logo?",
    confirmRemoveCover: "Czy na pewno usunąć okładkę?",
    creditsUpdated: "Credits odświeżone.",
    removeLogo: "Usuń logo",
    coverPreviewAlt: "Podgląd okładki",
    removeCover: "Usuń okładkę",
    locationNameLabel: "Nazwa lokalizacji",
    filesHint: "Opcjonalnie: prześlij bezpośrednio pliki PDF, cenniki, menu, dokumenty lub obrazy.",
    verificationPreviewAlt: "Podgląd dokumentu weryfikacyjnego",
    mediaManageHint: "Zarządzaj logo, okładką, obrazami galerii i plikami bezpośrednio na tej stronie edycji.",
    currentCoverAlt: "Aktualna okładka",
    noCover: "Nie dodano jeszcze okładki.",
    removeSelection: "Usuń wybór",
    companyName: "Nazwa firmy",
    categoryLabel: "Kategoria",
    manualCoordinates: "Wprowadź współrzędne ręcznie",
    exampleLat: "np. 50.9375",
    exampleLng: "np. 6.9603",
    storageQuota: "Limit pamięci",
    storageQuotaHint: "Każdy QR-X zawiera {{free}} MB. Każdy kolejny pakiet {{pack}} MB kosztuje dokładnie 1 Credit.",
    quotaAfterCreation: "Limit po utworzeniu",
    totalCosts: "Łączny koszt",
    qrxCreation: "Utworzenie QR-X",
    totalLabel: "Razem",
    buyCreditsTitle: "Kup Credits",
    buyCreditsHint: "Kup Credits w nowej karcie. Dane wprowadzone na tej stronie zostaną zachowane.",
    newsScrollHint: "Maks. {{count}} widocznych · obszar można przewijać",
    logoPreviewAlt: "Podgląd logo",
    currentLogoAlt: "Aktualne logo",
    noLogo: "Nie dodano jeszcze logo.",
    storageRuleShort: "2 MB bezpłatnie · potem +5 MB = 1 Credit",
    coverAdjustTitle: "Dostosuj kadr",
    coverAdjustHint: "Przesuń i powiększ obraz, aż motyw będzie prawidłowo ustawiony w widocznym obszarze.",
    coverHorizontal: "Poziomo",
    coverVertical: "Pionowo",
    coverZoom: "Powiększenie",
    coverCenter: "Wyśrodkuj",
    createFailed: "Nie udało się utworzyć QR-X.",
  },
  ar: {
    dashboard: "لوحة التحكم",
    myQrx: "QR-X الخاصة بي",
    createKicker: "إنشاء QR-X",
    newTitle: "إنشاء QR-X جديد",
    createHero: "أنشئ QR-X مع الشعار وصورة الغلاف والمعرض والملفات/PDF والموقع وحماية كلمة المرور وفحص Credits.",
    backMyQrx: "العودة إلى QR-X الخاصة بي",
    baseData: "البيانات الأساسية",
    baseHint: "اختر النوع وأدخل أهم المعلومات.",
    businessQrx: "Business QR-X",
    normalQrx: "QR-X عادي",
    hideNotice: "إخفاء الملاحظة",
    creditCheck: "فحص Credits",
    currentCredits: "Credits الحالية",
    refreshing: "جارٍ التحديث …",
    refreshCredits: "تحديث Credits",
    costsLoading: "جارٍ تحميل التكاليف …",
    firstNormalFree: "QR-X العادي هذا مجاني لأنه أول QR-X عادي لك.",
    costs: "يكلف",
    verification: "التوثيق",
    insufficient: "Credits غير كافية.",
    required: "المطلوب",
    available: "المتوفر",
    buyCredits: "شراء Credits",
    logo: "الشعار",
    logoHint: "اختياري: حمّل شعارًا ليظهر لاحقًا في QR-X.",
    chooseLogo: "اختيار شعار",
    cover: "صورة الغلاف",
    coverHint: "اختياري: ستظهر صورة الغلاف لاحقًا كصورة عنوان كبيرة.",
    chooseCover: "اختيار الغلاف",
    title: "العنوان *",
    category: "الفئة",
    categoryHint: "تساعد في Explore والخريطة والترتيب، ويمكن تغييرها لاحقًا.",
    description: "الوصف",
    news: "الأخبار والتحديثات",
    newsHint: "اختياري: أخبر المستخدمين بالتغييرات والعروض وساعات العمل أو المعلومات المهمة.",
    newsPlaceholder: "مثال: قائمة جديدة أو ساعات عمل معدلة أو عرض حالي …",
    addNews: "+ إضافة خبر",
    delete: "حذف",
    collection: "المجموعة",
    collectionHint: "اربط QR-X مستقلة أخرى مثل المنتجات أو المراجع أو المشاريع.",
    collectionTitle: "عنوان المجموعة",
    collectionTitlePlaceholder: "مثال: مراجعنا أو مشاريعنا الحالية أو منتجاتنا",
    collectionDescription: "وصف المجموعة",
    collectionDescriptionPlaceholder: "اختياري: صف بإيجاز ما سيجده المستخدمون في هذه المجموعة.",
    collectionAutoHint: "بدون عنوان خاص يظهر «المجموعة» تلقائيًا في التفاصيل، ويُخفى الوصف الفارغ.",
    location: "الموقع",
    locationHint: "اختر حفظ QR-X بدون موقع أو باستخدام موقعك الحالي أو إحداثيات يدوية.",
    noLocation: "بدون موقع",
    currentLocation: "استخدام الموقع الحالي",
    locationLoading: "جارٍ تحميل الموقع …",
    locationPlaceholder: "مثال: Mioseg Köln",
    latitude: "خط العرض",
    longitude: "خط الطول",
    contact: "الاتصال والإجراءات",
    contactHint: "تظهر هذه البيانات لاحقًا كأزرار في عرض QR-X على الويب.",
    phone: "الهاتف",
    website: "الموقع الإلكتروني",
    email: "البريد الإلكتروني",
    navigation: "الملاحة",
    addressPlaceholder: "العنوان أو رابط Google Maps",
    gallery: "صور المعرض",
    galleryHint: "اختياري: حمّل الآن الصور التي ستظهر لاحقًا في QR-X.",
    chooseGallery: "اختيار صور المعرض",
    selectedImages: "تم اختيار {{count}} صورة",
    removeAllImages: "إزالة كل الصور",
    files: "الملفات / PDF",
    chooseFiles: "اختيار ملفات",
    selectedFiles: "تم اختيار {{count}} ملف",
    removeAllFiles: "إزالة كل الملفات",
    file: "ملف",
    verificationTitle: "التوثيق",
    verificationIntro: "يُظهر التوثيق للزوار أن معلومات ومستندات QR-X هذا قد تمت مراجعتها.",
    verifiedBadgeBenefit: "تجعل شارة التوثيق حالة المراجعة واضحة للمستخدمين فورًا.",
    credibility: "مصداقية أعلى",
    credibilityText: "مفيد خصوصًا للشركات والجمعيات والمنظمات الخيرية والمعالم.",
    badge: "شارة توثيق ظاهرة",
    badgeText: "بعد المراجعة الناجحة تظهر شارة توثيق بسيطة مباشرة على QR-X.",
    privateDocs: "المستندات تبقى خاصة",
    privateDocsText: "تُستخدم المستندات المرفوعة للمراجعة فقط ولا تظهر للعامة في QR-X.",
    requestVerification: "طلب التوثيق",
    refundHint: "تُعاد Credits الخاصة بالتوثيق عند رفض الطلب.",
    proofHint: "حمّل مستندًا مناسبًا للمراجعة كصورة أو PDF.",
    chooseProof: "اختيار مستند (صورة أو PDF)",
    proofInstruction: "يرجى رفع مستند شركة أو فاتورة أو وثيقة رسمية أو إثبات مشابه.",
    passwordProtection: "حماية QR-X بكلمة مرور",
    passwordHint: "عند التفعيل يجب على الزوار إدخال كلمة مرور قبل فتح QR-X.",
    password: "كلمة المرور *",
    repeatPassword: "تكرار كلمة المرور *",
    selected: "المحدد",
    storageCredits: "Credits التخزين",
    storageHint: "قد تتطلب مساحة التخزين المحددة Credits إضافية. يبقى الحد المشتَرى مرتبطًا بـ QR-X حتى بعد حذف الملفات لاحقًا.",
    noStorageCost: "لا يُتوقع احتياج Credits تخزين إضافية.",
    costOverview: "ملخص التكاليف التقديرية قبل الإنشاء.",
    cancel: "إلغاء",
    creating: "جارٍ الإنشاء ورفع الوسائط …",
    notEnoughCredits: "Credits غير كافية",
    createQrx: "إنشاء QR-X",
    editKicker: "تعديل QR-X",
    editTitle: "تعديل QR-X",
    editHero: "عدّل البيانات الأساسية لـ QR-X وأدر حماية كلمة المرور واطلب توثيق Business QR-X.",
    openQrx: "فتح QR-X",
    baseMedia: "البيانات الأساسية والوسائط",
    editBaseHint: "عدّل النوع والعنوان والوصف والموقع وإجراءات الاتصال والوسائط في نموذج واحد.",
    collectionEmptyConfirm: "أصبحت المجموعة فارغة. هل تريد إزالة عنوانها ووصفها أيضًا؟\n\nموافق = إزالة\nإلغاء = إبقاء",
    locationAutoFailed: "تعذر تحديد الموقع تلقائيًا. أدخل الإحداثيات يدويًا.",
    enterTitle: "يرجى إدخال عنوان.",
    passwordMin: "يجب أن تتكون كلمة المرور من 4 أحرف على الأقل.",
    passwordMismatch: "كلمتا المرور غير متطابقتين.",
    login: "يرجى تسجيل الدخول أولًا.",
    sessionExpired: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
    unknownError: "خطأ غير معروف",
    validNumber: "يجب أن يكون {{label}} رقمًا صالحًا.",
    creditsLoadFailed: "تعذر تحميل Credits وتكاليف QR-X.",
    creditsChargeFailed: "تعذر خصم Credits.",
    creditsRefundFailed: "تعذر إعادة Credits.",
    newsRequired: "أدخل نص الخبر أولًا.",
    verificationImagePdf: "للتوثيق، ارفع صورة أو PDF فقط.",
    verificationBusinessOnly: "التوثيق متاح فقط لـ Business QR-X.",
    verificationProofRequired: "ارفع مستندًا أو صورة للتوثيق.",
    pricingStillLoading: "لا تزال Credits وتكاليف QR-X قيد التحميل. حاول مرة أخرى بعد قليل.",
    draftRestored: "تمت استعادة مسودة QR-X. أعد اختيار الشعار والغلاف والمعرض والملفات/PDF ومستندات التوثيق عند الحاجة.",
    save: "حفظ QR-X",
    saving: "جارٍ الحفظ …",
    saved: "تم حفظ QR-X.",
    savedMedia: "تم حفظ QR-X والوسائط.",
    media: "الصور والوسائط",
    availableStorage: "المتاح",
    storagePermanent: "يبقى حد التخزين الذي اشتريته متاحًا حتى إذا حذفت الصور أو الملفات لاحقًا.",
    afterSave: "بعد الحفظ",
    newSelected: "تم اختياره حديثًا",
    additionalCost: "تكلفة إضافية",
    creditsAdditional: "Credits والتكاليف الإضافية",
    creditsAdditionalHint: "عند الحاجة لمساحة إضافية أثناء التعديل، يتم احتساب حزم التخزين الجديدة فقط.",
    additionalStorageCredits: "Credits تخزين إضافية",
    missingCredits: "Credits الناقصة",
    noAdditionalCredits: "لا حاجة إلى Credits تخزين إضافية للاختيار الحالي.",
    deleteLogo: "حذف الشعار",
    deleteCover: "حذف الغلاف",
    remove: "إزالة",
    verificationLater: "طلب توثيق Business لاحقًا",
    cost: "التكلفة",
    currentCreditsShort: "Credits الحالية",
    chooseEvidence: "اختيار مستند",
    submitting: "جارٍ إرسال الطلب …",
    verificationSubmitted: "تم إرسال طلب التوثيق. سيجري الآن فحص QR-X.",
    lastRequest: "آخر طلب",
    pending: "قيد المراجعة",
    pendingText: "تم استلام طلب التوثيق وهو قيد المراجعة.",
    rejectedText: "تم رفض طلب التوثيق الأخير. يمكنك إرسال طلب جديد.",
    notVerified: "غير موثّق بعد.",
    onlyBusinessVerify: "يمكن توثيق Business QR-X فقط.",
    alreadyVerification: "يوجد بالفعل طلب توثيق لهذا QR-X.",
    proofImagePdf: "ارفع مستندًا كصورة أو PDF.",
    chooseLogoImage: "اختر صورة للشعار.",
    chooseCoverImage: "اختر صورة للغلاف.",
    confirmDeleteMedia: "هل تريد حقًا حذف «{{name}}»؟ سيبقى حد التخزين المشتَرى.",
    mediaRemoved: "تمت إزالة الوسيط. يبقى حد التخزين المشتَرى.",
    mediaDeleteFailed: "تعذر حذف الوسيط.",
    confirmRemoveLogo: "هل تريد حقًا إزالة الشعار؟",
    confirmRemoveCover: "هل تريد حقًا إزالة صورة الغلاف؟",
    creditsUpdated: "تم تحديث Credits.",
    removeLogo: "إزالة الشعار",
    coverPreviewAlt: "معاينة صورة الغلاف",
    removeCover: "إزالة صورة الغلاف",
    locationNameLabel: "اسم الموقع",
    filesHint: "اختياري: ارفع مباشرة ملفات PDF أو قوائم الأسعار أو القوائم أو المستندات أو الصور.",
    verificationPreviewAlt: "معاينة مستند التحقق",
    mediaManageHint: "أدر الشعار وصورة الغلاف وصور المعرض والملفات مباشرة من صفحة التعديل هذه.",
    currentCoverAlt: "صورة الغلاف الحالية",
    noCover: "لم تتم إضافة صورة غلاف بعد.",
    removeSelection: "إزالة التحديد",
    companyName: "اسم الشركة",
    categoryLabel: "الفئة",
    manualCoordinates: "إدخال الإحداثيات يدويًا",
    exampleLat: "مثال 50.9375",
    exampleLng: "مثال 6.9603",
    storageQuota: "حصة التخزين",
    storageQuotaHint: "يتضمن كل QR-X مساحة {{free}} MB. كل حزمة إضافية بحجم {{pack}} MB تكلف Credit واحدًا.",
    quotaAfterCreation: "الحصة بعد الإنشاء",
    totalCosts: "التكلفة الإجمالية",
    qrxCreation: "إنشاء QR-X",
    totalLabel: "الإجمالي",
    buyCreditsTitle: "شراء Credits",
    buyCreditsHint: "اشترِ Credits في علامة تبويب جديدة. ستظل إدخالاتك في هذه الصفحة محفوظة.",
    newsScrollHint: "بحد أقصى {{count}} ظاهرة · القسم قابل للتمرير",
    logoPreviewAlt: "معاينة الشعار",
    currentLogoAlt: "الشعار الحالي",
    noLogo: "لم تتم إضافة شعار بعد.",
    storageRuleShort: "2 MB مجانًا · ثم +5 MB = 1 Credit",
    coverAdjustTitle: "ضبط إطار الصورة",
    coverAdjustHint: "حرّك الصورة وكبّرها حتى يظهر العنصر بالشكل الصحيح داخل المنطقة المرئية.",
    coverHorizontal: "أفقي",
    coverVertical: "عمودي",
    coverZoom: "تكبير",
    coverCenter: "توسيط",
    createFailed: "تعذر إنشاء QR-X.",
  },
  fr: {
    dashboard: "Tableau de bord",
    myQrx: "Mes QR-X",
    createKicker: "Créer un QR-X",
    newTitle: "Créer un nouveau QR-X",
    createHero: "Créez votre QR-X avec logo, couverture, galerie, fichiers/PDF, emplacement, protection par mot de passe et contrôle des Credits.",
    backMyQrx: "Retour à Mes QR-X",
    baseData: "Données de base",
    baseHint: "Choisissez le type et saisissez les informations principales.",
    businessQrx: "Business QR-X",
    normalQrx: "QR-X normal",
    hideNotice: "Masquer l’information",
    creditCheck: "Contrôle des Credits",
    currentCredits: "Credits actuels",
    refreshing: "Actualisation …",
    refreshCredits: "Actualiser les Credits",
    costsLoading: "Chargement des coûts …",
    firstNormalFree: "Ce QR-X normal est gratuit car il s’agit de votre premier QR-X normal.",
    costs: "coûte",
    verification: "Vérification",
    insufficient: "Credits insuffisants.",
    required: "Requis",
    available: "disponibles",
    buyCredits: "Acheter des Credits",
    logo: "Logo",
    logoHint: "Facultatif : ajoutez un logo. Il sera affiché plus tard dans votre QR-X.",
    chooseLogo: "Choisir un logo",
    cover: "Image de couverture",
    coverHint: "Facultatif : l’image de couverture apparaîtra ensuite comme grande image de titre.",
    chooseCover: "Choisir une couverture",
    title: "Titre *",
    category: "Catégorie",
    categoryHint: "Utile pour Explore, la carte et les classements. Vous pourrez la modifier plus tard.",
    description: "Description",
    news: "Actualités",
    newsHint: "Facultatif : informez les utilisateurs des changements, offres, horaires ou informations importantes.",
    newsPlaceholder: "p. ex. nouveau menu, horaires modifiés ou offre actuelle …",
    addNews: "+ Ajouter une actualité",
    delete: "Supprimer",
    collection: "Collection",
    collectionHint: "Reliez d’autres QR-X autonomes, par exemple des produits, références ou projets.",
    collectionTitle: "Titre de la collection",
    collectionTitlePlaceholder: "p. ex. Nos références, Projets actuels ou Nos produits",
    collectionDescription: "Description de la collection",
    collectionDescriptionPlaceholder: "Facultatif : décrivez brièvement ce que les utilisateurs trouveront dans cette collection.",
    collectionAutoHint: "Sans titre personnalisé, « Collection » s’affiche automatiquement dans la vue détaillée. Une description vide est masquée.",
    location: "Emplacement",
    locationHint: "Choisissez d’enregistrer ce QR-X sans emplacement, avec votre position actuelle ou avec des coordonnées manuelles.",
    noLocation: "Sans emplacement",
    currentLocation: "Utiliser la position actuelle",
    locationLoading: "Chargement de la position …",
    locationPlaceholder: "p. ex. Mioseg Cologne",
    latitude: "Latitude",
    longitude: "Longitude",
    contact: "Contact et actions",
    contactHint: "Ces informations apparaîtront ensuite sous forme de boutons dans la vue web QR-X.",
    phone: "Téléphone",
    website: "Site web",
    email: "E-mail",
    navigation: "Navigation",
    addressPlaceholder: "Adresse ou lien Google Maps",
    gallery: "Images de galerie",
    galleryHint: "Facultatif : ajoutez directement des images qui apparaîtront dans votre QR-X.",
    chooseGallery: "Choisir des images",
    selectedImages: "{{count}} image(s) sélectionnée(s)",
    removeAllImages: "Supprimer toutes les images",
    files: "Fichiers / PDF",
    chooseFiles: "Choisir des fichiers",
    selectedFiles: "{{count}} fichier(s) sélectionné(s)",
    removeAllFiles: "Supprimer tous les fichiers",
    file: "Fichier",
    verificationTitle: "Vérification",
    verificationIntro: "La vérification montre aux visiteurs que les informations et justificatifs de ce QR-X ont été examinés.",
    verifiedBadgeBenefit: "Le badge vérifié rend immédiatement visible le statut contrôlé.",
    credibility: "Crédibilité accrue",
    credibilityText: "Particulièrement utile pour les entreprises, associations, organismes caritatifs et attractions.",
    badge: "Badge vérifié visible",
    badgeText: "Après validation, un badge discret apparaît directement sur le QR-X.",
    privateDocs: "Les justificatifs restent privés",
    privateDocsText: "Les justificatifs servent uniquement au contrôle et ne sont pas affichés publiquement dans le QR-X.",
    requestVerification: "Demander la vérification",
    refundHint: "Les Credits de vérification sont remboursés en cas de refus.",
    proofHint: "Ajoutez un justificatif adapté sous forme d’image ou de PDF.",
    chooseProof: "Choisir un justificatif (image ou PDF)",
    proofInstruction: "Ajoutez un document d’entreprise, une facture, un document officiel ou une preuve similaire.",
    passwordProtection: "Protéger le QR-X par mot de passe",
    passwordHint: "Si activé, les visiteurs doivent saisir un mot de passe avant d’ouvrir ce QR-X.",
    password: "Mot de passe *",
    repeatPassword: "Répéter le mot de passe *",
    selected: "Sélectionné",
    storageCredits: "Credits de stockage",
    storageHint: "Le stockage sélectionné peut nécessiter des Credits supplémentaires. Le quota acheté reste attribué à ce QR-X même si des fichiers sont supprimés ensuite.",
    noStorageCost: "Aucun Credit de stockage supplémentaire prévu.",
    costOverview: "Aperçu des coûts estimés avant création.",
    cancel: "Annuler",
    creating: "Création et envoi des médias …",
    notEnoughCredits: "Credits insuffisants",
    createQrx: "Créer le QR-X",
    editKicker: "Modifier QR-X",
    editTitle: "Modifier QR-X",
    editHero: "Modifiez les données de base, gérez la protection par mot de passe et demandez la vérification d’un Business QR-X.",
    openQrx: "Ouvrir le QR-X",
    baseMedia: "Données de base et médias",
    editBaseHint: "Modifiez le type, titre, description, emplacement, actions de contact et médias dans un seul formulaire.",
    collectionEmptyConfirm: "La collection est maintenant vide. Supprimer également son titre et sa description ?\n\nOK = supprimer\nAnnuler = conserver",
    locationAutoFailed: "L’emplacement n’a pas pu être déterminé automatiquement. Saisissez les coordonnées manuellement.",
    enterTitle: "Saisissez un titre.",
    passwordMin: "Le mot de passe doit comporter au moins 4 caractères.",
    passwordMismatch: "Les deux mots de passe ne correspondent pas.",
    login: "Connectez-vous d’abord.",
    sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
    unknownError: "Erreur inconnue",
    validNumber: "{{label}} doit être un nombre valide.",
    creditsLoadFailed: "Les Credits et les coûts QR-X n’ont pas pu être chargés.",
    creditsChargeFailed: "Les Credits n’ont pas pu être débités.",
    creditsRefundFailed: "Les Credits n’ont pas pu être remboursés.",
    newsRequired: "Saisissez d’abord le texte de l’actualité.",
    verificationImagePdf: "Pour la vérification, ajoutez uniquement une image ou un PDF.",
    verificationBusinessOnly: "La vérification est réservée aux Business QR-X.",
    verificationProofRequired: "Ajoutez un document ou une image pour la vérification.",
    pricingStillLoading: "Les Credits et les coûts QR-X sont encore en cours de chargement. Réessayez dans un instant.",
    draftRestored: "Votre brouillon QR-X a été restauré. Sélectionnez de nouveau le logo, la couverture, la galerie, les fichiers/PDF et justificatifs si nécessaire.",
    save: "Enregistrer le QR-X",
    saving: "Enregistrement …",
    saved: "QR-X enregistré.",
    savedMedia: "QR-X et médias enregistrés.",
    media: "Images et médias",
    availableStorage: "Disponible",
    storagePermanent: "Votre quota de stockage acheté reste disponible même si vous supprimez des images ou fichiers plus tard.",
    afterSave: "Après enregistrement",
    newSelected: "Nouvellement sélectionné",
    additionalCost: "Coût supplémentaire",
    creditsAdditional: "Credits et coûts supplémentaires",
    creditsAdditionalHint: "Si un stockage supplémentaire est requis lors de la modification, seuls les nouveaux packs sont facturés.",
    additionalStorageCredits: "Credits de stockage supplémentaires",
    missingCredits: "Credits manquants",
    noAdditionalCredits: "Aucun Credit de stockage supplémentaire n’est nécessaire pour la sélection actuelle.",
    deleteLogo: "Supprimer le logo",
    deleteCover: "Supprimer la couverture",
    remove: "Retirer",
    verificationLater: "Demander la vérification Business ultérieurement",
    cost: "Coût",
    currentCreditsShort: "Credits actuels",
    chooseEvidence: "Choisir un justificatif",
    submitting: "Envoi de la demande …",
    verificationSubmitted: "Demande de vérification envoyée. Votre QR-X va être examiné.",
    lastRequest: "Dernière demande",
    pending: "En cours de vérification",
    pendingText: "Votre demande de vérification a été reçue et est en cours d’examen.",
    rejectedText: "Votre dernière demande a été refusée. Vous pouvez en envoyer une nouvelle.",
    notVerified: "Pas encore vérifié.",
    onlyBusinessVerify: "Seuls les Business QR-X peuvent être vérifiés.",
    alreadyVerification: "Une demande de vérification existe déjà pour ce QR-X.",
    proofImagePdf: "Ajoutez un justificatif sous forme d’image ou de PDF.",
    chooseLogoImage: "Choisissez une image pour le logo.",
    chooseCoverImage: "Choisissez une image pour la couverture.",
    confirmDeleteMedia: "Voulez-vous vraiment supprimer « {{name}} » ? Le quota acheté reste disponible.",
    mediaRemoved: "Média retiré. Votre limite de stockage achetée reste disponible.",
    mediaDeleteFailed: "Le média n’a pas pu être supprimé.",
    confirmRemoveLogo: "Voulez-vous vraiment retirer le logo ?",
    confirmRemoveCover: "Voulez-vous vraiment retirer l’image de couverture ?",
    creditsUpdated: "Credits actualisés.",
    removeLogo: "Supprimer le logo",
    coverPreviewAlt: "Aperçu de l’image de couverture",
    removeCover: "Supprimer l’image de couverture",
    locationNameLabel: "Nom du lieu",
    filesHint: "Facultatif : téléversez directement des PDF, tarifs, menus, documents ou images.",
    verificationPreviewAlt: "Aperçu du justificatif de vérification",
    mediaManageHint: "Gérez le logo, la couverture, les images de galerie et les fichiers directement sur cette page de modification.",
    currentCoverAlt: "Image de couverture actuelle",
    noCover: "Aucune image de couverture n’a encore été ajoutée.",
    removeSelection: "Supprimer la sélection",
    companyName: "Nom de l’entreprise",
    categoryLabel: "Catégorie",
    manualCoordinates: "Saisir les coordonnées manuellement",
    exampleLat: "p. ex. 50.9375",
    exampleLng: "p. ex. 6.9603",
    storageQuota: "Quota de stockage",
    storageQuotaHint: "{{free}} Mo sont inclus par QR-X. Chaque paquet supplémentaire de {{pack}} Mo coûte exactement 1 Credit.",
    quotaAfterCreation: "Quota après création",
    totalCosts: "Coût total",
    qrxCreation: "Création du QR-X",
    totalLabel: "Total",
    buyCreditsTitle: "Acheter des Credits",
    buyCreditsHint: "Achetez des Credits dans un nouvel onglet. Vos saisies sur cette page seront conservées.",
    newsScrollHint: "Max. {{count}} visibles · zone défilable",
    logoPreviewAlt: "Aperçu du logo",
    currentLogoAlt: "Logo actuel",
    noLogo: "Aucun logo ajouté pour le moment.",
    storageRuleShort: "2 MB gratuits · puis +5 MB = 1 Credit",
    coverAdjustTitle: "Ajuster le cadrage",
    coverAdjustHint: "Déplacez et zoomez l’image jusqu’à ce que le sujet soit correctement placé dans la zone visible.",
    coverHorizontal: "Horizontal",
    coverVertical: "Vertical",
    coverZoom: "Zoom",
    coverCenter: "Centrer",
    createFailed: "Le QR-X n’a pas pu être créé.",
  },
  es: {
    dashboard: "Panel",
    myQrx: "Mis QR-X",
    createKicker: "Crear QR-X",
    newTitle: "Crear nuevo QR-X",
    createHero: "Crea tu QR-X con logo, portada, galería, archivos/PDF, ubicación, protección con contraseña y comprobación de Credits.",
    backMyQrx: "Volver a Mis QR-X",
    baseData: "Datos básicos",
    baseHint: "Elige el tipo e introduce la información principal.",
    businessQrx: "Business QR-X",
    normalQrx: "QR-X normal",
    hideNotice: "Ocultar aviso",
    creditCheck: "Comprobación de Credits",
    currentCredits: "Credits actuales",
    refreshing: "Actualizando …",
    refreshCredits: "Actualizar Credits",
    costsLoading: "Cargando costes …",
    firstNormalFree: "Este QR-X normal es gratuito porque es tu primer QR-X normal.",
    costs: "cuesta",
    verification: "Verificación",
    insufficient: "Credits insuficientes.",
    required: "Necesarios",
    available: "disponibles",
    buyCredits: "Comprar Credits",
    logo: "Logo",
    logoHint: "Opcional: sube un logo. Se mostrará más adelante en tu QR-X.",
    chooseLogo: "Elegir logo",
    cover: "Imagen de portada",
    coverHint: "Opcional: la portada aparecerá más adelante como imagen de cabecera grande.",
    chooseCover: "Elegir portada",
    title: "Título *",
    category: "Categoría",
    categoryHint: "Ayuda en Explore, mapa y rankings. Puedes cambiar la categoría más tarde.",
    description: "Descripción",
    news: "Noticias y novedades",
    newsHint: "Opcional: informa a los usuarios de cambios, ofertas, horarios o avisos importantes.",
    newsPlaceholder: "p. ej. nuevo menú, horarios modificados u oferta actual …",
    addNews: "+ Añadir noticia",
    delete: "Eliminar",
    collection: "Colección",
    collectionHint: "Vincula otros QR-X independientes, como productos, referencias o proyectos.",
    collectionTitle: "Título de la colección",
    collectionTitlePlaceholder: "p. ej. Nuestras referencias, Proyectos actuales o Nuestros productos",
    collectionDescription: "Descripción de la colección",
    collectionDescriptionPlaceholder: "Opcional: describe brevemente qué encontrarán los usuarios en esta colección.",
    collectionAutoHint: "Sin título propio se muestra automáticamente «Colección» en el detalle. Una descripción vacía se oculta.",
    location: "Ubicación",
    locationHint: "Elige guardar este QR-X sin ubicación, con tu ubicación actual o con coordenadas manuales.",
    noLocation: "Sin ubicación",
    currentLocation: "Usar ubicación actual",
    locationLoading: "Cargando ubicación …",
    locationPlaceholder: "p. ej. Mioseg Colonia",
    latitude: "Latitud",
    longitude: "Longitud",
    contact: "Contacto y acciones",
    contactHint: "Estos datos aparecerán más tarde como botones en la vista web del QR-X.",
    phone: "Teléfono",
    website: "Sitio web",
    email: "Correo electrónico",
    navigation: "Navegación",
    addressPlaceholder: "Dirección o enlace de Google Maps",
    gallery: "Imágenes de galería",
    galleryHint: "Opcional: sube directamente imágenes que aparecerán en tu QR-X.",
    chooseGallery: "Elegir imágenes de galería",
    selectedImages: "{{count}} imagen(es) seleccionada(s)",
    removeAllImages: "Eliminar todas las imágenes",
    files: "Archivos / PDF",
    chooseFiles: "Elegir archivos",
    selectedFiles: "{{count}} archivo(s) seleccionado(s)",
    removeAllFiles: "Eliminar todos los archivos",
    file: "Archivo",
    verificationTitle: "Verificación",
    verificationIntro: "La verificación muestra a los visitantes que los datos y justificantes de este QR-X han sido revisados.",
    verifiedBadgeBenefit: "La insignia de verificación hace visible de inmediato el estado revisado.",
    credibility: "Mayor credibilidad",
    credibilityText: "Especialmente valioso para empresas, asociaciones, organizaciones benéficas y atracciones.",
    badge: "Insignia verificada visible",
    badgeText: "Tras una revisión satisfactoria aparece una insignia discreta directamente en el QR-X.",
    privateDocs: "Los justificantes siguen siendo privados",
    privateDocsText: "Los justificantes subidos solo se usan para la revisión y no se muestran públicamente en el QR-X.",
    requestVerification: "Solicitar verificación",
    refundHint: "Si se rechaza, se reembolsan los Credits de verificación.",
    proofHint: "Sube un justificante adecuado como imagen o PDF.",
    chooseProof: "Elegir justificante (imagen o PDF)",
    proofInstruction: "Sube un documento de empresa, factura, documento oficial o prueba similar.",
    passwordProtection: "Proteger QR-X con contraseña",
    passwordHint: "Si se activa, los visitantes deben introducir una contraseña antes de abrir este QR-X.",
    password: "Contraseña *",
    repeatPassword: "Repetir contraseña *",
    selected: "Seleccionado",
    storageCredits: "Credits de almacenamiento",
    storageHint: "El almacenamiento seleccionado puede requerir Credits adicionales. La cuota comprada permanece asignada a este QR-X aunque se eliminen archivos después.",
    noStorageCost: "No se prevén Credits adicionales de almacenamiento.",
    costOverview: "Resumen de los costes estimados antes de crear.",
    cancel: "Cancelar",
    creating: "Creando y subiendo medios …",
    notEnoughCredits: "Credits insuficientes",
    createQrx: "Crear QR-X",
    editKicker: "Editar QR-X",
    editTitle: "Editar QR-X",
    editHero: "Edita los datos básicos, gestiona la protección con contraseña y solicita la verificación de Business QR-X.",
    openQrx: "Abrir QR-X",
    baseMedia: "Datos básicos y medios",
    editBaseHint: "Edita tipo, título, descripción, ubicación, acciones de contacto y medios en un solo formulario.",
    collectionEmptyConfirm: "La colección está vacía. ¿Eliminar también el título y la descripción?\n\nOK = eliminar\nCancelar = conservar",
    locationAutoFailed: "No se pudo determinar la ubicación automáticamente. Introduce las coordenadas manualmente.",
    enterTitle: "Introduce un título.",
    passwordMin: "La contraseña debe tener al menos 4 caracteres.",
    passwordMismatch: "Las dos contraseñas no coinciden.",
    login: "Inicia sesión primero.",
    sessionExpired: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
    unknownError: "Error desconocido",
    validNumber: "{{label}} debe ser un número válido.",
    creditsLoadFailed: "No se pudieron cargar los Credits ni los costes de QR-X.",
    creditsChargeFailed: "No se pudieron descontar los Credits.",
    creditsRefundFailed: "No se pudieron reembolsar los Credits.",
    newsRequired: "Introduce primero el texto de la noticia.",
    verificationImagePdf: "Para la verificación, sube solo una imagen o PDF.",
    verificationBusinessOnly: "La verificación solo está disponible para Business QR-X.",
    verificationProofRequired: "Sube un documento o imagen para la verificación.",
    pricingStillLoading: "Los Credits y costes de QR-X aún se están cargando. Inténtalo de nuevo en un momento.",
    draftRestored: "Se ha restaurado tu borrador QR-X. Vuelve a seleccionar logo, portada, galería, archivos/PDF y justificantes si es necesario.",
    save: "Guardar QR-X",
    saving: "Guardando …",
    saved: "QR-X guardado.",
    savedMedia: "QR-X y medios guardados.",
    media: "Imágenes y medios",
    availableStorage: "Disponible",
    storagePermanent: "Tu cuota de almacenamiento comprada permanece disponible aunque elimines imágenes o archivos más tarde.",
    afterSave: "Después de guardar",
    newSelected: "Recién seleccionado",
    additionalCost: "Coste adicional",
    creditsAdditional: "Credits y costes adicionales",
    creditsAdditionalHint: "Si al editar hace falta almacenamiento adicional, solo se cobran los nuevos paquetes.",
    additionalStorageCredits: "Credits adicionales de almacenamiento",
    missingCredits: "Credits faltantes",
    noAdditionalCredits: "No se necesitan Credits adicionales de almacenamiento para la selección actual.",
    deleteLogo: "Eliminar logo",
    deleteCover: "Eliminar portada",
    remove: "Quitar",
    verificationLater: "Solicitar después verificación Business",
    cost: "Coste",
    currentCreditsShort: "Credits actuales",
    chooseEvidence: "Elegir justificante",
    submitting: "Enviando solicitud …",
    verificationSubmitted: "Solicitud de verificación enviada. Tu QR-X será revisado ahora.",
    lastRequest: "Última solicitud",
    pending: "En revisión",
    pendingText: "Tu solicitud de verificación ha sido recibida y está en revisión.",
    rejectedText: "Tu última solicitud de verificación fue rechazada. Puedes enviar una nueva.",
    notVerified: "Todavía no verificado.",
    onlyBusinessVerify: "Solo los Business QR-X pueden verificarse.",
    alreadyVerification: "Ya existe una solicitud de verificación para este QR-X.",
    proofImagePdf: "Sube un justificante como imagen o PDF.",
    chooseLogoImage: "Elige una imagen para el logo.",
    chooseCoverImage: "Elige una imagen para la portada.",
    confirmDeleteMedia: "¿Quieres eliminar «{{name}}»? La cuota de almacenamiento comprada se mantiene.",
    mediaRemoved: "Medio eliminado. Se mantiene tu límite de almacenamiento comprado.",
    mediaDeleteFailed: "No se pudo eliminar el medio.",
    confirmRemoveLogo: "¿Quieres quitar realmente el logo?",
    confirmRemoveCover: "¿Quieres quitar realmente la portada?",
    creditsUpdated: "Credits actualizados.",
    removeLogo: "Eliminar logotipo",
    coverPreviewAlt: "Vista previa de la portada",
    removeCover: "Eliminar portada",
    locationNameLabel: "Nombre de la ubicación",
    filesHint: "Opcional: sube directamente PDF, listas de precios, menús, documentos o imágenes.",
    verificationPreviewAlt: "Vista previa del justificante de verificación",
    mediaManageHint: "Gestiona el logotipo, la portada, las imágenes de galería y los archivos directamente en esta página de edición.",
    currentCoverAlt: "Portada actual",
    noCover: "Todavía no se ha añadido ninguna portada.",
    removeSelection: "Eliminar selección",
    companyName: "Nombre de la empresa",
    categoryLabel: "Categoría",
    manualCoordinates: "Introducir coordenadas manualmente",
    exampleLat: "p. ej. 50.9375",
    exampleLng: "p. ej. 6.9603",
    storageQuota: "Cuota de almacenamiento",
    storageQuotaHint: "Se incluyen {{free}} MB por QR-X. Cada paquete adicional de {{pack}} MB cuesta exactamente 1 Credit.",
    quotaAfterCreation: "Cuota tras la creación",
    totalCosts: "Coste total",
    qrxCreation: "Creación de QR-X",
    totalLabel: "Total",
    buyCreditsTitle: "Comprar Credits",
    buyCreditsHint: "Compra Credits en una nueva pestaña. Tus datos de esta página se conservarán.",
    newsScrollHint: "Máx. {{count}} visibles · área desplazable",
    logoPreviewAlt: "Vista previa del logotipo",
    currentLogoAlt: "Logo actual",
    noLogo: "Todavía no se ha añadido ningún logo.",
    storageRuleShort: "2 MB gratis · después +5 MB = 1 Credit",
    coverAdjustTitle: "Ajustar encuadre",
    coverAdjustHint: "Mueve y amplía la imagen hasta que el motivo quede bien colocado en el área visible.",
    coverHorizontal: "Horizontal",
    coverVertical: "Vertical",
    coverZoom: "Zoom",
    coverCenter: "Centrar",
    createFailed: "No se pudo crear el QR-X.",
  },
  it: {
    dashboard: "Dashboard",
    myQrx: "I miei QR-X",
    createKicker: "Crea QR-X",
    newTitle: "Crea un nuovo QR-X",
    createHero: "Crea il tuo QR-X con logo, copertina, galleria, file/PDF, posizione, protezione con password e controllo Credits.",
    backMyQrx: "Torna a I miei QR-X",
    baseData: "Dati di base",
    baseHint: "Scegli il tipo e inserisci le informazioni principali.",
    businessQrx: "Business QR-X",
    normalQrx: "QR-X normale",
    hideNotice: "Nascondi avviso",
    creditCheck: "Controllo Credits",
    currentCredits: "Credits attuali",
    refreshing: "Aggiornamento …",
    refreshCredits: "Aggiorna Credits",
    costsLoading: "Caricamento costi …",
    firstNormalFree: "Questo QR-X normale è gratuito perché è il tuo primo QR-X normale.",
    costs: "costa",
    verification: "Verifica",
    insufficient: "Credits insufficienti.",
    required: "Necessari",
    available: "disponibili",
    buyCredits: "Acquista Credits",
    logo: "Logo",
    logoHint: "Facoltativo: carica un logo. Verrà mostrato in seguito nel QR-X.",
    chooseLogo: "Scegli logo",
    cover: "Immagine di copertina",
    coverHint: "Facoltativo: la copertina apparirà come grande immagine di intestazione.",
    chooseCover: "Scegli copertina",
    title: "Titolo *",
    category: "Categoria",
    categoryHint: "Aiuta in Explore, mappa e classifiche. Puoi modificarla in seguito.",
    description: "Descrizione",
    news: "News e aggiornamenti",
    newsHint: "Facoltativo: informa gli utenti su modifiche, offerte, orari o avvisi importanti.",
    newsPlaceholder: "es. nuovo menu, orari modificati o offerta attuale …",
    addNews: "+ Aggiungi news",
    delete: "Elimina",
    collection: "Collezione",
    collectionHint: "Collega altri QR-X indipendenti, ad esempio prodotti, referenze o progetti.",
    collectionTitle: "Titolo collezione",
    collectionTitlePlaceholder: "es. Le nostre referenze, Progetti attuali o I nostri prodotti",
    collectionDescription: "Descrizione collezione",
    collectionDescriptionPlaceholder: "Facoltativo: descrivi brevemente cosa troveranno gli utenti nella collezione.",
    collectionAutoHint: "Senza titolo personalizzato viene mostrato automaticamente “Collezione” nei dettagli. Una descrizione vuota viene nascosta.",
    location: "Posizione",
    locationHint: "Scegli se salvare il QR-X senza posizione, con la posizione attuale o con coordinate manuali.",
    noLocation: "Nessuna posizione",
    currentLocation: "Usa posizione attuale",
    locationLoading: "Caricamento posizione …",
    locationPlaceholder: "es. Mioseg Colonia",
    latitude: "Latitudine",
    longitude: "Longitudine",
    contact: "Contatto e azioni",
    contactHint: "Questi dati appariranno come pulsanti nella vista web QR-X.",
    phone: "Telefono",
    website: "Sito web",
    email: "E-mail",
    navigation: "Navigazione",
    addressPlaceholder: "Indirizzo o link Google Maps",
    gallery: "Immagini galleria",
    galleryHint: "Facoltativo: carica subito immagini che appariranno nel QR-X.",
    chooseGallery: "Scegli immagini galleria",
    selectedImages: "{{count}} immagine/i selezionata/e",
    removeAllImages: "Rimuovi tutte le immagini",
    files: "File / PDF",
    chooseFiles: "Scegli file",
    selectedFiles: "{{count}} file selezionato/i",
    removeAllFiles: "Rimuovi tutti i file",
    file: "File",
    verificationTitle: "Verifica",
    verificationIntro: "La verifica mostra ai visitatori che informazioni e documenti di questo QR-X sono stati controllati.",
    verifiedBadgeBenefit: "Il badge verificato rende subito visibile lo stato controllato.",
    credibility: "Maggiore credibilità",
    credibilityText: "Particolarmente utile per aziende, associazioni, enti benefici e attrazioni.",
    badge: "Badge verificato visibile",
    badgeText: "Dopo un controllo positivo compare un badge discreto direttamente sul QR-X.",
    privateDocs: "I documenti restano privati",
    privateDocsText: "I documenti caricati servono solo per il controllo e non vengono mostrati pubblicamente nel QR-X.",
    requestVerification: "Richiedi verifica",
    refundHint: "In caso di rifiuto i Credits di verifica vengono rimborsati.",
    proofHint: "Carica un documento adatto come immagine o PDF.",
    chooseProof: "Scegli documento (immagine o PDF)",
    proofInstruction: "Carica un documento aziendale, una fattura, un documento ufficiale o prova simile.",
    passwordProtection: "Proteggi QR-X con password",
    passwordHint: "Se attivato, i visitatori devono inserire una password prima di aprire questo QR-X.",
    password: "Password *",
    repeatPassword: "Ripeti password *",
    selected: "Selezionato",
    storageCredits: "Credits di archiviazione",
    storageHint: "Lo spazio selezionato può richiedere Credits aggiuntivi. La quota acquistata resta assegnata al QR-X anche se i file vengono eliminati in seguito.",
    noStorageCost: "Non sono previsti Credits aggiuntivi per lo spazio.",
    costOverview: "Riepilogo dei costi stimati prima della creazione.",
    cancel: "Annulla",
    creating: "Creazione e caricamento media …",
    notEnoughCredits: "Credits insufficienti",
    createQrx: "Crea QR-X",
    editKicker: "Modifica QR-X",
    editTitle: "Modifica QR-X",
    editHero: "Modifica i dati di base, gestisci la protezione con password e richiedi la verifica per Business QR-X.",
    openQrx: "Apri QR-X",
    baseMedia: "Dati di base e media",
    editBaseHint: "Modifica tipo, titolo, descrizione, posizione, azioni di contatto e media in un solo modulo.",
    collectionEmptyConfirm: "La collezione è ora vuota. Rimuovere anche titolo e descrizione?\n\nOK = rimuovi\nAnnulla = mantieni",
    locationAutoFailed: "Impossibile determinare automaticamente la posizione. Inserisci le coordinate manualmente.",
    enterTitle: "Inserisci un titolo.",
    passwordMin: "La password deve contenere almeno 4 caratteri.",
    passwordMismatch: "Le due password non corrispondono.",
    login: "Accedi prima.",
    sessionExpired: "La sessione è scaduta. Accedi di nuovo.",
    unknownError: "Errore sconosciuto",
    validNumber: "{{label}} deve essere un numero valido.",
    creditsLoadFailed: "Impossibile caricare Credits e costi QR-X.",
    creditsChargeFailed: "Impossibile addebitare i Credits.",
    creditsRefundFailed: "Impossibile rimborsare i Credits.",
    newsRequired: "Inserisci prima il testo della news.",
    verificationImagePdf: "Per la verifica carica solo un’immagine o un PDF.",
    verificationBusinessOnly: "La verifica è disponibile solo per Business QR-X.",
    verificationProofRequired: "Carica un documento o immagine per la verifica.",
    pricingStillLoading: "Credits e costi QR-X sono ancora in caricamento. Riprova tra poco.",
    draftRestored: "La bozza QR-X è stata ripristinata. Se necessario seleziona nuovamente logo, copertina, galleria, file/PDF e documenti di verifica.",
    save: "Salva QR-X",
    saving: "Salvataggio …",
    saved: "QR-X salvato.",
    savedMedia: "QR-X e media salvati.",
    media: "Immagini e media",
    availableStorage: "Disponibile",
    storagePermanent: "La quota di archiviazione acquistata rimane disponibile anche se elimini immagini o file in seguito.",
    afterSave: "Dopo il salvataggio",
    newSelected: "Nuovo selezionato",
    additionalCost: "Costo aggiuntivo",
    creditsAdditional: "Credits e costi aggiuntivi",
    creditsAdditionalHint: "Se durante la modifica serve ulteriore spazio, vengono addebitati solo i nuovi pacchetti.",
    additionalStorageCredits: "Credits aggiuntivi di archiviazione",
    missingCredits: "Credits mancanti",
    noAdditionalCredits: "Per la selezione attuale non servono Credits aggiuntivi di archiviazione.",
    deleteLogo: "Elimina logo",
    deleteCover: "Elimina copertina",
    remove: "Rimuovi",
    verificationLater: "Richiedi verifica Business in seguito",
    cost: "Costo",
    currentCreditsShort: "Credits attuali",
    chooseEvidence: "Scegli documento",
    submitting: "Invio richiesta …",
    verificationSubmitted: "Richiesta di verifica inviata. Il tuo QR-X verrà ora controllato.",
    lastRequest: "Ultima richiesta",
    pending: "In verifica",
    pendingText: "La richiesta di verifica è stata ricevuta ed è in esame.",
    rejectedText: "L’ultima richiesta è stata rifiutata. Puoi inviarne una nuova.",
    notVerified: "Non ancora verificato.",
    onlyBusinessVerify: "Solo i Business QR-X possono essere verificati.",
    alreadyVerification: "Esiste già una richiesta di verifica per questo QR-X.",
    proofImagePdf: "Carica un documento come immagine o PDF.",
    chooseLogoImage: "Scegli un’immagine per il logo.",
    chooseCoverImage: "Scegli un’immagine per la copertina.",
    confirmDeleteMedia: "Vuoi davvero eliminare “{{name}}”? La quota acquistata rimane disponibile.",
    mediaRemoved: "Media rimosso. Il limite di archiviazione acquistato rimane.",
    mediaDeleteFailed: "Impossibile eliminare il media.",
    confirmRemoveLogo: "Vuoi davvero rimuovere il logo?",
    confirmRemoveCover: "Vuoi davvero rimuovere la copertina?",
    creditsUpdated: "Credits aggiornati.",
    removeLogo: "Rimuovi logo",
    coverPreviewAlt: "Anteprima immagine di copertina",
    removeCover: "Rimuovi immagine di copertina",
    locationNameLabel: "Nome posizione",
    filesHint: "Facoltativo: carica direttamente PDF, listini prezzi, menu, documenti o immagini.",
    verificationPreviewAlt: "Anteprima documento di verifica",
    mediaManageHint: "Gestisci logo, copertina, immagini della galleria e file direttamente da questa pagina di modifica.",
    currentCoverAlt: "Immagine di copertina attuale",
    noCover: "Non è stata ancora aggiunta un’immagine di copertina.",
    removeSelection: "Rimuovi selezione",
    companyName: "Nome azienda",
    categoryLabel: "Categoria",
    manualCoordinates: "Inserisci coordinate manualmente",
    exampleLat: "es. 50.9375",
    exampleLng: "es. 6.9603",
    storageQuota: "Quota di archiviazione",
    storageQuotaHint: "Sono inclusi {{free}} MB per QR-X. Ogni pacchetto aggiuntivo da {{pack}} MB costa esattamente 1 Credit.",
    quotaAfterCreation: "Quota dopo la creazione",
    totalCosts: "Costo totale",
    qrxCreation: "Creazione QR-X",
    totalLabel: "Totale",
    buyCreditsTitle: "Acquista Credits",
    buyCreditsHint: "Acquista Credits in una nuova scheda. I dati inseriti in questa pagina verranno mantenuti.",
    newsScrollHint: "Max. {{count}} visibili · area scorrevole",
    logoPreviewAlt: "Anteprima logo",
    currentLogoAlt: "Logo attuale",
    noLogo: "Nessun logo aggiunto finora.",
    storageRuleShort: "2 MB gratuiti · poi +5 MB = 1 Credit",
    coverAdjustTitle: "Regola inquadratura",
    coverAdjustHint: "Sposta e ingrandisci l’immagine finché il soggetto non è posizionato correttamente nell’area visibile.",
    coverHorizontal: "Orizzontale",
    coverVertical: "Verticale",
    coverZoom: "Zoom",
    coverCenter: "Centra",
    createFailed: "Impossibile creare il QR-X.",
  },
} as const;

const QR_CATEGORY_TEXT = {
  de: {
    praxis_gesundheit: "Praxis & Gesundheit",
    gastronomie: "Gastronomie",
    unternehmen: "Unternehmen",
    dienstleistung: "Dienstleistung",
    handwerk: "Handwerk",
    event: "Event",
    verein: "Verein",
    wohltaetigkeit: "Wohltätigkeit",
    sehenswuerdigkeit: "Sehenswürdigkeit",
    sonstiges: "Sonstiges",
  },
  en: {
    praxis_gesundheit: "Health & practice",
    gastronomie: "Food & dining",
    unternehmen: "Company",
    dienstleistung: "Services",
    handwerk: "Trades",
    event: "Event",
    verein: "Club",
    wohltaetigkeit: "Charity",
    sehenswuerdigkeit: "Attraction",
    sonstiges: "Other",
  },
  tr: {
    praxis_gesundheit: "Sağlık & muayenehane",
    gastronomie: "Yeme & içme",
    unternehmen: "Şirket",
    dienstleistung: "Hizmetler",
    handwerk: "Zanaat",
    event: "Etkinlik",
    verein: "Dernek",
    wohltaetigkeit: "Yardım kuruluşu",
    sehenswuerdigkeit: "Gezilecek yer",
    sonstiges: "Diğer",
  },
  pl: {
    praxis_gesundheit: "Zdrowie i praktyka",
    gastronomie: "Gastronomia",
    unternehmen: "Firma",
    dienstleistung: "Usługi",
    handwerk: "Rzemiosło",
    event: "Wydarzenie",
    verein: "Klub",
    wohltaetigkeit: "Organizacja charytatywna",
    sehenswuerdigkeit: "Atrakcja",
    sonstiges: "Inne",
  },
  ar: {
    praxis_gesundheit: "الصحة والعيادات",
    gastronomie: "المطاعم",
    unternehmen: "شركة",
    dienstleistung: "خدمات",
    handwerk: "حِرف",
    event: "فعالية",
    verein: "نادي",
    wohltaetigkeit: "خيري",
    sehenswuerdigkeit: "معلم سياحي",
    sonstiges: "أخرى",
  },
  fr: {
    praxis_gesundheit: "Santé & cabinet",
    gastronomie: "Restauration",
    unternehmen: "Entreprise",
    dienstleistung: "Services",
    handwerk: "Artisanat",
    event: "Événement",
    verein: "Association",
    wohltaetigkeit: "Caritatif",
    sehenswuerdigkeit: "Attraction",
    sonstiges: "Autre",
  },
  es: {
    praxis_gesundheit: "Salud y consulta",
    gastronomie: "Gastronomía",
    unternehmen: "Empresa",
    dienstleistung: "Servicios",
    handwerk: "Oficios",
    event: "Evento",
    verein: "Club",
    wohltaetigkeit: "Beneficencia",
    sehenswuerdigkeit: "Atracción",
    sonstiges: "Otros",
  },
  it: {
    praxis_gesundheit: "Salute e studio",
    gastronomie: "Ristorazione",
    unternehmen: "Azienda",
    dienstleistung: "Servizi",
    handwerk: "Artigianato",
    event: "Evento",
    verein: "Associazione",
    wohltaetigkeit: "Beneficenza",
    sehenswuerdigkeit: "Attrazione",
    sonstiges: "Altro",
  },
} as const;

const QR_VERIFY_STATUS_TEXT = {
  de: {
    approved: "Genehmigt",
    rejected: "Abgelehnt",
    unknown: "Unbekannt",
    verified: "Verifiziert",
    verifiedText: "Dieser Business QR-X ist verifiziert.",
    status: "Status",
  },
  en: {
    approved: "Approved",
    rejected: "Rejected",
    unknown: "Unknown",
    verified: "Verified",
    verifiedText: "This Business QR-X is verified.",
    status: "Status",
  },
  tr: {
    approved: "Onaylandı",
    rejected: "Reddedildi",
    unknown: "Bilinmiyor",
    verified: "Doğrulandı",
    verifiedText: "Bu Business QR-X doğrulandı.",
    status: "Durum",
  },
  pl: {
    approved: "Zatwierdzono",
    rejected: "Odrzucono",
    unknown: "Nieznany",
    verified: "Zweryfikowano",
    verifiedText: "Ten Business QR-X jest zweryfikowany.",
    status: "Status",
  },
  ar: {
    approved: "تمت الموافقة",
    rejected: "مرفوض",
    unknown: "غير معروف",
    verified: "موثّق",
    verifiedText: "تم توثيق Business QR-X هذا.",
    status: "الحالة",
  },
  fr: {
    approved: "Approuvé",
    rejected: "Refusé",
    unknown: "Inconnu",
    verified: "Vérifié",
    verifiedText: "Ce Business QR-X est vérifié.",
    status: "Statut",
  },
  es: {
    approved: "Aprobado",
    rejected: "Rechazado",
    unknown: "Desconocido",
    verified: "Verificado",
    verifiedText: "Este Business QR-X está verificado.",
    status: "Estado",
  },
  it: {
    approved: "Approvato",
    rejected: "Rifiutato",
    unknown: "Sconosciuto",
    verified: "Verificato",
    verifiedText: "Questo Business QR-X è verificato.",
    status: "Stato",
  },
} as const;

const QR_EDIT_EXTRA_TEXT = {
  de: {
    loadFailed: "QR-X konnte nicht geladen werden.",
    justNow: "Gerade eben",
    notFound: "QR-X wurde nicht gefunden.",
    forbidden: "Du darfst diesen QR-X nicht bearbeiten.",
    saveFailed: "QR-X konnte nicht gespeichert werden.",
    noNews: "Noch keine News vorhanden.",
    keepPassword: "Lasse die Felder leer, wenn du das bestehende Passwort behalten möchtest.",
    charged: "Abgezogen",
    evidenceExamples: "Lade einen Nachweis hoch, z. B. Gewerbeanmeldung, Handelsregisterauszug oder einen vergleichbaren offiziellen Nachweis. Erlaubt sind Bilder und PDF-Dateien.",
    missingStorage: "Für die ausgewählten Medien fehlen noch {{count}} Credit(s). Kaufe Credits im neuen Tab und aktualisiere danach diese Seite.",
    expectedStorage: "Beim Speichern werden voraussichtlich {{count}} zusätzliche Speicher-Credit(s) benötigt.",
    multipleImages: "Du kannst mehrere Bilder gleichzeitig auswählen.",
    noGallery: "Noch keine Galerie-Bilder vorhanden.",
    fileMediaHint: "PDFs und andere Dateien werden als Datei-Medien gespeichert.",
    noFiles: "Noch keine Dateien vorhanden.",
  },
  en: {
    loadFailed: "QR-X could not be loaded.",
    justNow: "Just now",
    notFound: "QR-X was not found.",
    forbidden: "You are not allowed to edit this QR-X.",
    saveFailed: "QR-X could not be saved.",
    noNews: "No news yet.",
    keepPassword: "Leave the fields empty to keep the existing password.",
    charged: "Charged",
    evidenceExamples: "Upload evidence such as a business registration, registry extract or comparable official document. Images and PDF files are allowed.",
    missingStorage: "The selected media still require {{count}} Credit(s). Buy Credits in a new tab and then refresh this page.",
    expectedStorage: "Saving is expected to require {{count}} additional storage Credit(s).",
    multipleImages: "You can select multiple images at once.",
    noGallery: "No gallery images yet.",
    fileMediaHint: "PDFs and other files are stored as file media.",
    noFiles: "No files yet.",
  },
  tr: {
    loadFailed: "QR-X yüklenemedi.",
    justNow: "Az önce",
    notFound: "QR-X bulunamadı.",
    forbidden: "Bu QR-X'i düzenleme iznin yok.",
    saveFailed: "QR-X kaydedilemedi.",
    noNews: "Henüz haber yok.",
    keepPassword: "Mevcut şifreyi korumak için alanları boş bırak.",
    charged: "Düşüldü",
    evidenceExamples: "İşletme kaydı, ticaret sicil belgesi veya benzer resmi bir belge yükle. Görsel ve PDF kabul edilir.",
    missingStorage: "Seçilen medya için {{count}} Credit daha gerekiyor. Yeni sekmede Credits satın al ve ardından bu sayfayı güncelle.",
    expectedStorage: "Kaydederken yaklaşık {{count}} ek depolama Credit gerekmesi bekleniyor.",
    multipleImages: "Aynı anda birden fazla görsel seçebilirsin.",
    noGallery: "Henüz galeri görseli yok.",
    fileMediaHint: "PDF ve diğer dosyalar dosya medyası olarak saklanır.",
    noFiles: "Henüz dosya yok.",
  },
  pl: {
    loadFailed: "Nie udało się wczytać QR-X.",
    justNow: "Przed chwilą",
    notFound: "Nie znaleziono QR-X.",
    forbidden: "Nie możesz edytować tego QR-X.",
    saveFailed: "Nie udało się zapisać QR-X.",
    noNews: "Brak aktualności.",
    keepPassword: "Pozostaw pola puste, aby zachować obecne hasło.",
    charged: "Pobrano",
    evidenceExamples: "Prześlij np. dokument rejestracyjny firmy, odpis z rejestru lub podobny dokument urzędowy. Dozwolone są obrazy i PDF.",
    missingStorage: "Dla wybranych mediów brakuje {{count}} Credit(s). Kup Credits w nowej karcie i odśwież tę stronę.",
    expectedStorage: "Podczas zapisywania prawdopodobnie będzie potrzebne {{count}} dodatkowych Credit(s) za pamięć.",
    multipleImages: "Możesz wybrać kilka obrazów jednocześnie.",
    noGallery: "Brak obrazów w galerii.",
    fileMediaHint: "PDF-y i inne pliki są zapisywane jako media plikowe.",
    noFiles: "Brak plików.",
  },
  ar: {
    loadFailed: "تعذر تحميل QR-X.",
    justNow: "الآن",
    notFound: "لم يتم العثور على QR-X.",
    forbidden: "لا يُسمح لك بتعديل هذا QR-X.",
    saveFailed: "تعذر حفظ QR-X.",
    noNews: "لا توجد أخبار بعد.",
    keepPassword: "اترك الحقول فارغة للاحتفاظ بكلمة المرور الحالية.",
    charged: "تم الخصم",
    evidenceExamples: "ارفع إثباتًا مثل سجل تجاري أو مستخرج رسمي أو وثيقة مماثلة. يُسمح بالصور وملفات PDF.",
    missingStorage: "تحتاج الوسائط المحددة إلى {{count}} Credit إضافية. اشترِ Credits في تبويب جديد ثم حدّث هذه الصفحة.",
    expectedStorage: "من المتوقع أن يتطلب الحفظ {{count}} Credit تخزين إضافية.",
    multipleImages: "يمكنك اختيار عدة صور في وقت واحد.",
    noGallery: "لا توجد صور في المعرض بعد.",
    fileMediaHint: "يتم حفظ ملفات PDF والملفات الأخرى كوسائط ملفات.",
    noFiles: "لا توجد ملفات بعد.",
  },
  fr: {
    loadFailed: "Le QR-X n’a pas pu être chargé.",
    justNow: "À l’instant",
    notFound: "Le QR-X est introuvable.",
    forbidden: "Vous n’êtes pas autorisé à modifier ce QR-X.",
    saveFailed: "Le QR-X n’a pas pu être enregistré.",
    noNews: "Aucune actualité.",
    keepPassword: "Laissez les champs vides pour conserver le mot de passe actuel.",
    charged: "Débité",
    evidenceExamples: "Ajoutez par exemple un justificatif d’entreprise, un extrait de registre ou un document officiel comparable. Images et PDF sont acceptés.",
    missingStorage: "Il manque encore {{count}} Credit(s) pour les médias sélectionnés. Achetez des Credits dans un nouvel onglet puis actualisez cette page.",
    expectedStorage: "L’enregistrement devrait nécessiter {{count}} Credit(s) de stockage supplémentaires.",
    multipleImages: "Vous pouvez sélectionner plusieurs images à la fois.",
    noGallery: "Aucune image dans la galerie.",
    fileMediaHint: "Les PDF et autres fichiers sont enregistrés comme médias de type fichier.",
    noFiles: "Aucun fichier.",
  },
  es: {
    loadFailed: "No se pudo cargar el QR-X.",
    justNow: "Ahora mismo",
    notFound: "No se encontró el QR-X.",
    forbidden: "No tienes permiso para editar este QR-X.",
    saveFailed: "No se pudo guardar el QR-X.",
    noNews: "Todavía no hay noticias.",
    keepPassword: "Deja los campos vacíos para conservar la contraseña actual.",
    charged: "Descontado",
    evidenceExamples: "Sube, por ejemplo, un registro de empresa, extracto mercantil o documento oficial similar. Se permiten imágenes y PDF.",
    missingStorage: "Faltan {{count}} Credit(s) para los medios seleccionados. Compra Credits en una pestaña nueva y actualiza esta página.",
    expectedStorage: "Al guardar se prevé que hagan falta {{count}} Credit(s) adicionales de almacenamiento.",
    multipleImages: "Puedes seleccionar varias imágenes a la vez.",
    noGallery: "Todavía no hay imágenes en la galería.",
    fileMediaHint: "Los PDF y otros archivos se guardan como medios de archivo.",
    noFiles: "Todavía no hay archivos.",
  },
  it: {
    loadFailed: "Impossibile caricare il QR-X.",
    justNow: "Proprio ora",
    notFound: "QR-X non trovato.",
    forbidden: "Non sei autorizzato a modificare questo QR-X.",
    saveFailed: "Impossibile salvare il QR-X.",
    noNews: "Ancora nessuna news.",
    keepPassword: "Lascia i campi vuoti per mantenere la password esistente.",
    charged: "Addebitato",
    evidenceExamples: "Carica ad esempio un documento aziendale, estratto del registro o documento ufficiale equivalente. Sono consentiti immagini e PDF.",
    missingStorage: "Per i media selezionati mancano {{count}} Credit(s). Acquista Credits in una nuova scheda e poi aggiorna questa pagina.",
    expectedStorage: "Al salvataggio saranno probabilmente necessari {{count}} Credit(s) aggiuntivi di archiviazione.",
    multipleImages: "Puoi selezionare più immagini contemporaneamente.",
    noGallery: "Nessuna immagine in galleria.",
    fileMediaHint: "PDF e altri file vengono salvati come media file.",
    noFiles: "Nessun file.",
  },
} as const;

type QrxType = "normal" | "business";
type LocationMode = "none" | "current" | "manual";
type BusinessCategory =
  | "praxis_gesundheit"
  | "gastronomie"
  | "unternehmen"
  | "dienstleistung"
  | "handwerk"
  | "event"
  | "verein"
  | "wohltaetigkeit"
  | "sehenswuerdigkeit"
  | "sonstiges";
type VerificationStatus = "pending" | "approved" | "rejected" | string;
type NewsItem = { text: string; createdAt: string };

const MAX_VISIBLE_NEWS = 5;
const QRX_VERIFICATION_BUCKET = "qrx-verification-documents";
const QRX_VERIFICATION_COST_CREDITS = 10;

const BUSINESS_CATEGORY_OPTIONS: Array<{ value: BusinessCategory; label: string; icon: string }> = [
  { value: "praxis_gesundheit", label: "Praxis & Gesundheit", icon: "🏥" },
  { value: "gastronomie", label: "Gastronomie", icon: "🍽️" },
  { value: "unternehmen", label: "Unternehmen", icon: "🏢" },
  { value: "dienstleistung", label: "Dienstleistung", icon: "🛠️" },
  { value: "handwerk", label: "Handwerk", icon: "🔨" },
  { value: "event", label: "Event", icon: "📅" },
  { value: "verein", label: "Verein", icon: "👥" },
  { value: "wohltaetigkeit", label: "Wohltätigkeit", icon: "♡" },
  { value: "sehenswuerdigkeit", label: "Sehenswürdigkeit", icon: "📷" },
  { value: "sonstiges", label: "Sonstiges", icon: "▦" },
];

function getSafeBusinessCategory(value: unknown): BusinessCategory | "" {
  return BUSINESS_CATEGORY_OPTIONS.some((item) => item.value === value)
    ? (value as BusinessCategory)
    : "";
}

type QrxEntry = {
  id: string;
  owner_user_id: string | null;
  title: string | null;
  company_name: string | null;
  description: string | null;
  news: NewsItem[] | null;
  type: QrxType | string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  cta_phone: string | null;
  cta_website: string | null;
  cta_email: string | null;
  cta_navigation: string | null;
  verified: boolean | null;
  suspended: boolean | null;
  password_protected: boolean | null;
  logo_url: string | null;
  cover_image_url: string | null;
  category: BusinessCategory | null;
  storage_limit_mb: number | null;
  collection_title: string | null;
  collection_description: string | null;
};

type SavedCollectionEntry = Omit<
  QrxCollectionCandidate,
  "source" | "custom_title"
> & {
  deleted_at?: string | null;
  suspended?: boolean | null;
};

type SavedCollectionCandidateRow = {
  qrx_id: string | null;
  qr_x_entries: SavedCollectionEntry | SavedCollectionEntry[] | null;
};

type ExistingCollectionRow = {
  linked_qrx_id: string;
  sort_order: number | null;
  custom_title: string | null;
};



type QrxMedia = {
  id: string;
  qrx_id: string;
  type: "image" | "file" | string;
  url: string;
  filename: string;
  bytes: number | null;
  storage_path?: string | null;
};

type PrepareUploadResponse = {
  uploadUrl?: string;
  signedUrl?: string;
  signed_url?: string;
  url?: string;
  storagePath?: string;
  storage_path?: string;
  path?: string;
  charged_credits?: number;
  new_balance?: number;
};

type FinalizeUploadResponse = {
  publicUrl?: string;
  public_url?: string;
  url?: string;
  media?: {
    id?: string;
    qrx_id?: string;
    type?: string;
    url?: string | null;
    filename?: string;
    bytes?: number | null;
  } | null;
};

type VerificationRequest = {
  id: string;
  qrx_id: string | null;
  owner_user_id: string | null;
  status: VerificationStatus | null;
  credits_charged: number | null;
  refund_done: boolean | null;
  document_filename: string | null;
  document_mime_type: string | null;
  document_type: "image" | "pdf" | string | null;
  created_at: string | null;
  updated_at: string | null;
};

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return fallback;
}

function toNullable(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalNumber(value: string, label: string, errorTemplate = "{{label}} muss eine gültige Zahl sein.") {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(",", ".");
  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    throw new Error(errorTemplate.replace("{{label}}", label));
  }

  return numberValue;
}

function formatOptionalNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return String(value);
}

function normalizeNewsItems(value: NewsItem[] | null | undefined) {
  const raw = Array.isArray(value) ? value : [];

  return raw
    .filter((item) => typeof item?.text === "string" && item.text.trim().length > 0)
    .map((item) => ({
      text: item.text.trim(),
      createdAt: typeof item.createdAt === "string" && item.createdAt.trim()
        ? item.createdAt
        : new Date().toISOString(),
    }))
    .sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    });
}

function formatNewsDate(value: string, locale: QrxWebLocale, justNow: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return justNow;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMb(value: number) {
  return `${value.toFixed(1).replace(".", ",")} MB`;
}

function getSafeQrxType(value: string | null | undefined): QrxType {
  return value === "business" ? "business" : "normal";
}

function normalizeErrorMessage(error: unknown) {
  const errorLike = error as {
    message?: unknown;
    error_description?: unknown;
    details?: unknown;
    hint?: unknown;
  };

  return String(
    errorLike.message ??
      errorLike.error_description ??
      errorLike.details ??
      errorLike.hint ??
      error ??
      "Unbekannter Fehler",
  );
}

function formatBytes(bytes: number | null | undefined) {
  const value = Number(bytes ?? 0);
  if (!Number.isFinite(value) || value <= 0) return "–";

  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  }

  if (value >= 1024) {
    return `${(value / 1024).toFixed(1).replace(".", ",")} KB`;
  }

  return `${value} B`;
}

function sanitizeFilename(value: string) {

  return (
    value
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `verification-${Date.now().toString()}`
  );
}



function pickFirstString(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 8) return fromName.toLowerCase();

  const fromType = file.type.split("/").pop();
  return fromType && fromType.trim() ? fromType : "bin";
}

function buildUploadFilename(prefix: "logo" | "cover" | "gallery" | "file", file: File) {
  const ext = getFileExtension(file).replace(/[^a-z0-9]/gi, "") || "bin";
  return `${prefix}-${Date.now().toString()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function getVerificationStatusLabel(status: VerificationStatus | null | undefined, locale: QrxWebLocale) {
  const ui = QR_FORM_TEXT[locale];
  const statusUi = QR_VERIFY_STATUS_TEXT[locale];
  if (status === "pending") return ui.pending;
  if (status === "approved") return statusUi.approved;
  if (status === "rejected") return statusUi.rejected;
  return statusUi.unknown;
}

function getVerificationStatusText(args: {
  isVerified: boolean;
  request: VerificationRequest | null;
}, locale: QrxWebLocale) {
  const ui = QR_FORM_TEXT[locale];
  const statusUi = QR_VERIFY_STATUS_TEXT[locale];
  if (args.isVerified) return statusUi.verifiedText;
  if (args.request?.status === "pending") return ui.pendingText;
  if (args.request?.status === "rejected") return ui.rejectedText;
  return ui.notVerified;
}

export default function EditQrxPage() {
  const router = useRouter();
  const params = useParams();

  const locale = getParam(params?.locale as string | string[] | undefined, "de");
  const qrxLocale = normalizeQrxLocale(locale);
  const ui = QR_FORM_TEXT[qrxLocale];
  const statusUi = QR_VERIFY_STATUS_TEXT[qrxLocale];
  const extraUi = QR_EDIT_EXTRA_TEXT[qrxLocale];
  const qrxId = getParam(params?.id as string | string[] | undefined, "");

  const [loading, setLoading] = useState(true);
  const [qrxType, setQrxType] = useState<QrxType>("normal");
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState<BusinessCategory | "">("");
  const [description, setDescription] = useState("");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsInput, setNewsInput] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");
  const [locationMode, setLocationMode] = useState<LocationMode>("none");
  const [locationLoading, setLocationLoading] = useState(false);
  const [ctaPhone, setCtaPhone] = useState("");
  const [ctaWebsite, setCtaWebsite] = useState("");
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaNavigation, setCtaNavigation] = useState("");

  const [passwordProtected, setPasswordProtected] = useState(false);
  const [passwordWasProtected, setPasswordWasProtected] = useState(false);
  const [qrxPassword, setQrxPassword] = useState("");
  const [qrxPasswordRepeat, setQrxPasswordRepeat] = useState("");

  const [isVerified, setIsVerified] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [verificationSaving, setVerificationSaving] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);


  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [storageLimitMb, setStorageLimitMb] = useState(2);
  const [mediaItems, setMediaItems] = useState<QrxMedia[]>([]);
  const [usedBytes, setUsedBytes] = useState(0);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverPositionX, setCoverPositionX] = useState(50);
  const [coverPositionY, setCoverPositionY] = useState(50);
  const [coverZoom, setCoverZoom] = useState(100);
  const coverPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const coverBitmapRef = useRef<ImageBitmap | null>(null);
  const [coverBitmapVersion, setCoverBitmapVersion] = useState(0);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [fileUploads, setFileUploads] = useState<File[]>([]);
  const [mediaSaving, setMediaSaving] = useState(false);

  const [collectionCandidates, setCollectionCandidates] = useState<QrxCollectionCandidate[]>([]);
  const [selectedCollectionQrxIds, setSelectedCollectionQrxIds] = useState<string[]>([]);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionLoading, setCollectionLoading] = useState(true);


  useEffect(() => {
    let cancelled = false;

    async function prepareCoverBitmap() {
      coverBitmapRef.current?.close();
      coverBitmapRef.current = null;

      if (!coverFile) {
        setCoverBitmapVersion((value) => value + 1);
        return;
      }

      try {
        const bitmap = await createImageBitmap(coverFile);
        if (cancelled) {
          bitmap.close();
          return;
        }
        coverBitmapRef.current = bitmap;
        setCoverBitmapVersion((value) => value + 1);
      } catch {
        // The normal upload validation handles invalid image files.
      }
    }

    void prepareCoverBitmap();

    return () => {
      cancelled = true;
    };
  }, [coverFile]);

  useEffect(() => {
    const canvas = coverPreviewCanvasRef.current;
    const bitmap = coverBitmapRef.current;
    if (!canvas || !bitmap) return;
    drawPositionedCoverPreview(canvas, bitmap, coverPositionX, coverPositionY, coverZoom);
  }, [coverBitmapVersion, coverPositionX, coverPositionY, coverZoom]);

  useEffect(() => {
    return () => {
      coverBitmapRef.current?.close();
      coverBitmapRef.current = null;
    };
  }, []);

  useEffect(() => {
    void loadQrx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrxId]);

  async function getCurrentUserOrThrow() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error(ui.login);
    return user;
  }

  async function loadCreditBalance(userId: string) {
    const { data, error } = await supabase
      .from("qrx_credits")
      .select("credits")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from("qrx_credits")
        .upsert(
          { user_id: userId, credits: 0 },
          { onConflict: "user_id", ignoreDuplicates: false },
        )
        .select("credits")
        .maybeSingle();

      if (insertError) throw insertError;
      setCredits(Number(inserted?.credits ?? 0));
      return;
    }

    setCredits(Number((data as { credits?: number | null }).credits ?? 0));
  }

  async function loadLatestVerificationRequest(userId: string) {
    if (!qrxId) {
      setVerificationRequest(null);
      return;
    }

    const { data, error } = await supabase
      .from("qrx_verification_requests")
      .select(
        "id,qrx_id,owner_user_id,status,credits_charged,refund_done,document_filename,document_mime_type,document_type,created_at,updated_at",
      )
      .eq("qrx_id", qrxId)
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .returns<VerificationRequest>();

    if (error) throw error;
    setVerificationRequest(data ?? null);
  }



  async function loadMediaAndStorage() {
    if (!qrxId) {
      setMediaItems([]);
      setUsedBytes(0);
      setStorageLimitMb(2);
      return;
    }

    const [mediaResult, entryResult] = await Promise.all([
      supabase
        .from("qr_x_media")
        .select("id,qrx_id,type,url,filename,bytes,storage_path")
        .eq("qrx_id", qrxId)
        .order("created_at", { ascending: false })
        .returns<QrxMedia[]>(),
      supabase
        .from("qr_x_entries")
        .select("storage_limit_mb")
        .eq("id", qrxId)
        .maybeSingle(),
    ]);

    if (mediaResult.error) throw mediaResult.error;
    if (entryResult.error) throw entryResult.error;

    const list = mediaResult.data ?? [];
    setMediaItems(list);
    setUsedBytes(list.reduce((sum, item) => sum + Number(item.bytes ?? 0), 0));

    const nextStorageLimit = Number(
      (entryResult.data as { storage_limit_mb?: number | null } | null)?.storage_limit_mb ?? 2,
    );
    setStorageLimitMb(Number.isFinite(nextStorageLimit) && nextStorageLimit >= 2 ? nextStorageLimit : 2);
  }


  async function loadCollectionData(userId: string) {
    if (!qrxId) {
      setCollectionCandidates([]);
      setSelectedCollectionQrxIds([]);
      setCollectionLoading(false);
      return;
    }

    setCollectionLoading(true);

    try {
      const [ownResult, savedResult, collectionResult] = await Promise.all([
        supabase
          .from("qr_x_entries")
          .select(
            "id,title,company_name,type,logo_url,cover_image_url,deleted_at,suspended",
          )
          .eq("owner_user_id", userId)
          .neq("id", qrxId)
          .is("deleted_at", null)
          .or("suspended.is.null,suspended.eq.false")
          .order("created_at", { ascending: false }),

        supabase
          .from("qrx_saves")
          .select(`
            qrx_id,
            qr_x_entries (
              id,
              title,
              company_name,
              type,
              logo_url,
              cover_image_url,
              deleted_at,
              suspended
            )
          `)
          .eq("user_id", userId),

        supabase
          .from("qrx_collection_items")
          .select("linked_qrx_id,sort_order,custom_title")
          .eq("collection_qrx_id", qrxId)
          .order("sort_order", { ascending: true })
          .returns<ExistingCollectionRow[]>(),
      ]);

      if (ownResult.error) throw ownResult.error;
      if (savedResult.error) throw savedResult.error;
      if (collectionResult.error) throw collectionResult.error;

      const ownItems: QrxCollectionCandidate[] = (ownResult.data ?? []).map(
        (entry) => ({
          id: String(entry.id),
          title:
            typeof entry.title === "string" ? entry.title : null,
          company_name:
            typeof entry.company_name === "string"
              ? entry.company_name
              : null,
          type:
            typeof entry.type === "string" ? entry.type : null,
          logo_url:
            typeof entry.logo_url === "string" ? entry.logo_url : null,
          cover_image_url:
            typeof entry.cover_image_url === "string"
              ? entry.cover_image_url
              : null,
          source: "own" as const,
          custom_title: null,
        }),
      );

      const ownIds = new Set(ownItems.map((item) => item.id));

      const savedItems = (
        (savedResult.data ?? []) as SavedCollectionCandidateRow[]
      ).reduce<QrxCollectionCandidate[]>((accumulator, row) => {
        const relation = row.qr_x_entries;
        const entry = Array.isArray(relation) ? relation[0] ?? null : relation;

        if (
          !entry ||
          !entry.id ||
          entry.id === qrxId ||
          entry.deleted_at ||
          entry.suspended === true ||
          ownIds.has(entry.id)
        ) {
          return accumulator;
        }

        accumulator.push({
          id: entry.id,
          title: entry.title ?? null,
          company_name: entry.company_name ?? null,
          type: entry.type ?? null,
          logo_url: entry.logo_url ?? null,
          cover_image_url: entry.cover_image_url ?? null,
          source: "saved",
          custom_title: null,
        });

        return accumulator;
      }, []);

      const existingRows = collectionResult.data ?? [];
      const existingById = new Map(
        existingRows.map((row) => [
          row.linked_qrx_id,
          row.custom_title ?? null,
        ]),
      );

      const mergedCandidates = [...ownItems, ...savedItems].map((item) => ({
        ...item,
        custom_title: existingById.get(item.id) ?? item.custom_title ?? null,
      }));

      setCollectionCandidates(mergedCandidates);
      setSelectedCollectionQrxIds(
        existingRows
          .map((row) => row.linked_qrx_id)
          .filter((id) => mergedCandidates.some((item) => item.id === id)),
      );
    } finally {
      setCollectionLoading(false);
    }
  }

  function handleCollectionSelectionChange(nextIds: string[]) {
    const collectionWillBecomeEmpty =
      selectedCollectionQrxIds.length > 0 && nextIds.length === 0;

    if (
      collectionWillBecomeEmpty &&
      (collectionTitle.trim() || collectionDescription.trim())
    ) {
      const removeText = window.confirm(
        ui.collectionEmptyConfirm,
      );

      if (removeText) {
        setCollectionTitle("");
        setCollectionDescription("");
      }
    }

    setSelectedCollectionQrxIds(nextIds);
  }

  async function saveCollection(userId: string) {
    if (!qrxId) throw new Error("QR-X ID fehlt.");

    const { data: existingRows, error: existingError } = await supabase
      .from("qrx_collection_items")
      .select("linked_qrx_id")
      .eq("collection_qrx_id", qrxId)
      .returns<Array<{ linked_qrx_id: string }>>();

    if (existingError) throw existingError;

    const existingIds = new Set(
      (existingRows ?? []).map((row) => row.linked_qrx_id),
    );
    const selectedIds = new Set(selectedCollectionQrxIds);

    const idsToDelete = [...existingIds].filter((id) => !selectedIds.has(id));

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("qrx_collection_items")
        .delete()
        .eq("collection_qrx_id", qrxId)
        .in("linked_qrx_id", idsToDelete);

      if (deleteError) throw deleteError;
    }

    if (selectedCollectionQrxIds.length > 0) {
      const rows = selectedCollectionQrxIds.map((linkedQrxId, index) => {
        const candidate = collectionCandidates.find(
          (item) => item.id === linkedQrxId,
        );

        return {
          collection_qrx_id: qrxId,
          linked_qrx_id: linkedQrxId,
          added_by: userId,
          custom_title: candidate?.custom_title?.trim() || null,
          sort_order: index,
        };
      });

      const { error: upsertError } = await supabase
        .from("qrx_collection_items")
        .upsert(rows, {
          onConflict: "collection_qrx_id,linked_qrx_id",
          ignoreDuplicates: false,
        });

      if (upsertError) throw upsertError;
    }
  }

  function handleLocationModeChange(nextMode: LocationMode) {
    setLocationMode(nextMode);

    if (nextMode === "none") {
      setLocationName("");
      setLocationLat("");
      setLocationLng("");
    }
  }

  async function getCurrentLocation() {
    setErrorText(null);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationMode("manual");
      setErrorText(
        ui.locationAutoFailed,
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationMode("current");
        setLocationLat(String(position.coords.latitude));
        setLocationLng(String(position.coords.longitude));
        setLocationLoading(false);
      },
      (geoError) => {
        console.warn("QRX GEOLOCATION ERROR", geoError);
        setLocationMode("manual");
        setLocationLoading(false);
        setErrorText(
          ui.locationAutoFailed,
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  async function spendCredits(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return credits ?? 0;

    const { data, error } = await supabase.rpc("spend_credits", {
      p_amount: amount,
    });

    if (error) {
      throw new Error(normalizeErrorMessage(error) || ui.creditsChargeFailed);
    }

    const nextCredits = typeof data === "number" ? data : Math.max(0, (credits ?? 0) - amount);
    setCredits(nextCredits);
    return nextCredits;
  }

  async function addCredits(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return credits ?? 0;

    const { data, error } = await supabase.rpc("add_credits", {
      p_amount: amount,
    });

    if (error) {
      throw new Error(normalizeErrorMessage(error) || ui.creditsRefundFailed);
    }

    const nextCredits = typeof data === "number" ? data : (credits ?? 0) + amount;
    setCredits(nextCredits);
    return nextCredits;
  }

  async function saveQrxPasswordProtection(args: {
    qrxId: string;
    enabled: boolean;
    password: string;
  }) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const token = session?.access_token;

    if (!token) {
      throw new Error(ui.sessionExpired);
    }

    const { error } = await supabase.functions.invoke("set-qrx-password", {
      body: {
        qrxId: args.qrxId,
        enabled: args.enabled,
        password: args.enabled ? args.password : "",
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (error) {
      throw error;
    }
  }

  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    const token = session?.access_token;
    if (!token) {
      throw new Error(ui.sessionExpired);
    }

    return token;
  }

  async function prepareUpload(args: {
    qrxId: string;
    type: "image" | "file";
    filename: string;
    mimeType: string;
    bytes: number;
  }) {
    const token = await getAccessToken();

    const { data, error } = await supabase.functions.invoke("qrx-media-prepare-upload", {
      body: {
        qrxId: args.qrxId,
        type: args.type,
        filename: args.filename,
        mimeType: args.mimeType,
        bytes: args.bytes,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (error) throw error;

    const response = (data ?? {}) as PrepareUploadResponse;
    const uploadUrl = pickFirstString(
      response.uploadUrl,
      response.signedUrl,
      response.signed_url,
      response.url,
    );
    const storagePath = pickFirstString(
      response.storagePath,
      response.storage_path,
      response.path,
    );

    if (!uploadUrl || !storagePath) {
      throw new Error("Prepare-Upload: uploadUrl oder storagePath fehlt.");
    }

    return { uploadUrl, storagePath };
  }

  async function finalizeUpload(args: {
    qrxId: string;
    type: "image" | "file";
    filename: string;
    mimeType: string;
    bytes: number;
    storagePath: string;
  }) {
    const token = await getAccessToken();

    const { data, error } = await supabase.functions.invoke("qrx-media-finalize-upload", {
      body: {
        qrxId: args.qrxId,
        type: args.type,
        filename: args.filename,
        mimeType: args.mimeType,
        bytes: args.bytes,
        storagePath: args.storagePath,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (error) throw error;

    const response = (data ?? {}) as FinalizeUploadResponse;
    const publicUrl = pickFirstString(
      response.publicUrl,
      response.public_url,
      response.url,
      response.media?.url,
    );

    if (!publicUrl) {
      throw new Error("Finalize-Upload: publicUrl fehlt.");
    }

    return { publicUrl };
  }

  async function uploadQrxMedia(args: {
    qrxId: string;
    file: File;
    prefix: "logo" | "cover" | "gallery" | "file";
    mediaType: "image" | "file";
  }) {
    const filename = buildUploadFilename(args.prefix, args.file);
    const mimeType = args.file.type || (args.mediaType === "file" ? "application/octet-stream" : "image/jpeg");
    const bytes = args.file.size;

    const prepared = await prepareUpload({
      qrxId: args.qrxId,
      type: args.mediaType,
      filename,
      mimeType,
      bytes,
    });

    const arrayBuffer = await args.file.arrayBuffer();
    const uploadResponse = await fetch(prepared.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mimeType },
      body: arrayBuffer,
    });

    if (!uploadResponse.ok) {
      const message = await uploadResponse.text().catch(() => "");
      throw new Error(`Upload fehlgeschlagen (${uploadResponse.status}): ${message || "Unbekannter Fehler"}`);
    }

    const finalized = await finalizeUpload({
      qrxId: args.qrxId,
      type: args.mediaType,
      filename,
      mimeType,
      bytes,
      storagePath: prepared.storagePath,
    });

    return finalized.publicUrl;
  }

  async function loadQrx() {
    setLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!qrxId) {
        throw new Error("QR-X ID fehlt.");
      }

      const user = await getCurrentUserOrThrow();

      const { data, error } = await supabase
        .from("qr_x_entries")
        .select(
          "id,owner_user_id,title,company_name,category,description,news,type,location_name,location_lat,location_lng,cta_phone,cta_website,cta_email,cta_navigation,verified,suspended,password_protected,logo_url,cover_image_url,storage_limit_mb,collection_title,collection_description",
        )
        .eq("id", qrxId)
        .maybeSingle()
        .returns<QrxEntry>();

      if (error) throw error;
      if (!data) throw new Error(extraUi.notFound);
      if (data.owner_user_id !== user.id) throw new Error(extraUi.forbidden);

      const safeType = getSafeQrxType(data.type);
      const isProtected = data.password_protected === true;

      setQrxType(safeType);
      setTitle(data.title ?? "");
      setCompanyName(data.company_name ?? "");
      setCategory(getSafeBusinessCategory(data.category));
      setDescription(data.description ?? "");
      setNewsItems(normalizeNewsItems(data.news));
      setNewsInput("");
      setLocationName(data.location_name ?? "");
      setLocationLat(formatOptionalNumber(data.location_lat));
      setLocationLng(formatOptionalNumber(data.location_lng));
      setLocationMode(data.location_name || data.location_lat != null || data.location_lng != null ? "manual" : "none");
      setCtaPhone(data.cta_phone ?? "");
      setCtaWebsite(data.cta_website ?? "");
      setCtaEmail(data.cta_email ?? "");
      setCtaNavigation(data.cta_navigation ?? "");
      setPasswordProtected(isProtected);
      setPasswordWasProtected(isProtected);
      setQrxPassword("");
      setQrxPasswordRepeat("");
      setIsVerified(data.verified === true);
      setVerificationDocument(null);
      setLogoUrl(data.logo_url ?? null);
      setCoverUrl(data.cover_image_url ?? null);
      setStorageLimitMb(Number(data.storage_limit_mb ?? 2));
      setCollectionTitle(data.collection_title ?? "");
      setCollectionDescription(data.collection_description ?? "");
      setLogoFile(null);
      setCoverFile(null);
      setGalleryFiles([]);
      setFileUploads([]);

      await Promise.all([
        loadCreditBalance(user.id),
        loadLatestVerificationRequest(user.id),
        loadMediaAndStorage(),
        loadCollectionData(user.id),
      ]);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : extraUi.loadFailed);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!qrxId) {
        throw new Error("QR-X ID fehlt.");
      }

      const nextTitle = title.trim();

      if (!nextTitle) {
        throw new Error(ui.enterTitle);
      }

      const nextPassword = qrxPassword.trim();
      const nextPasswordRepeat = qrxPasswordRepeat.trim();
      const passwordChanged = passwordProtected && nextPassword.length > 0;
      const passwordWasDisabled = passwordWasProtected && !passwordProtected;
      const passwordWasEnabled = !passwordWasProtected && passwordProtected;

      if ((passwordWasEnabled || passwordChanged) && nextPassword.length < 4) {
        throw new Error(ui.passwordMin);
      }

      if ((passwordWasEnabled || passwordChanged) && nextPassword !== nextPasswordRepeat) {
        throw new Error(ui.passwordMismatch);
      }

      const lat = locationMode === "none" ? null : parseOptionalNumber(locationLat, ui.latitude, ui.validNumber);
      const lng = locationMode === "none" ? null : parseOptionalNumber(locationLng, ui.longitude, ui.validNumber);

      const user = await getCurrentUserOrThrow();

      if (projectedAdditionalCredits > 0 && credits != null && credits < projectedAdditionalCredits) {
        throw new Error(`${ui.notEnoughCredits}. ${ui.required}: ${projectedAdditionalCredits}, ${ui.available}: ${credits}. ${ui.buyCredits}.`);
      }

      const { error } = await supabase
        .from("qr_x_entries")
        .update({
          title: nextTitle,
          company_name: qrxType === "business" ? toNullable(companyName) : null,
          category: qrxType === "business" ? category || null : null,
          description: toNullable(description),
          news: normalizeNewsItems(newsItems),
          type: qrxType,
          location_name: locationMode === "none" ? null : toNullable(locationName),
          location_lat: lat,
          location_lng: lng,
          cta_phone: qrxType === "business" ? toNullable(ctaPhone) : null,
          cta_website: qrxType === "business" ? toNullable(ctaWebsite) : null,
          cta_email: qrxType === "business" ? toNullable(ctaEmail) : null,
          cta_navigation: qrxType === "business" ? toNullable(ctaNavigation) : null,
          collection_title:
            selectedCollectionQrxIds.length > 0
              ? toNullable(collectionTitle)
              : null,
          collection_description:
            selectedCollectionQrxIds.length > 0
              ? toNullable(collectionDescription)
              : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", qrxId)
        .eq("owner_user_id", user.id);

      if (error) throw error;

      await saveCollection(user.id);

      if (passwordWasDisabled) {
        await saveQrxPasswordProtection({ qrxId, enabled: false, password: "" });
        setPasswordWasProtected(false);
        setQrxPassword("");
        setQrxPasswordRepeat("");
      } else if (passwordWasEnabled || passwordChanged) {
        await saveQrxPasswordProtection({ qrxId, enabled: true, password: nextPassword });
        setPasswordWasProtected(true);
        setPasswordProtected(true);
        setQrxPassword("");
        setQrxPasswordRepeat("");
      }

      if (logoFile) {
        const uploadedLogoUrl = await uploadQrxMedia({
          qrxId,
          file: logoFile,
          prefix: "logo",
          mediaType: "image",
        });

        const { error: logoUpdateError } = await supabase
          .from("qr_x_entries")
          .update({ logo_url: uploadedLogoUrl, updated_at: new Date().toISOString() })
          .eq("id", qrxId)
          .eq("owner_user_id", user.id);

        if (logoUpdateError) throw logoUpdateError;
        setLogoUrl(uploadedLogoUrl);
      }

      if (coverFile) {
        const positionedCoverFile = await createPositionedCoverFile(coverFile, coverPositionX, coverPositionY, coverZoom);
        const uploadedCoverUrl = await uploadQrxMedia({
          qrxId,
          file: positionedCoverFile,
          prefix: "cover",
          mediaType: "image",
        });

        const { error: coverUpdateError } = await supabase
          .from("qr_x_entries")
          .update({ cover_image_url: uploadedCoverUrl, updated_at: new Date().toISOString() })
          .eq("id", qrxId)
          .eq("owner_user_id", user.id);

        if (coverUpdateError) throw coverUpdateError;
        setCoverUrl(uploadedCoverUrl);
      }

      for (const file of galleryFiles) {
        await uploadQrxMedia({ qrxId, file, prefix: "gallery", mediaType: "image" });
      }

      for (const file of fileUploads) {
        await uploadQrxMedia({ qrxId, file, prefix: "file", mediaType: "file" });
      }

      setLogoFile(null);
      setCoverFile(null);
      setGalleryFiles([]);
      setFileUploads([]);
      await Promise.all([loadMediaAndStorage(), loadCreditBalance(user.id)]);

      setSuccessText(hasPendingMedia ? ui.savedMedia : ui.saved);
      router.refresh();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : extraUi.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  function handleVerificationFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setVerificationDocument(file);
    event.target.value = "";
  }

  async function handleSubmitVerificationRequest() {
    setVerificationSaving(true);
    setErrorText(null);
    setSuccessText(null);

    let chargedVerification = false;
    let uploadedStoragePath: string | null = null;

    try {
      if (!qrxId) throw new Error("QR-X ID fehlt.");
      if (qrxType !== "business") throw new Error(ui.onlyBusinessVerify);
      if (isVerified) throw new Error("Dieser QR-X ist bereits verifiziert.");
      if (verificationRequest?.status === "pending") {
        throw new Error(ui.alreadyVerification);
      }
      if (!verificationDocument) {
        throw new Error(ui.proofImagePdf);
      }

      const allowed = verificationDocument.type.startsWith("image/") || verificationDocument.type === "application/pdf" || verificationDocument.name.toLowerCase().endsWith(".pdf");
      if (!allowed) {
        throw new Error(ui.verificationImagePdf);
      }

      const user = await getCurrentUserOrThrow();
      await loadCreditBalance(user.id);

      if (credits != null && credits < QRX_VERIFICATION_COST_CREDITS) {
        throw new Error(
          `${ui.notEnoughCredits}. ${ui.required}: ${QRX_VERIFICATION_COST_CREDITS}, ${ui.available}: ${credits}.`,
        );
      }

      await spendCredits(QRX_VERIFICATION_COST_CREDITS);
      chargedVerification = true;

      const safeFilename = sanitizeFilename(verificationDocument.name);
      const storagePath = `${user.id}/${qrxId}/${Date.now().toString()}-${safeFilename}`;
      const documentType = verificationDocument.type === "application/pdf" || verificationDocument.name.toLowerCase().endsWith(".pdf") ? "pdf" : "image";

      const { error: uploadError } = await supabase.storage
        .from(QRX_VERIFICATION_BUCKET)
        .upload(storagePath, verificationDocument, {
          contentType: verificationDocument.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) throw uploadError;
      uploadedStoragePath = storagePath;

      const { error: insertError } = await supabase
        .from("qrx_verification_requests")
        .insert({
          qrx_id: qrxId,
          owner_user_id: user.id,
          status: "pending",
          credits_charged: QRX_VERIFICATION_COST_CREDITS,
          refund_done: false,
          document_url: `storage://${QRX_VERIFICATION_BUCKET}/${storagePath}`,
          document_path: storagePath,
          document_filename: verificationDocument.name,
          document_mime_type: verificationDocument.type || "application/octet-stream",
          document_type: documentType,
        });

      if (insertError) throw insertError;

      setVerificationDocument(null);
      await Promise.all([loadCreditBalance(user.id), loadLatestVerificationRequest(user.id)]);
      setSuccessText(ui.verificationSubmitted);
    } catch (error) {
      if (uploadedStoragePath) {
        try {
          await supabase.storage.from(QRX_VERIFICATION_BUCKET).remove([uploadedStoragePath]);
        } catch (removeError) {
          console.warn("Verifizierungsdokument-Cleanup fehlgeschlagen:", removeError);
        }
      }

      if (chargedVerification) {
        try {
          await addCredits(QRX_VERIFICATION_COST_CREDITS);
        } catch (refundError) {
          console.warn("Credit-Rückbuchung nach Verifizierungsfehler fehlgeschlagen:", refundError);
        }
      }

      setErrorText(normalizeErrorMessage(error) || ui.unknownError);
    } finally {
      setVerificationSaving(false);
    }
  }


  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && !isImageFile(file)) {
      setErrorText(ui.chooseLogoImage);
      event.target.value = "";
      return;
    }
    setLogoFile(file);
    event.target.value = "";
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && !isImageFile(file)) {
      setErrorText(ui.chooseCoverImage);
      event.target.value = "";
      return;
    }
    setCoverFile(file);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
    setCoverPositionX(50);
    setCoverPositionY(50);
    setCoverZoom(100);
    event.target.value = "";
  }

  function handleGalleryFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).filter(isImageFile);
    if (selected.length > 0) setGalleryFiles((current) => [...current, ...selected]);
    event.target.value = "";
  }

  function handleFileUploadsChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length > 0) setFileUploads((current) => [...current, ...selected]);
    event.target.value = "";
  }

  function handleAddNewsItem() {
    const text = newsInput.trim();
    if (!text) {
      setErrorText(ui.newsRequired);
      return;
    }

    setNewsItems((current) =>
      normalizeNewsItems([
        { text, createdAt: new Date().toISOString() },
        ...current,
      ]),
    );
    setNewsInput("");
    setErrorText(null);
  }

  function handleRemoveNewsItem(indexToRemove: number) {
    setNewsItems((current) => current.filter((_, index) => index !== indexToRemove));
  }


  async function handleDeleteMedia(media: QrxMedia) {
    const ok = window.confirm(ui.confirmDeleteMedia.replace("{{name}}", media.filename));
    if (!ok) return;

    setMediaSaving(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (!qrxId) throw new Error("QR-X ID fehlt.");
      const user = await getCurrentUserOrThrow();

      const updates: Record<string, string | null> = {};
      if (logoUrl && media.url === logoUrl) updates.logo_url = null;
      if (coverUrl && media.url === coverUrl) updates.cover_image_url = null;

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from("qr_x_entries")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", qrxId)
          .eq("owner_user_id", user.id);

        if (updateError) throw updateError;
      }

      const { error } = await supabase
        .from("qr_x_media")
        .delete()
        .eq("id", media.id)
        .eq("qrx_id", qrxId);

      if (error) throw error;

      if (media.url === logoUrl) setLogoUrl(null);
      if (media.url === coverUrl) setCoverUrl(null);
      await loadMediaAndStorage();
      setSuccessText(ui.mediaRemoved);
    } catch (error) {
      setErrorText(normalizeErrorMessage(error) || ui.mediaDeleteFailed);
    } finally {
      setMediaSaving(false);
    }
  }

  async function handleClearLogo() {
    if (!logoUrl) {
      setLogoFile(null);
      return;
    }

    const existing = mediaItems.find((item) => item.url === logoUrl);
    if (existing) {
      await handleDeleteMedia(existing);
      return;
    }

    const ok = window.confirm(ui.confirmRemoveLogo);
    if (!ok) return;

    const user = await getCurrentUserOrThrow();
    const { error } = await supabase
      .from("qr_x_entries")
      .update({ logo_url: null, updated_at: new Date().toISOString() })
      .eq("id", qrxId)
      .eq("owner_user_id", user.id);
    if (error) setErrorText(normalizeErrorMessage(error));
    else setLogoUrl(null);
  }

  async function handleClearCover() {
    if (!coverUrl) {
      setCoverFile(null);
      return;
    }

    const existing = mediaItems.find((item) => item.url === coverUrl);
    if (existing) {
      await handleDeleteMedia(existing);
      return;
    }

    const ok = window.confirm(ui.confirmRemoveCover);
    if (!ok) return;

    const user = await getCurrentUserOrThrow();
    const { error } = await supabase
      .from("qr_x_entries")
      .update({ cover_image_url: null, updated_at: new Date().toISOString() })
      .eq("id", qrxId)
      .eq("owner_user_id", user.id);
    if (error) setErrorText(normalizeErrorMessage(error));
    else setCoverUrl(null);
  }

  const isBusiness = qrxType === "business";
  const canSubmitVerification =
    isBusiness &&
    !isVerified &&
    verificationRequest?.status !== "pending" &&
    !verificationSaving;

  const pendingBytes =
    Number(logoFile?.size ?? 0) +
    Number(coverFile?.size ?? 0) +
    galleryFiles.reduce((sum, file) => sum + Number(file.size ?? 0), 0) +
    fileUploads.reduce((sum, file) => sum + Number(file.size ?? 0), 0);
  const projectedBytes = usedBytes + pendingBytes;
  const usedMb = usedBytes / 1024 / 1024;
  const projectedMb = projectedBytes / 1024 / 1024;
  const freeMb = Math.max(storageLimitMb - usedMb, 0);
  const usagePercent = storageLimitMb > 0 ? Math.min((usedMb / storageLimitMb) * 100, 100) : 0;
  const projectedAdditionalCredits = Math.ceil(Math.max(0, projectedMb - storageLimitMb) / 5);
  const projectedStorageLimitMb = storageLimitMb + projectedAdditionalCredits * 5;
  const projectedUsagePercent =
    projectedStorageLimitMb > 0 ? Math.min((projectedMb / projectedStorageLimitMb) * 100, 100) : 0;
  const visibleImageMedia = mediaItems.filter((item) => item.type === "image" && item.url !== logoUrl && item.url !== coverUrl);
  const visibleFileMedia = mediaItems.filter((item) => item.type === "file");
  const hasPendingMedia = Boolean(logoFile || coverFile || galleryFiles.length > 0 || fileUploads.length > 0);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label={ui.editKicker}>
          <Link href={`/${locale}/dashboard`}>{ui.dashboard}</Link>
          <Link href={`/${locale}/dashboard/qrx`}>{ui.myQrx}</Link>
          {qrxId ? <Link href={`/${locale}/qrx/${qrxId}`}>{ui.openQrx}</Link> : null}
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.kicker}>{ui.editKicker}</span>
          <h1>{title.trim() || ui.editTitle}</h1>
          <p>
            {ui.editHero}
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href={`/${locale}/dashboard/qrx`} className={styles.secondaryButton}>
            {ui.backMyQrx}
          </Link>
        </div>
      </section>

      <section style={panelStyle}>
        <div className={styles.cardHeader}>
          <div>
            <h2>{ui.baseMedia}</h2>
            <p>{ui.editBaseHint}</p>
          </div>
          <span>{isBusiness ? ui.businessQrx : ui.normalQrx}</span>
        </div>

        {loading ? <div style={loadingStyle}>{ui.locationLoading.replace(ui.location, "QR-X")}</div> : null}

        {errorText ? <div style={errorStyle}>{errorText}</div> : null}
        {successText ? <div style={successStyle}>{successText}</div> : null}

        {!loading ? (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                type="button"
                onClick={() => setQrxType("normal")}
                style={typeButtonStyle(qrxType === "normal", "normal")}
              >
                ⌗ {ui.normalQrx}
              </button>

              <button
                type="button"
                onClick={() => setQrxType("business")}
                style={typeButtonStyle(qrxType === "business", "business")}
              >
                🏢 {ui.businessQrx}
              </button>
            </div>

            <label style={labelStyle}>
              {ui.title}
              <input value={title} onChange={(event) => setTitle(event.target.value)} style={inputStyle} required />
            </label>

            {isBusiness ? (
              <label style={labelStyle}>
                {ui.companyName}
                <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} style={inputStyle} />
              </label>
            ) : null}

            {isBusiness ? (
              <div style={sectionBoxStyle}>
                <div>
                  <h3 style={sectionTitleStyle}>{ui.category}</h3>
                  <p style={sectionHintStyle}>
                    {ui.categoryHint}
                  </p>
                </div>

                <div style={categoryGridStyle}>
                  {BUSINESS_CATEGORY_OPTIONS.map((item) => {
                    const active = category === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setCategory(item.value)}
                        style={businessCategoryButtonStyle(active)}
                      >
                        <span aria-hidden="true">{item.icon}</span>
                        <span>{QR_CATEGORY_TEXT[qrxLocale][item.value]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <label style={labelStyle}>
              {ui.description}
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                style={{ ...inputStyle, minHeight: 140, paddingTop: 14, resize: "vertical" }}
              />
            </label>

            <div style={sectionBoxStyle}>
              <div>
                <h3 style={sectionTitleStyle}>{ui.news}</h3>
                <p style={sectionHintStyle}>
                  {ui.newsHint}
                </p>
              </div>

              <label style={labelStyle}>
                {ui.news}
                <textarea
                  value={newsInput}
                  onChange={(event) => setNewsInput(event.target.value)}
                  style={{ ...inputStyle, minHeight: 110, paddingTop: 14, resize: "vertical" }}
                  placeholder={ui.newsPlaceholder}
                />
              </label>

              <button type="button" onClick={handleAddNewsItem} style={addNewsButtonStyle}>
                {ui.addNews}
              </button>

              {newsItems.length > 0 ? (
                <div style={newsListViewportStyle(newsItems.length > MAX_VISIBLE_NEWS)}>
                  {newsItems.map((item, index) => (
                    <div key={`${item.createdAt}-${index}`} style={newsItemCardStyle}>
                      <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
                        <strong style={{ color: "#ffffff", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{item.text}</strong>
                        <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>
                          {formatNewsDate(item.createdAt, qrxLocale, extraUi.justNow)}
                        </span>
                      </div>
                      <button type="button" onClick={() => handleRemoveNewsItem(index)} style={miniDangerButtonStyle}>
                        {ui.delete}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={emptyTextStyle}>{extraUi.noNews}</p>
              )}
            </div>

            <div style={sectionBoxStyle}>
              <div>
                <h3 style={sectionTitleStyle}>{ui.collection}</h3>
                <p style={sectionHintStyle}>
                  {ui.collectionHint}
                </p>
              </div>

              {selectedCollectionQrxIds.length > 0 ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <label style={labelStyle}>
                    {ui.collectionTitle}
                    <input
                      value={collectionTitle}
                      onChange={(event) => setCollectionTitle(event.target.value)}
                      style={inputStyle}
                      maxLength={100}
                      placeholder={ui.collectionTitlePlaceholder}
                    />
                  </label>

                  <label style={labelStyle}>
                    {ui.collectionDescription}
                    <textarea
                      value={collectionDescription}
                      onChange={(event) =>
                        setCollectionDescription(event.target.value)
                      }
                      style={{
                        ...inputStyle,
                        minHeight: 100,
                        paddingTop: 14,
                        resize: "vertical",
                      }}
                      maxLength={500}
                      placeholder={ui.collectionDescriptionPlaceholder}
                    />
                  </label>

                  <p
                    style={{
                      margin: 0,
                      color: "#94a3b8",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {ui.collectionAutoHint}
                  </p>
                </div>
              ) : null}

              <CollectionSelector
                candidates={collectionCandidates}
                selectedIds={selectedCollectionQrxIds}
                loading={collectionLoading}
                onChange={handleCollectionSelectionChange}
              />
            </div>

            <div style={sectionBoxStyle}>
              <div>
                <h3 style={sectionTitleStyle}>{ui.location}</h3>
                <p style={sectionHintStyle}>
                  {ui.locationHint}
                </p>
              </div>

              <div style={locationModeGridStyle}>
                <button
                  type="button"
                  onClick={() => handleLocationModeChange("none")}
                  style={locationModeButtonStyle(locationMode === "none")}
                >
                  {ui.noLocation}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleLocationModeChange("current");
                    void getCurrentLocation();
                  }}
                  style={locationModeButtonStyle(locationMode === "current")}
                  disabled={locationLoading}
                >
                  {locationLoading ? ui.locationLoading : ui.currentLocation}
                </button>

                <button
                  type="button"
                  onClick={() => handleLocationModeChange("manual")}
                  style={locationModeButtonStyle(locationMode === "manual")}
                >
                  {ui.manualCoordinates}
                </button>
              </div>

              {locationMode !== "none" ? (
                <>
                  <label style={labelStyle}>
                    {ui.locationNameLabel}
                    <input value={locationName} onChange={(event) => setLocationName(event.target.value)} style={inputStyle} placeholder={ui.locationPlaceholder} />
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label style={labelStyle}>
                      {ui.latitude}
                      <input value={locationLat} onChange={(event) => setLocationLat(event.target.value)} style={inputStyle} placeholder={ui.exampleLat} />
                    </label>

                    <label style={labelStyle}>
                      {ui.longitude}
                      <input value={locationLng} onChange={(event) => setLocationLng(event.target.value)} style={inputStyle} placeholder={ui.exampleLng} />
                    </label>
                  </div>
                </>
              ) : null}
            </div>

            {isBusiness ? (
              <>
                <div style={dividerStyle} />

                <div>
                  <h3 style={{ margin: "0 0 10px", color: "#ffffff", fontSize: 18 }}>{ui.contact}</h3>
                  <p style={{ margin: "0 0 14px", color: "#94a3b8", lineHeight: 1.55 }}>
                    {ui.contactHint}
                  </p>
                </div>

                <label style={labelStyle}>
                  {ui.phone}
                  <input value={ctaPhone} onChange={(event) => setCtaPhone(event.target.value)} style={inputStyle} />
                </label>

                <label style={labelStyle}>
                  {ui.website}
                  <input value={ctaWebsite} onChange={(event) => setCtaWebsite(event.target.value)} style={inputStyle} placeholder="https://..." />
                </label>

                <label style={labelStyle}>
                  {ui.email}
                  <input value={ctaEmail} onChange={(event) => setCtaEmail(event.target.value)} style={inputStyle} />
                </label>

                <label style={labelStyle}>
                  Navigation
                  <input value={ctaNavigation} onChange={(event) => setCtaNavigation(event.target.value)} style={inputStyle} placeholder={ui.addressPlaceholder} />
                </label>
              </>
            ) : null}

            <div style={passwordBoxStyle(passwordProtected)}>
              <label style={passwordToggleStyle}>
                <span>{ui.passwordProtection}</span>
                <input
                  type="checkbox"
                  checked={passwordProtected}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setPasswordProtected(checked);
                    if (!checked) {
                      setQrxPassword("");
                      setQrxPasswordRepeat("");
                    }
                  }}
                  style={{ width: 20, height: 20, accentColor: "#60a5fa" }}
                />
              </label>

              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55, fontSize: 13 }}>
                {ui.passwordHint}
                {passwordWasProtected && passwordProtected ? ` ${extraUi.keepPassword}` : ""}
              </p>

              {passwordProtected ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={labelStyle}>
                    {passwordWasProtected ? ui.password.replace(" *", "") : ui.password}
                    <input
                      type="password"
                      value={qrxPassword}
                      onChange={(event) => setQrxPassword(event.target.value)}
                      style={inputStyle}
                      minLength={4}
                      required={!passwordWasProtected}
                      autoComplete="new-password"
                    />
                  </label>

                  <label style={labelStyle}>
                    {passwordWasProtected ? ui.repeatPassword : ui.repeatPassword}
                    <input
                      type="password"
                      value={qrxPasswordRepeat}
                      onChange={(event) => setQrxPasswordRepeat(event.target.value)}
                      style={inputStyle}
                      minLength={4}
                      required={!passwordWasProtected}
                      autoComplete="new-password"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            {isBusiness ? (
              <div style={verificationBoxStyle(isVerified, verificationRequest?.status)}>
                <div style={verificationHeaderStyle}>
                  <div>
                    <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>{ui.verificationLater}</h3>
                    <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                      {getVerificationStatusText({ isVerified, request: verificationRequest }, qrxLocale)}
                    </p>
                  </div>
                  <span style={verificationBadgeStyle(isVerified, verificationRequest?.status)}>
                    {isVerified ? statusUi.verified : getVerificationStatusLabel(verificationRequest?.status, qrxLocale)}
                  </span>
                </div>

                <div style={verificationInfoStyle}>
                  <strong>{ui.cost}: {QRX_VERIFICATION_COST_CREDITS} Credits</strong>
                  <span>{ui.currentCreditsShort}: {credits == null ? "…" : credits}</span>
                </div>

                {verificationRequest ? (
                  <div style={requestSummaryStyle}>
                    <strong>{ui.lastRequest}</strong>
                    <span>{statusUi.status}: {getVerificationStatusLabel(verificationRequest.status, qrxLocale)}</span>
                    {verificationRequest.document_filename ? <span>Dokument: {verificationRequest.document_filename}</span> : null}
                    {verificationRequest.credits_charged ? <span>{extraUi.charged}: {verificationRequest.credits_charged} Credits</span> : null}
                  </div>
                ) : null}

                {!isVerified && verificationRequest?.status !== "pending" ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.55, fontSize: 13, fontWeight: 800 }}>
                      {extraUi.evidenceExamples}
                    </p>

                    <label style={fileButtonStyle}>
                      {ui.chooseEvidence}
                      <input
                        type="file"
                        accept="image/*,application/pdf,.pdf"
                        onChange={handleVerificationFileChange}
                        style={{ display: "none" }}
                      />
                    </label>

                    {verificationDocument ? (
                      <div style={selectedDocumentStyle}>
                        <div>
                          <strong>{verificationDocument.name}</strong>
                          <span>{verificationDocument.type || ui.file} · {formatBytes(verificationDocument.size)}</span>
                        </div>
                        <button type="button" onClick={() => setVerificationDocument(null)} style={miniDangerButtonStyle}>
                          {ui.remove}
                        </button>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleSubmitVerificationRequest}
                      disabled={!canSubmitVerification || !verificationDocument}
                      className={styles.primaryButton}
                      style={{
                        border: 0,
                        justifySelf: "start",
                        cursor: !canSubmitVerification || !verificationDocument ? "not-allowed" : "pointer",
                        opacity: !canSubmitVerification || !verificationDocument ? 0.7 : 1,
                      }}
                    >
                      {verificationSaving ? ui.submitting : ui.requestVerification}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}


            <div style={dividerStyle} />

            <div style={inlineMediaSectionStyle}>

          <div className={styles.cardHeader}>
            <div>
              <h2>{ui.media}</h2>
              <p>{ui.mediaManageHint}</p>
            </div>
            <span>
              {usedMb.toFixed(1).replace(".", ",")} MB / {storageLimitMb} MB
            </span>
          </div>

          <div style={storageBoxStyle}>
            <div style={storageProgressTrackStyle}>
              <div style={storageProgressBarStyle(usagePercent)} />
            </div>
            <div style={storageMetaStyle}>
              <span>{ui.availableStorage}: {freeMb.toFixed(1).replace(".", ",")} MB</span>
              <span>{ui.storageRuleShort}</span>
            </div>
            <p style={{ margin: "10px 0 0", color: "#94a3b8", fontSize: 13, lineHeight: 1.5, fontWeight: 750 }}>
              {ui.storagePermanent}
            </p>

            {hasPendingMedia ? (
              <div style={storagePreviewBoxStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{ui.afterSave}</strong>
                  <span>
                    {projectedMb.toFixed(1).replace(".", ",")} MB / {projectedStorageLimitMb} MB
                  </span>
                </div>

                <div style={storageProgressTrackStyle}>
                  <div style={storageProgressBarStyle(projectedUsagePercent)} />
                </div>

                <div style={storageMetaStyle}>
                  <span>{ui.newSelected}: {formatBytes(pendingBytes)}</span>
                  <span>
                    {ui.additionalCost}: {projectedAdditionalCredits > 0 ? `${projectedAdditionalCredits} Credit${projectedAdditionalCredits === 1 ? "" : "s"}` : "0 Credits"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div style={creditBuyBoxStyle(projectedAdditionalCredits > 0 && credits != null && credits < projectedAdditionalCredits)}>
            <div>
              <h3 style={sectionTitleStyle}>{ui.creditsAdditional}</h3>
              <p style={sectionHintStyle}>
                {ui.creditsAdditionalHint}
              </p>
            </div>

            <div style={creditSummaryGridStyle}>
              <div style={creditMetricStyle}>
                <span>{ui.currentCreditsShort}</span>
                <strong>{credits == null ? "…" : credits}</strong>
              </div>
              <div style={creditMetricStyle}>
                <span>{ui.additionalStorageCredits}</span>
                <strong>{projectedAdditionalCredits}</strong>
              </div>
              <div style={creditMetricStyle}>
                <span>{ui.missingCredits}</span>
                <strong>{credits == null ? "…" : Math.max(0, projectedAdditionalCredits - credits)}</strong>
              </div>
            </div>

            {projectedAdditionalCredits > 0 && credits != null && credits < projectedAdditionalCredits ? (
              <p style={{ margin: 0, color: "#fecaca", lineHeight: 1.55, fontWeight: 900 }}>
                {extraUi.missingStorage.replace("{{count}}", String(projectedAdditionalCredits - credits))}
              </p>
            ) : (
              <p style={{ margin: 0, color: projectedAdditionalCredits > 0 ? "#fde68a" : "#bbf7d0", lineHeight: 1.55, fontWeight: 850 }}>
                {projectedAdditionalCredits > 0
                  ? extraUi.expectedStorage.replace("{{count}}", String(projectedAdditionalCredits))
                  : ui.noAdditionalCredits}
              </p>
            )}

            <div style={creditActionRowStyle}>
              <Link href={`/${locale}/dashboard/credits`} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
                💳 {ui.buyCredits}
              </Link>
              <button
                type="button"
                onClick={async () => {
                  const user = await getCurrentUserOrThrow();
                  await loadCreditBalance(user.id);
                  setSuccessText(ui.creditsUpdated);
                }}
                style={refreshCreditsButtonStyle}
              >
                {ui.refreshCredits}
              </button>
            </div>
          </div>

          <div style={mediaGridStyle}>
            <div style={mediaUploadBoxStyle}>
              <h3 style={mediaTitleStyle}>{ui.logo}</h3>
              {logoUrl ? <img src={logoUrl} alt={ui.currentLogoAlt} style={logoPreviewStyle} /> : <p style={emptyTextStyle}>{ui.noLogo}</p>}
              {logoFile ? <p style={selectedFileTextStyle}>{ui.newSelected}: {logoFile.name} · {formatBytes(logoFile.size)}</p> : null}
              <div style={mediaActionRowStyle}>
                <label style={fileButtonStyle}>
                  {ui.chooseLogo}
                  <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
                </label>
                {logoFile ? <button type="button" onClick={() => setLogoFile(null)} style={miniDangerButtonStyle}>{ui.remove}</button> : null}
                {logoUrl ? <button type="button" onClick={handleClearLogo} style={miniDangerButtonStyle}>{ui.deleteLogo}</button> : null}
              </div>
            </div>

            <div style={mediaUploadBoxStyle}>
              <h3 style={mediaTitleStyle}>{ui.cover}</h3>
              {coverPreview ? (
                <div style={coverPreviewViewportStyle}>
                  <canvas ref={coverPreviewCanvasRef} aria-label={ui.coverPreviewAlt} style={coverPreviewCanvasStyle} />
                </div>
              ) : coverUrl ? (
                <img src={coverUrl} alt={ui.currentCoverAlt} style={coverPreviewStyle} />
              ) : (
                <p style={emptyTextStyle}>{ui.noCover}</p>
              )}
              {coverFile ? (
                <>
                  <p style={selectedFileTextStyle}>{ui.newSelected}: {coverFile.name} · {formatBytes(coverFile.size)}</p>
                  <div style={coverAdjustBoxStyle}>
                    <strong style={{ color: "#fff" }}>{ui.coverAdjustTitle}</strong>
                    <span style={coverAdjustHintStyle}>{ui.coverAdjustHint}</span>
                    <label style={coverRangeLabelStyle}>{ui.coverHorizontal}
                      <input type="range" min="0" max="100" value={coverPositionX} onChange={(e) => setCoverPositionX(Number(e.target.value))} style={coverRangeStyle} />
                    </label>
                    <label style={coverRangeLabelStyle}>{ui.coverVertical}
                      <input type="range" min="0" max="100" value={coverPositionY} onChange={(e) => setCoverPositionY(Number(e.target.value))} style={coverRangeStyle} />
                    </label>
                    <label style={coverRangeLabelStyle}>{ui.coverZoom}
                      <input type="range" min="100" max="200" value={coverZoom} onChange={(e) => setCoverZoom(Number(e.target.value))} style={coverRangeStyle} />
                      <span style={coverZoomValueStyle}>{coverZoom}%</span>
                    </label>
                    <button type="button" onClick={() => { setCoverPositionX(50); setCoverPositionY(50); setCoverZoom(100); }} style={coverResetButtonStyle}>{ui.coverCenter}</button>
                  </div>
                </>
              ) : null}
              <div style={mediaActionRowStyle}>
                <label style={fileButtonStyle}>
                  {ui.chooseCover}
                  <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: "none" }} />
                </label>
                {coverFile ? <button type="button" onClick={() => { setCoverFile(null); if (coverPreview) URL.revokeObjectURL(coverPreview); setCoverPreview(null); setCoverPositionX(50); setCoverPositionY(50); setCoverZoom(100); }} style={miniDangerButtonStyle}>{ui.removeSelection}</button> : null}
                {coverUrl ? <button type="button" onClick={handleClearCover} style={miniDangerButtonStyle}>{ui.deleteCover}</button> : null}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
            <div style={mediaUploadBoxStyle}>
              <h3 style={mediaTitleStyle}>{ui.gallery}</h3>
              <p style={emptyTextStyle}>{extraUi.multipleImages}</p>
              <label style={fileButtonStyle}>
                {ui.chooseGallery}
                <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} style={{ display: "none" }} />
              </label>

              {galleryFiles.length > 0 ? (
                <div style={pendingListStyle}>
                  {galleryFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} style={selectedDocumentStyle}>
                      <span>{file.name} · {formatBytes(file.size)}</span>
                      <button type="button" onClick={() => setGalleryFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={miniDangerButtonStyle}>{ui.remove}</button>
                    </div>
                  ))}
                </div>
              ) : null}

              {visibleImageMedia.length > 0 ? (
                <div style={mediaCardGridStyle}>
                  {visibleImageMedia.map((item) => (
                    <div key={item.id} style={mediaCardStyle}>
                      <img src={item.url} alt={item.filename} style={mediaImageStyle} />
                      <strong style={mediaFilenameStyle}>{item.filename}</strong>
                      <span style={mediaSubTextStyle}>{formatBytes(item.bytes)}</span>
                      <button type="button" onClick={() => handleDeleteMedia(item)} style={miniDangerButtonStyle}>{ui.delete}</button>
                    </div>
                  ))}
                </div>
              ) : <p style={emptyTextStyle}>{extraUi.noGallery}</p>}
            </div>

            <div style={mediaUploadBoxStyle}>
              <h3 style={mediaTitleStyle}>{ui.files}</h3>
              <p style={emptyTextStyle}>{extraUi.fileMediaHint}</p>
              <label style={fileButtonStyle}>
                {ui.chooseFiles}
                <input type="file" multiple onChange={handleFileUploadsChange} style={{ display: "none" }} />
              </label>

              {fileUploads.length > 0 ? (
                <div style={pendingListStyle}>
                  {fileUploads.map((file, index) => (
                    <div key={`${file.name}-${index}`} style={selectedDocumentStyle}>
                      <span>{file.name} · {formatBytes(file.size)}</span>
                      <button type="button" onClick={() => setFileUploads((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={miniDangerButtonStyle}>{ui.remove}</button>
                    </div>
                  ))}
                </div>
              ) : null}

              {visibleFileMedia.length > 0 ? (
                <div style={pendingListStyle}>
                  {visibleFileMedia.map((item) => (
                    <div key={item.id} style={selectedDocumentStyle}>
                      <a href={item.url} target="_blank" rel="noreferrer" style={{ color: "#bfdbfe", fontWeight: 950, textDecoration: "none" }}>
                        {item.filename}
                      </a>
                      <span>{formatBytes(item.bytes)}</span>
                      <button type="button" onClick={() => handleDeleteMedia(item)} style={miniDangerButtonStyle}>{ui.delete}</button>
                    </div>
                  ))}
                </div>
              ) : <p style={emptyTextStyle}>{extraUi.noFiles}</p>}
            </div>
          </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
              <Link href={`/${locale}/dashboard/qrx`} className={styles.secondaryButton}>
                {ui.cancel}
              </Link>

              <button type="submit" disabled={saving || verificationSaving || mediaSaving || (projectedAdditionalCredits > 0 && credits != null && credits < projectedAdditionalCredits)} className={styles.primaryButton} style={{ border: 0, cursor: saving || verificationSaving || mediaSaving || (projectedAdditionalCredits > 0 && credits != null && credits < projectedAdditionalCredits) ? "not-allowed" : "pointer", opacity: saving || verificationSaving || mediaSaving || (projectedAdditionalCredits > 0 && credits != null && credits < projectedAdditionalCredits) ? 0.72 : 1 }}>
                {saving ? ui.saving : projectedAdditionalCredits > 0 && credits != null && credits < projectedAdditionalCredits ? ui.notEnoughCredits : ui.save}
              </button>
            </div>
          </form>
        ) : null}
      </section>



    </main>
  );
}


const addNewsButtonStyle: CSSProperties = {
  minHeight: 48,
  borderRadius: 16,
  border: "1px solid rgba(250,204,21,0.34)",
  background: "linear-gradient(135deg, rgba(250,204,21,0.98), rgba(251,146,60,0.88))",
  color: "#111827",
  fontWeight: 950,
  cursor: "pointer",
  justifySelf: "start",
  padding: "0 18px",
};

function newsListViewportStyle(scrollable: boolean): CSSProperties {
  return {
    display: "grid",
    gap: 10,
    maxHeight: scrollable ? 430 : "none",
    overflowY: scrollable ? "auto" : "visible",
    paddingRight: scrollable ? 8 : 0,
    overscrollBehavior: "contain",
    scrollbarWidth: "thin",
  };
}

const newsItemCardStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(148,163,184,0.18)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

function creditBuyBoxStyle(warning: boolean): CSSProperties {
  return {
    borderRadius: 20,
    padding: 14,
    background: warning ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.045)",
    border: warning ? "1px solid rgba(252,165,165,0.22)" : "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 12,
    marginBottom: 18,
  };
}

const creditSummaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
};

const creditMetricStyle: CSSProperties = {
  borderRadius: 14,
  padding: 12,
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(148,163,184,0.18)",
  display: "grid",
  gap: 4,
  color: "#ffffff",
};

const creditActionRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
};

const refreshCreditsButtonStyle: CSSProperties = {
  minHeight: 44,
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "rgba(255,255,255,0.075)",
  color: "#ffffff",
  fontWeight: 950,
  cursor: "pointer",
  padding: "0 18px",
};

const inlineMediaSectionStyle: CSSProperties = {
  borderRadius: 24,
  padding: 16,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(148,163,184,0.14)",
  display: "grid",
  gap: 16,
};

function typeButtonStyle(active: boolean, type: QrxType): CSSProperties {
  return {
    minHeight: 74,
    borderRadius: 18,
    border: active
      ? type === "business"
        ? "1px solid #fed7aa"
        : "1px solid #bbf7d0"
      : "1px solid rgba(148, 163, 184, 0.22)",
    background: active
      ? type === "business"
        ? "rgba(251,146,60,0.16)"
        : "rgba(34,197,94,0.16)"
      : "rgba(255,255,255,0.06)",
    color: "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
  };
}

const panelStyle: CSSProperties = {
  width: "100%",
  maxWidth: "none",
  margin: "0 auto",
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 52,
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.22)",
  background: "rgba(255,255,255,0.07)",
  color: "#ffffff",
  padding: "0 14px",
  fontSize: 15,
  fontWeight: 800,
  outline: "none",
  boxSizing: "border-box",
};

const categoryOptionStyle: CSSProperties = {
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 800,
};

const selectStyle: CSSProperties = {
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
  colorScheme: "dark",
  background:
    "rgba(255,255,255,0.07) linear-gradient(45deg, transparent 50%, #cbd5e1 50%), linear-gradient(135deg, #cbd5e1 50%, transparent 50%)",
  backgroundPosition: "calc(100% - 20px) 22px, calc(100% - 14px) 22px",
  backgroundSize: "6px 6px, 6px 6px",
  backgroundRepeat: "no-repeat",
  paddingRight: 42,
};


const sectionBoxStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 12,
};

const sectionTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 950,
};

const sectionHintStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  lineHeight: 1.55,
  fontSize: 13,
  fontWeight: 750,
};

const categoryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

function businessCategoryButtonStyle(active: boolean): CSSProperties {
  return {
    minHeight: 58,
    borderRadius: 16,
    border: active ? "1px solid #facc15" : "1px solid rgba(148, 163, 184, 0.22)",
    background: active
      ? "linear-gradient(135deg, rgba(250,204,21,0.98), rgba(251,146,60,0.88))"
      : "rgba(255,255,255,0.055)",
    color: active ? "#111827" : "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "0 12px",
  };
}

const locationModeGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 10,
};

function locationModeButtonStyle(active: boolean): CSSProperties {
  return {
    minHeight: 54,
    borderRadius: 16,
    border: active ? "1px solid #93c5fd" : "1px solid rgba(148, 163, 184, 0.22)",
    background: active ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.055)",
    color: "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
  };
}

const dividerStyle: CSSProperties = {
  height: 1,
  background: "rgba(255,255,255,0.09)",
  margin: "4px 0",
};

const loadingStyle: CSSProperties = {
  minHeight: 160,
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  fontWeight: 950,
};

const errorStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  marginBottom: 16,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const successStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  marginBottom: 16,
  background: "rgba(34, 197, 94, 0.14)",
  border: "1px solid rgba(134, 239, 172, 0.22)",
  color: "#bbf7d0",
  fontWeight: 850,
  lineHeight: 1.55,
};

function passwordBoxStyle(active: boolean): CSSProperties {
  return {
    borderRadius: 22,
    padding: 16,
    background: active ? "rgba(59,130,246,0.14)" : "rgba(255,255,255,0.045)",
    border: active ? "1px solid rgba(147,197,253,0.28)" : "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 12,
  };
}

const passwordToggleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  color: "#ffffff",
  fontWeight: 950,
  cursor: "pointer",
};

function verificationBoxStyle(isVerified: boolean, status: VerificationStatus | null | undefined): CSSProperties {
  const active = isVerified || status === "pending";
  return {
    borderRadius: 22,
    padding: 16,
    background: isVerified ? "rgba(34,197,94,0.14)" : active ? "rgba(250,204,21,0.12)" : "rgba(255,255,255,0.045)",
    border: isVerified ? "1px solid rgba(134,239,172,0.28)" : active ? "1px solid rgba(253,224,71,0.24)" : "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 14,
  };
}

const verificationHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 14,
  flexWrap: "wrap",
};

function verificationBadgeStyle(isVerified: boolean, status: VerificationStatus | null | undefined): CSSProperties {
  return {
    borderRadius: 999,
    padding: "8px 12px",
    background: isVerified ? "rgba(34,197,94,0.2)" : status === "pending" ? "rgba(250,204,21,0.18)" : "rgba(148,163,184,0.14)",
    border: isVerified ? "1px solid rgba(134,239,172,0.34)" : status === "pending" ? "1px solid rgba(253,224,71,0.32)" : "1px solid rgba(148,163,184,0.22)",
    color: isVerified ? "#bbf7d0" : status === "pending" ? "#fef08a" : "#cbd5e1",
    fontSize: 12,
    fontWeight: 950,
  };
}

const verificationInfoStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(148,163,184,0.14)",
  color: "#dbeafe",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  fontSize: 13,
  fontWeight: 850,
};

const requestSummaryStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
  display: "grid",
  gap: 5,
  fontSize: 13,
  fontWeight: 800,
};

const fileButtonStyle: CSSProperties = {
  minHeight: 48,
  borderRadius: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 18px",
  background: "rgba(255,255,255,0.075)",
  border: "1px solid rgba(148,163,184,0.22)",
  color: "#ffffff",
  fontWeight: 950,
  cursor: "pointer",
  justifySelf: "start",
};

const selectedDocumentStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#bfdbfe",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  fontSize: 13,
  fontWeight: 850,
};

const miniDangerButtonStyle: CSSProperties = {
  minHeight: 34,
  borderRadius: 12,
  border: "1px solid rgba(252,165,165,0.22)",
  background: "rgba(239,68,68,0.14)",
  color: "#fecaca",
  fontWeight: 950,
  cursor: "pointer",
  padding: "0 12px",
};


const storagePreviewBoxStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#dbeafe",
  display: "grid",
  gap: 10,
  fontSize: 13,
  fontWeight: 850,
};

const storageBoxStyle: CSSProperties = {
  borderRadius: 20,
  padding: 14,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  marginBottom: 18,
};

const storageProgressTrackStyle: CSSProperties = {
  height: 12,
  borderRadius: 999,
  overflow: "hidden",
  background: "rgba(255,255,255,0.08)",
};

function storageProgressBarStyle(percent: number): CSSProperties {
  return {
    width: `${percent}%`,
    height: "100%",
    background: percent > 90 ? "#ef4444" : percent > 75 ? "#f59e0b" : "#22c55e",
    transition: "width .2s ease",
  };
}

const storageMetaStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 12,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 900,
};

const mediaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const mediaUploadBoxStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 12,
};

const mediaTitleStyle: CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 950,
};

const emptyTextStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
  lineHeight: 1.55,
  fontWeight: 750,
};

const selectedFileTextStyle: CSSProperties = {
  margin: 0,
  color: "#bfdbfe",
  fontSize: 13,
  lineHeight: 1.55,
  fontWeight: 850,
};

const mediaActionRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};

const logoPreviewStyle: CSSProperties = {
  width: 96,
  height: 96,
  objectFit: "cover",
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(15,23,42,0.55)",
};

const coverPreviewViewportStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  overflow: "hidden",
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(15,23,42,0.55)",
};

const coverPreviewCanvasStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "block",
};

const coverPreviewStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  borderRadius: 0,
  border: 0,
  background: "transparent",
  transition: "transform 120ms ease-out",
};

const coverAdjustBoxStyle: CSSProperties = { display: "grid", gap: 8, padding: 12, borderRadius: 14, background: "rgba(15,23,42,0.55)", border: "1px solid rgba(148,163,184,0.18)" };
const coverAdjustHintStyle: CSSProperties = { color: "#94a3b8", fontSize: 12, lineHeight: 1.45 };
const coverRangeLabelStyle: CSSProperties = { display: "grid", gridTemplateColumns: "80px 1fr", gap: 8, alignItems: "center", color: "#cbd5e1", fontSize: 12, fontWeight: 800 };
const coverRangeStyle: CSSProperties = { width: "100%", cursor: "pointer", accentColor: "#6366f1" };
const coverZoomValueStyle: CSSProperties = { justifySelf: "end", color: "#94a3b8", fontSize: 12, fontWeight: 800 };
const coverResetButtonStyle: CSSProperties = { justifySelf: "start", border: "1px solid rgba(148,163,184,0.25)", background: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 10, padding: "6px 9px", cursor: "pointer", fontWeight: 800 };

const pendingListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const mediaCardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
};

const mediaCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 10,
  background: "rgba(15,23,42,0.42)",
  border: "1px solid rgba(148,163,184,0.14)",
  display: "grid",
  gap: 8,
};

const mediaImageStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
};

const mediaFilenameStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 900,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const mediaSubTextStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 800,
};
