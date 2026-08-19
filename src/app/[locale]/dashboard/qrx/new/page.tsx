"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import CollectionSelector, { type QrxCollectionCandidate } from "@/components/qrx/CollectionSelector";
import { supabase } from "@/lib/supabase";
import styles from "../../dashboard.module.css";


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

const QR_CREATE_RUNTIME = {
  de: {
    confirmSpend: "Bitte bestätige den Credit-Verbrauch, bevor der QR-X erstellt wird.",
    createCost: "QR-X-Erstellung: {{count}} Credits",
    storageCost: "Zusätzlicher Speicher: ca. {{count}} Credits",
    verifyCost: "Verifizierung: {{count}} Credits",
    storageEstimate: "Der Speicheranteil ist eine Schätzung anhand der aktuell ausgewählten Dateien. Die endgültige Speicherabrechnung erfolgt serverseitig anhand der tatsächlich verarbeiteten Daten.",
    estimatedTotal: "Voraussichtliche Gesamtkosten: {{count}} Credits",
    balance: "Aktuelles Guthaben: {{count}} Credits",
    confirmPaid: "Mit „OK“ bestätigst du den kostenpflichtigen Vorgang.",
    created: "QR-X wurde erstellt.",
    createdProtected: "QR-X wurde erstellt und mit Passwort geschützt.",
    creditsDeducted: "{{count}} Credits wurden abgezogen.",
    firstFree: "Der erste normale QR-X ist kostenlos.",
    storageCharged: "Für zusätzlichen Speicher wurden {{count}} Credit(s) abgezogen.",
    verifyRequested: "Der Verifizierungsantrag wurde eingereicht.",
    notEnough: "Nicht genug Credits. Benötigt: {{need}}, vorhanden: {{have}}. Bitte kaufe zuerst Credits.",
  },
  en: {
    confirmSpend: "Please confirm the Credit charge before the QR-X is created.",
    createCost: "QR-X creation: {{count}} Credits",
    storageCost: "Additional storage: approx. {{count}} Credits",
    verifyCost: "Verification: {{count}} Credits",
    storageEstimate: "The storage portion is an estimate based on the currently selected files. Final storage billing is calculated server-side from the actually processed data.",
    estimatedTotal: "Estimated total cost: {{count}} Credits",
    balance: "Current balance: {{count}} Credits",
    confirmPaid: "Press “OK” to confirm the paid action.",
    created: "QR-X was created.",
    createdProtected: "QR-X was created and password protected.",
    creditsDeducted: "{{count}} Credits were charged.",
    firstFree: "The first normal QR-X is free.",
    storageCharged: "{{count}} Credit(s) were charged for additional storage.",
    verifyRequested: "The verification request was submitted.",
    notEnough: "Not enough Credits. Required: {{need}}, available: {{have}}. Please buy Credits first.",
  },
  tr: {
    confirmSpend: "QR-X oluşturulmadan önce Credit kullanımını onayla.",
    createCost: "QR-X oluşturma: {{count}} Credits",
    storageCost: "Ek depolama: yaklaşık {{count}} Credits",
    verifyCost: "Doğrulama: {{count}} Credits",
    storageEstimate: "Depolama kısmı seçilen dosyalara göre tahmindir. Nihai depolama ücreti işlenen gerçek verilere göre sunucuda hesaplanır.",
    estimatedTotal: "Tahmini toplam maliyet: {{count}} Credits",
    balance: "Mevcut bakiye: {{count}} Credits",
    confirmPaid: "Ücretli işlemi onaylamak için “OK” seç.",
    created: "QR-X oluşturuldu.",
    createdProtected: "QR-X oluşturuldu ve şifreyle korundu.",
    creditsDeducted: "{{count}} Credits düşüldü.",
    firstFree: "İlk normal QR-X ücretsizdir.",
    storageCharged: "Ek depolama için {{count}} Credit düşüldü.",
    verifyRequested: "Doğrulama isteği gönderildi.",
    notEnough: "Yeterli Credit yok. Gerekli: {{need}}, mevcut: {{have}}. Önce Credits satın al.",
  },
  pl: {
    confirmSpend: "Potwierdź wykorzystanie Credits przed utworzeniem QR-X.",
    createCost: "Utworzenie QR-X: {{count}} Credits",
    storageCost: "Dodatkowa pamięć: ok. {{count}} Credits",
    verifyCost: "Weryfikacja: {{count}} Credits",
    storageEstimate: "Koszt pamięci jest szacunkiem na podstawie wybranych plików. Ostateczne naliczenie odbywa się na serwerze na podstawie faktycznie przetworzonych danych.",
    estimatedTotal: "Szacowany koszt całkowity: {{count}} Credits",
    balance: "Aktualne saldo: {{count}} Credits",
    confirmPaid: "Klikając „OK”, potwierdzasz płatną operację.",
    created: "QR-X został utworzony.",
    createdProtected: "QR-X został utworzony i zabezpieczony hasłem.",
    creditsDeducted: "Pobrano {{count}} Credits.",
    firstFree: "Pierwszy zwykły QR-X jest bezpłatny.",
    storageCharged: "Za dodatkową pamięć pobrano {{count}} Credit(s).",
    verifyRequested: "Wniosek o weryfikację został wysłany.",
    notEnough: "Za mało Credits. Wymagane: {{need}}, dostępne: {{have}}. Najpierw kup Credits.",
  },
  ar: {
    confirmSpend: "يرجى تأكيد استخدام Credits قبل إنشاء QR-X.",
    createCost: "إنشاء QR-X: {{count}} Credits",
    storageCost: "تخزين إضافي: حوالي {{count}} Credits",
    verifyCost: "التوثيق: {{count}} Credits",
    storageEstimate: "جزء التخزين تقديري بناءً على الملفات المحددة حاليًا. تتم الفوترة النهائية على الخادم وفق البيانات المعالجة فعليًا.",
    estimatedTotal: "إجمالي التكلفة التقديرية: {{count}} Credits",
    balance: "الرصيد الحالي: {{count}} Credits",
    confirmPaid: "باختيار «موافق» تؤكد العملية المدفوعة.",
    created: "تم إنشاء QR-X.",
    createdProtected: "تم إنشاء QR-X وحمايته بكلمة مرور.",
    creditsDeducted: "تم خصم {{count}} Credits.",
    firstFree: "أول QR-X عادي مجاني.",
    storageCharged: "تم خصم {{count}} Credit للتخزين الإضافي.",
    verifyRequested: "تم إرسال طلب التوثيق.",
    notEnough: "Credits غير كافية. المطلوب: {{need}}، المتوفر: {{have}}. اشترِ Credits أولًا.",
  },
  fr: {
    confirmSpend: "Confirmez l’utilisation des Credits avant la création du QR-X.",
    createCost: "Création QR-X : {{count}} Credits",
    storageCost: "Stockage supplémentaire : env. {{count}} Credits",
    verifyCost: "Vérification : {{count}} Credits",
    storageEstimate: "La part de stockage est une estimation basée sur les fichiers sélectionnés. La facturation finale est calculée côté serveur à partir des données réellement traitées.",
    estimatedTotal: "Coût total estimé : {{count}} Credits",
    balance: "Solde actuel : {{count}} Credits",
    confirmPaid: "Avec « OK », vous confirmez l’opération payante.",
    created: "QR-X créé.",
    createdProtected: "QR-X créé et protégé par mot de passe.",
    creditsDeducted: "{{count}} Credits ont été débités.",
    firstFree: "Le premier QR-X normal est gratuit.",
    storageCharged: "{{count}} Credit(s) ont été débités pour le stockage supplémentaire.",
    verifyRequested: "La demande de vérification a été envoyée.",
    notEnough: "Credits insuffisants. Requis : {{need}}, disponibles : {{have}}. Achetez d’abord des Credits.",
  },
  es: {
    confirmSpend: "Confirma el uso de Credits antes de crear el QR-X.",
    createCost: "Creación de QR-X: {{count}} Credits",
    storageCost: "Almacenamiento adicional: aprox. {{count}} Credits",
    verifyCost: "Verificación: {{count}} Credits",
    storageEstimate: "La parte de almacenamiento es una estimación basada en los archivos seleccionados. La facturación final se calcula en el servidor con los datos realmente procesados.",
    estimatedTotal: "Coste total estimado: {{count}} Credits",
    balance: "Saldo actual: {{count}} Credits",
    confirmPaid: "Con «OK» confirmas la operación de pago.",
    created: "QR-X creado.",
    createdProtected: "QR-X creado y protegido con contraseña.",
    creditsDeducted: "Se descontaron {{count}} Credits.",
    firstFree: "El primer QR-X normal es gratuito.",
    storageCharged: "Se descontaron {{count}} Credit(s) por almacenamiento adicional.",
    verifyRequested: "Se envió la solicitud de verificación.",
    notEnough: "Credits insuficientes. Necesarios: {{need}}, disponibles: {{have}}. Compra Credits primero.",
  },
  it: {
    confirmSpend: "Conferma l’uso dei Credits prima di creare il QR-X.",
    createCost: "Creazione QR-X: {{count}} Credits",
    storageCost: "Spazio aggiuntivo: circa {{count}} Credits",
    verifyCost: "Verifica: {{count}} Credits",
    storageEstimate: "La quota di spazio è una stima basata sui file selezionati. La fatturazione finale viene calcolata lato server sui dati realmente elaborati.",
    estimatedTotal: "Costo totale stimato: {{count}} Credits",
    balance: "Saldo attuale: {{count}} Credits",
    confirmPaid: "Con “OK” confermi l’operazione a pagamento.",
    created: "QR-X creato.",
    createdProtected: "QR-X creato e protetto con password.",
    creditsDeducted: "Sono stati addebitati {{count}} Credits.",
    firstFree: "Il primo QR-X normale è gratuito.",
    storageCharged: "Sono stati addebitati {{count}} Credit(s) per spazio aggiuntivo.",
    verifyRequested: "La richiesta di verifica è stata inviata.",
    notEnough: "Credits insufficienti. Necessari: {{need}}, disponibili: {{have}}. Acquista prima Credits.",
  },
} as const;

type QrxType = "normal" | "business";

type LocationMode = "none" | "current" | "manual";

type NewsItem = { text: string; createdAt: string };

type SavedCollectionEntry = Omit<
  QrxCollectionCandidate,
  "source" | "custom_title"
> & {
  deleted_at?: string | null;
  suspended?: boolean | null;
};

type SavedCollectionCandidateRow = {
  qrx_id: string | null;
  custom_title?: string | null;
  qr_x_entries: SavedCollectionEntry | SavedCollectionEntry[] | null;
};

const MAX_VISIBLE_NEWS = 5;

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

const BUSINESS_CATEGORY_OPTIONS: Array<{
  value: BusinessCategory;
  label: string;
  icon: string;
}> = [
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

const QRX_VERIFICATION_BUCKET = "qrx-verification-documents";
const QRX_VERIFICATION_COST_CREDITS = 10;
const FREE_STORAGE_MB = 2;
const STORAGE_PACK_MB = 5;

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
    id?: string | null;
    url?: string | null;
  } | null;
};

type SelectedMediaFile = {
  id: string;
  file: File;
  previewUrl: string | null;
};

type SelectedVerificationDocument = {
  id: string;
  file: File;
  previewUrl: string | null;
  documentType: "image" | "pdf";
};

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
  return fromType && fromType.trim() ? fromType : "jpg";
}

function buildUploadFilename(
  prefix: "logo" | "cover" | "gallery" | "file",
  file: File,
) {
  const ext = getFileExtension(file).replace(/[^a-z0-9]/gi, "") || "bin";
  return `${prefix}-${Date.now().toString()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;
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

function formatMb(value: number) {
  return `${value.toFixed(1).replace(".", ",")} MB`;
}

function isImageMime(file: File) {
  return file.type.startsWith("image/");
}

function buildSelectedMediaFile(file: File): SelectedMediaFile {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

  return {
    id: `${Date.now().toString()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${safeName}`,
    file,
    previewUrl: isImageMime(file) ? URL.createObjectURL(file) : null,
  };
}

function revokeSelectedMediaPreview(item: SelectedMediaFile) {
  if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
}

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function buildSelectedVerificationDocument(
  file: File,
): SelectedVerificationDocument {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

  return {
    id: `${Date.now().toString()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${safeName}`,
    file,
    previewUrl: isImageMime(file) ? URL.createObjectURL(file) : null,
    documentType: isPdfFile(file) ? "pdf" : "image",
  };
}

function revokeVerificationDocumentPreview(
  item: SelectedVerificationDocument | null,
) {
  if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
}

function sanitizeFilename(value: string) {
  return (
    value
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `verification-${Date.now().toString()}`
  );
}

function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim())
    return value[0];
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

type ErrorLike = {
  message?: unknown;
  error_description?: unknown;
  details?: unknown;
  hint?: unknown;
};

function normalizeErrorMessage(error: unknown) {
  const errorLike = error as ErrorLike;

  return String(
    errorLike.message ??
      errorLike.error_description ??
      errorLike.details ??
      errorLike.hint ??
      error ??
      "Unbekannter Fehler",
  );
}

function isMissingColumnError(error: unknown, columnName: string) {
  return normalizeErrorMessage(error)
    .toLowerCase()
    .includes(columnName.toLowerCase());
}

type NewQrxDraft = {
  savedAt: string;
  qrxType: QrxType;
  title: string;
  companyName: string;
  category: BusinessCategory;
  description: string;
  newsDraft: string;
  newsItems: NewsItem[];
  locationMode: LocationMode;
  locationName: string;
  locationLat: string;
  locationLng: string;
  ctaPhone: string;
  ctaWebsite: string;
  ctaEmail: string;
  ctaNavigation: string;
  passwordProtected: boolean;
  wantsVerification: boolean;
  collectionTitle: string;
  collectionDescription: string;
  collectionQrxIds: string[];
};

const NEW_QRX_DRAFT_STORAGE_PREFIX = "mioseg.qrx.new.draft.v1";

function getNewQrxDraftStorageKey(locale: string) {
  return `${NEW_QRX_DRAFT_STORAGE_PREFIX}.${locale || "de"}`;
}

function isSafeBusinessCategory(value: unknown): value is BusinessCategory {
  return BUSINESS_CATEGORY_OPTIONS.some((item) => item.value === value);
}

function isSafeLocationMode(value: unknown): value is LocationMode {
  return value === "none" || value === "current" || value === "manual";
}

function isSafeQrxType(value: unknown): value is QrxType {
  return value === "normal" || value === "business";
}

function normalizeDraftNewsItems(value: unknown): NewsItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item) => typeof item?.text === "string" && item.text.trim().length > 0,
    )
    .map((item) => ({
      text: item.text.trim(),
      createdAt:
        typeof item.createdAt === "string" && item.createdAt.trim().length > 0
          ? item.createdAt
          : new Date().toISOString(),
    }));
}

export default function NewQrxPage() {
  const router = useRouter();
  const params = useParams();

  const locale = getParam(
    params?.locale as string | string[] | undefined,
    "de",
  );
  const qrxLocale = normalizeQrxLocale(locale);
  const ui = QR_FORM_TEXT[qrxLocale];
  const runtimeUi = QR_CREATE_RUNTIME[qrxLocale];

  const [qrxType, setQrxType] = useState<QrxType>("normal");
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState<BusinessCategory>("unternehmen");
  const [description, setDescription] = useState("");
  const [newsDraft, setNewsDraft] = useState("");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [locationMode, setLocationMode] = useState<LocationMode>("none");
  const [locationName, setLocationName] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [ctaPhone, setCtaPhone] = useState("");
  const [ctaWebsite, setCtaWebsite] = useState("");
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaNavigation, setCtaNavigation] = useState("");
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [qrxPassword, setQrxPassword] = useState("");
  const [qrxPasswordRepeat, setQrxPasswordRepeat] = useState("");
  const [wantsVerification, setWantsVerification] = useState(false);
  const [verificationDocument, setVerificationDocument] =
    useState<SelectedVerificationDocument | null>(null);

  const [collectionCandidates, setCollectionCandidates] = useState<QrxCollectionCandidate[]>([]);
  const [selectedCollectionQrxIds, setSelectedCollectionQrxIds] = useState<string[]>([]);
  const [collectionTitle, setCollectionTitle] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionLoading, setCollectionLoading] = useState(true);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverPositionX, setCoverPositionX] = useState(50);
  const [coverPositionY, setCoverPositionY] = useState(50);
  const [coverZoom, setCoverZoom] = useState(100);
  const [galleryFiles, setGalleryFiles] = useState<SelectedMediaFile[]>([]);
  const [fileUploads, setFileUploads] = useState<SelectedMediaFile[]>([]);
  const logoPreviewRef = useRef<string | null>(null);
  const coverPreviewRef = useRef<string | null>(null);
  const galleryFilesRef = useRef<SelectedMediaFile[]>([]);
  const fileUploadsRef = useRef<SelectedMediaFile[]>([]);
  const verificationDocumentRef = useRef<SelectedVerificationDocument | null>(
    null,
  );

  const [saving, setSaving] = useState(false);
  const [costConfirmed, setCostConfirmed] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const draftHydratedRef = useRef(false);
  const draftSaveTimerRef = useRef<number | null>(null);
  const draftStorageKey = useMemo(
    () => getNewQrxDraftStorageKey(locale),
    [locale],
  );

  const [credits, setCredits] = useState<number | null>(null);
  const [normalQrxCount, setNormalQrxCount] = useState<number | null>(null);
  const [businessQrxCount, setBusinessQrxCount] = useState<number | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);

  const creationCostCredits = useMemo(() => {
    if (qrxType === "business") {
      if (businessQrxCount == null) return null;
      return businessQrxCount === 0 ? 2 : 7;
    }

    if (normalQrxCount == null) return null;
    return normalQrxCount === 0 ? 0 : 5;
  }, [qrxType, normalQrxCount, businessQrxCount]);

  const verificationCredits = useMemo(() => {
    return qrxType === "business" && wantsVerification
      ? QRX_VERIFICATION_COST_CREDITS
      : 0;
  }, [qrxType, wantsVerification]);

  const selectedStorageBytes = useMemo(() => {
    const logoBytes = logoFile?.size ?? 0;
    const coverBytes = coverFile?.size ?? 0;
    const galleryBytes = galleryFiles.reduce(
      (sum, item) => sum + item.file.size,
      0,
    );
    const fileBytes = fileUploads.reduce(
      (sum, item) => sum + item.file.size,
      0,
    );
    return logoBytes + coverBytes + galleryBytes + fileBytes;
  }, [logoFile, coverFile, galleryFiles, fileUploads]);

  const selectedStorageMb = useMemo(() => {
    return selectedStorageBytes / (1024 * 1024);
  }, [selectedStorageBytes]);

  const estimatedStorageCredits = useMemo(() => {
    const extraMb = Math.max(0, selectedStorageMb - FREE_STORAGE_MB);
    return Math.ceil(extraMb / STORAGE_PACK_MB);
  }, [selectedStorageMb]);

  const estimatedStorageLimitMb = useMemo(() => {
    return FREE_STORAGE_MB + estimatedStorageCredits * STORAGE_PACK_MB;
  }, [estimatedStorageCredits]);

  const totalCostCredits = useMemo(() => {
    if (creationCostCredits == null) return null;
    return creationCostCredits + verificationCredits + estimatedStorageCredits;
  }, [creationCostCredits, verificationCredits, estimatedStorageCredits]);

  const hasEnoughCredits =
    totalCostCredits != null && credits != null
      ? credits >= totalCostCredits
      : false;

  useEffect(() => {
    setCostConfirmed(false);
  }, [
    qrxType,
    wantsVerification,
    creationCostCredits,
    estimatedStorageCredits,
    logoFile,
    coverFile,
    galleryFiles,
    fileUploads,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawDraft = window.localStorage.getItem(draftStorageKey);

      if (!rawDraft) {
        draftHydratedRef.current = true;
        return;
      }

      const draft = JSON.parse(rawDraft) as Partial<NewQrxDraft>;

      if (isSafeQrxType(draft.qrxType)) setQrxType(draft.qrxType);
      if (typeof draft.title === "string") setTitle(draft.title);
      if (typeof draft.companyName === "string")
        setCompanyName(draft.companyName);
      if (isSafeBusinessCategory(draft.category)) setCategory(draft.category);
      if (typeof draft.description === "string")
        setDescription(draft.description);
      if (typeof draft.newsDraft === "string") setNewsDraft(draft.newsDraft);
      setNewsItems(normalizeDraftNewsItems(draft.newsItems));
      if (isSafeLocationMode(draft.locationMode))
        setLocationMode(draft.locationMode);
      if (typeof draft.locationName === "string")
        setLocationName(draft.locationName);
      if (typeof draft.locationLat === "string")
        setLocationLat(draft.locationLat);
      if (typeof draft.locationLng === "string")
        setLocationLng(draft.locationLng);
      if (typeof draft.ctaPhone === "string") setCtaPhone(draft.ctaPhone);
      if (typeof draft.ctaWebsite === "string") setCtaWebsite(draft.ctaWebsite);
      if (typeof draft.ctaEmail === "string") setCtaEmail(draft.ctaEmail);
      if (typeof draft.ctaNavigation === "string")
        setCtaNavigation(draft.ctaNavigation);
      if (typeof draft.passwordProtected === "boolean")
        setPasswordProtected(draft.passwordProtected);
      if (typeof draft.wantsVerification === "boolean")
        setWantsVerification(draft.wantsVerification);
      if (typeof draft.collectionTitle === "string")
        setCollectionTitle(draft.collectionTitle);
      if (typeof draft.collectionDescription === "string")
        setCollectionDescription(draft.collectionDescription);
      if (Array.isArray(draft.collectionQrxIds)) {
        setSelectedCollectionQrxIds(
          draft.collectionQrxIds.filter((value): value is string => typeof value === "string" && value.trim().length > 0),
        );
      }

      setQrxPassword("");
      setQrxPasswordRepeat("");
      setDraftNotice(
        ui.draftRestored,
      );
    } catch (restoreError) {
      console.warn(
        "QR-X Entwurf konnte nicht wiederhergestellt werden:",
        restoreError,
      );
      try {
        window.localStorage.removeItem(draftStorageKey);
      } catch {
        // ignore
      }
    } finally {
      draftHydratedRef.current = true;
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !draftHydratedRef.current) return;

    if (draftSaveTimerRef.current) {
      window.clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = window.setTimeout(() => {
      const draft: NewQrxDraft = {
        savedAt: new Date().toISOString(),
        qrxType,
        title,
        companyName,
        category,
        description,
        newsDraft,
        newsItems,
        locationMode,
        locationName,
        locationLat,
        locationLng,
        ctaPhone,
        ctaWebsite,
        ctaEmail,
        ctaNavigation,
        passwordProtected,
        wantsVerification,
        collectionTitle,
        collectionDescription,
        collectionQrxIds: selectedCollectionQrxIds,
      };

      try {
        const hasTextDraft =
          title.trim().length > 0 ||
          companyName.trim().length > 0 ||
          description.trim().length > 0 ||
          newsDraft.trim().length > 0 ||
          newsItems.length > 0 ||
          locationName.trim().length > 0 ||
          locationLat.trim().length > 0 ||
          locationLng.trim().length > 0 ||
          ctaPhone.trim().length > 0 ||
          ctaWebsite.trim().length > 0 ||
          ctaEmail.trim().length > 0 ||
          ctaNavigation.trim().length > 0 ||
          qrxType !== "normal" ||
          passwordProtected ||
          wantsVerification ||
          collectionTitle.trim().length > 0 ||
          collectionDescription.trim().length > 0 ||
          selectedCollectionQrxIds.length > 0;

        if (hasTextDraft) {
          window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
        } else {
          window.localStorage.removeItem(draftStorageKey);
        }
      } catch (saveError) {
        console.warn(
          "QR-X Entwurf konnte nicht gespeichert werden:",
          saveError,
        );
      }
    }, 350);

    return () => {
      if (draftSaveTimerRef.current) {
        window.clearTimeout(draftSaveTimerRef.current);
      }
    };
  }, [
    draftStorageKey,
    qrxType,
    title,
    companyName,
    category,
    description,
    newsDraft,
    newsItems,
    locationMode,
    locationName,
    locationLat,
    locationLng,
    ctaPhone,
    ctaWebsite,
    ctaEmail,
    ctaNavigation,
    passwordProtected,
    wantsVerification,
    collectionTitle,
    collectionDescription,
    selectedCollectionQrxIds,
  ]);

  useEffect(() => {
    void loadCreditAndPricingData();
    void loadCollectionCandidates();
  }, []);

  useEffect(() => {
    logoPreviewRef.current = logoPreview;
  }, [logoPreview]);

  useEffect(() => {
    coverPreviewRef.current = coverPreview;
  }, [coverPreview]);

  useEffect(() => {
    galleryFilesRef.current = galleryFiles;
  }, [galleryFiles]);

  useEffect(() => {
    fileUploadsRef.current = fileUploads;
  }, [fileUploads]);

  useEffect(() => {
    verificationDocumentRef.current = verificationDocument;
  }, [verificationDocument]);

  useEffect(() => {
    if (qrxType !== "business") {
      setWantsVerification(false);
      setVerificationDocument((current) => {
        revokeVerificationDocumentPreview(current);
        return null;
      });
    }
  }, [qrxType]);

  useEffect(() => {
    return () => {
      if (logoPreviewRef.current) URL.revokeObjectURL(logoPreviewRef.current);
      if (coverPreviewRef.current) URL.revokeObjectURL(coverPreviewRef.current);
      galleryFilesRef.current.forEach(revokeSelectedMediaPreview);
      fileUploadsRef.current.forEach(revokeSelectedMediaPreview);
      revokeVerificationDocumentPreview(verificationDocumentRef.current);
    };
  }, []);

  async function loadCollectionCandidates() {
    setCollectionLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        setCollectionCandidates([]);
        return;
      }

      const [ownResult, savedResult] = await Promise.all([
        supabase
          .from("qr_x_entries")
          .select("id,title,company_name,type,logo_url,cover_image_url")
          .eq("owner_user_id", user.id)
          .is("deleted_at", null)
          .or("suspended.is.null,suspended.eq.false")
          .order("created_at", { ascending: false }),
        supabase
          .from("qrx_saves")
          .select(`
            qrx_id,
            custom_title,
            qr_x_entries (
              id,title,company_name,type,logo_url,cover_image_url,deleted_at,suspended
            )
          `)
          .eq("user_id", user.id),
      ]);

      if (ownResult.error) throw ownResult.error;
      if (savedResult.error) throw savedResult.error;

      const ownItems: QrxCollectionCandidate[] = (ownResult.data ?? []).map((item) => ({
        ...(item as Omit<QrxCollectionCandidate, "source">),
        source: "own" as const,
      }));
      const ownIds = new Set(ownItems.map((item) => item.id));

      const savedRows = savedResult.data as unknown as SavedCollectionCandidateRow[] | null;

      const savedItems = (savedRows ?? []).reduce<QrxCollectionCandidate[]>((items, row) => {
        const entry = Array.isArray(row.qr_x_entries)
          ? row.qr_x_entries[0] ?? null
          : row.qr_x_entries;

        if (
          !entry ||
          entry.deleted_at ||
          entry.suspended === true ||
          ownIds.has(entry.id)
        ) {
          return items;
        }

        items.push({
          id: entry.id,
          title: entry.title,
          company_name: entry.company_name,
          type: entry.type,
          logo_url: entry.logo_url,
          cover_image_url: entry.cover_image_url,
          source: "saved",
          custom_title: row.custom_title ?? null,
        });

        return items;
      }, []);

      setCollectionCandidates([...ownItems, ...savedItems]);
    } catch (error) {
      console.warn("QR-X Sammlung konnte nicht geladen werden:", error);
      setCollectionCandidates([]);
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

  async function saveCollectionItems(args: {
    collectionQrxId: string;
    userId: string;
  }) {
    if (selectedCollectionQrxIds.length === 0) return;

    const rows = selectedCollectionQrxIds.map((linkedQrxId, index) => ({
      collection_qrx_id: args.collectionQrxId,
      linked_qrx_id: linkedQrxId,
      added_by: args.userId,
      sort_order: index,
    }));

    const { error } = await supabase.from("qrx_collection_items").insert(rows);
    if (error) throw error;
  }

  async function loadCreditAndPricingData() {
    setPricingLoading(true);
    setErrorText(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setCredits(null);
        setNormalQrxCount(null);
        setBusinessQrxCount(null);
        return;
      }

      const [creditsRes, normalRes, businessRes] = await Promise.all([
        supabase
          .from("qrx_credits")
          .select("credits")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("qr_x_entries")
          .select("*", { count: "exact", head: true })
          .eq("owner_user_id", user.id)
          .eq("type", "normal")
          .is("deleted_at", null)
          .or("suspended.is.null,suspended.eq.false"),
        supabase
          .from("qr_x_entries")
          .select("*", { count: "exact", head: true })
          .eq("owner_user_id", user.id)
          .eq("type", "business")
          .is("deleted_at", null)
          .or("suspended.is.null,suspended.eq.false"),
      ]);

      if (creditsRes.error) throw creditsRes.error;
      if (normalRes.error) throw normalRes.error;
      if (businessRes.error) throw businessRes.error;

      if (!creditsRes.data) {
        const { data: inserted, error: insertCreditError } = await supabase
          .from("qrx_credits")
          .upsert(
            { user_id: user.id, credits: 0 },
            { onConflict: "user_id", ignoreDuplicates: false },
          )
          .select("credits")
          .maybeSingle();

        if (insertCreditError) throw insertCreditError;
        setCredits(Number(inserted?.credits ?? 0));
      } else {
        const creditRow = creditsRes.data as { credits?: number | null } | null;
        setCredits(Number(creditRow?.credits ?? 0));
      }

      setNormalQrxCount(
        typeof normalRes.count === "number" ? normalRes.count : 0,
      );
      setBusinessQrxCount(
        typeof businessRes.count === "number" ? businessRes.count : 0,
      );
    } catch (error) {
      console.error("QRX PRICING LOAD ERROR", error);
      setErrorText(
        normalizeErrorMessage(error) ||
          ui.creditsLoadFailed,
      );
    } finally {
      setPricingLoading(false);
    }
  }

  async function spendCredits(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return credits ?? 0;

    const { data, error } = await supabase.rpc("spend_credits", {
      p_amount: amount,
    });

    if (error) {
      throw new Error(
        normalizeErrorMessage(error) ||
          ui.creditsChargeFailed,
      );
    }

    const nextCredits =
      typeof data === "number" ? data : Math.max(0, (credits ?? 0) - amount);
    setCredits(nextCredits);
    return nextCredits;
  }

  async function addCredits(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return credits ?? 0;

    const { data, error } = await supabase.rpc("add_credits", {
      p_amount: amount,
    });

    if (error) {
      throw new Error(
        normalizeErrorMessage(error) ||
          ui.creditsRefundFailed,
      );
    }

    const nextCredits =
      typeof data === "number" ? data : (credits ?? 0) + amount;
    setCredits(nextCredits);
    return nextCredits;
  }

  async function deleteCreatedQrxIfNeeded(qrxId: string) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      await supabase.functions.invoke("delete-qrx", {
        body: { qrxId },
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      });
    } catch (deleteError) {
      console.warn("QR-X Cleanup nach Fehler fehlgeschlagen:", deleteError);
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
      throw new Error(
        ui.sessionExpired,
      );
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

    const { data, error } = await supabase.functions.invoke(
      "qrx-media-prepare-upload",
      {
        body: {
          qrxId: args.qrxId,
          type: args.type,
          filename: args.filename,
          mimeType: args.mimeType,
          bytes: args.bytes,
        },
        headers: { Authorization: `Bearer ${token}` },
      },
    );

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

    return {
      uploadUrl,
      storagePath,
      chargedCredits:
        typeof response.charged_credits === "number"
          ? response.charged_credits
          : null,
      newBalance:
        typeof response.new_balance === "number" ? response.new_balance : null,
    };
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

    const { data, error } = await supabase.functions.invoke(
      "qrx-media-finalize-upload",
      {
        body: {
          qrxId: args.qrxId,
          type: args.type,
          filename: args.filename,
          mimeType: args.mimeType,
          bytes: args.bytes,
          storagePath: args.storagePath,
        },
        headers: { Authorization: `Bearer ${token}` },
      },
    );

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

    // Sicherheits-Fallback wie in der App:
    // Falls die Edge Function zwar die Datei finalisiert, aber keinen Datensatz
    // in qr_x_media zurückgibt, legen wir den Eintrag hier nachträglich an.
    // Dadurch landen Galerie-Bilder sicher als type="image" und Dateien/PDFs
    // sicher als type="file" in qr_x_media.
    if (!response.media?.id) {
      const { data: existingRow, error: existingError } = await supabase
        .from("qr_x_media")
        .select("id")
        .eq("qrx_id", args.qrxId)
        .eq("url", publicUrl)
        .eq("filename", args.filename)
        .maybeSingle();

      if (existingError) {
        console.warn(
          "qr_x_media existing check fehlgeschlagen:",
          existingError,
        );
      }

      if (!existingRow?.id) {
        const { error: mediaInsertError } = await supabase
          .from("qr_x_media")
          .insert({
            qrx_id: args.qrxId,
            type: args.type,
            url: publicUrl,
            filename: args.filename,
            bytes: args.bytes,
          });

        if (mediaInsertError) {
          console.warn(
            "qr_x_media fallback insert fehlgeschlagen:",
            mediaInsertError,
          );
        }
      }
    }

    return { publicUrl };
  }

  async function uploadQrxMedia(args: {
    qrxId: string;
    file: File;
    prefix: "logo" | "cover" | "gallery" | "file";
    mediaType?: "image" | "file";
  }) {
    const filename = buildUploadFilename(args.prefix, args.file);
    const mimeType =
      args.file.type ||
      (args.mediaType === "file" ? "application/octet-stream" : "image/jpeg");
    const bytes = args.file.size;

    const prepared = await prepareUpload({
      qrxId: args.qrxId,
      type: args.mediaType ?? "image",
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
      throw new Error(
        `Upload fehlgeschlagen (${uploadResponse.status}): ${message || "Unbekannter Fehler"}`,
      );
    }

    const finalized = await finalizeUpload({
      qrxId: args.qrxId,
      type: args.mediaType ?? "image",
      filename,
      mimeType,
      bytes,
      storagePath: prepared.storagePath,
    });

    return {
      publicUrl: finalized.publicUrl,
      chargedCredits: prepared.chargedCredits ?? 0,
    };
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);

    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setCoverFile(file);
    setCoverPositionX(50);
    setCoverPositionY(50);
    setCoverZoom(100);

    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  }

  function clearLogoSelection() {
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
  }

  function clearCoverSelection() {
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setCoverPositionX(50);
    setCoverPositionY(50);
    setCoverZoom(100);
  }

  function handleGalleryFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []).filter(
      isImageMime,
    );

    if (selectedFiles.length > 0) {
      setGalleryFiles((current) => [
        ...current,
        ...selectedFiles.map(buildSelectedMediaFile),
      ]);
    }

    event.target.value = "";
  }

  function handleFileUploadsChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length > 0) {
      setFileUploads((current) => [
        ...current,
        ...selectedFiles.map(buildSelectedMediaFile),
      ]);
    }

    event.target.value = "";
  }

  function removeGalleryFile(id: string) {
    setGalleryFiles((current) => {
      const itemToRemove = current.find((item) => item.id === id);
      if (itemToRemove) revokeSelectedMediaPreview(itemToRemove);
      return current.filter((item) => item.id !== id);
    });
  }

  function removeFileUpload(id: string) {
    setFileUploads((current) => {
      const itemToRemove = current.find((item) => item.id === id);
      if (itemToRemove) revokeSelectedMediaPreview(itemToRemove);
      return current.filter((item) => item.id !== id);
    });
  }

  function clearGalleryFiles() {
    setGalleryFiles((current) => {
      current.forEach(revokeSelectedMediaPreview);
      return [];
    });
  }

  function clearFileUploads() {
    setFileUploads((current) => {
      current.forEach(revokeSelectedMediaPreview);
      return [];
    });
  }

  function addNewsItem() {
    const text = newsDraft.trim();

    if (!text) {
      setErrorText(ui.newsRequired);
      return;
    }

    setNewsItems((current) => [
      { text, createdAt: new Date().toISOString() },
      ...current,
    ]);
    setNewsDraft("");
    setErrorText(null);
  }

  function removeNewsItem(indexToRemove: number) {
    setNewsItems((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  }

  function handleVerificationDocumentChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      event.target.value = "";
      return;
    }

    if (!isImageMime(file) && !isPdfFile(file)) {
      setErrorText(
        ui.verificationImagePdf,
      );
      event.target.value = "";
      return;
    }

    setVerificationDocument((current) => {
      revokeVerificationDocumentPreview(current);
      return buildSelectedVerificationDocument(file);
    });
    event.target.value = "";
  }

  function clearVerificationDocument() {
    setVerificationDocument((current) => {
      revokeVerificationDocumentPreview(current);
      return null;
    });
  }

  function clearSavedDraft() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(draftStorageKey);
      } catch (draftError) {
        console.warn("QR-X Entwurf konnte nicht gelöscht werden:", draftError);
      }
    }

    setDraftNotice(null);
  }

  async function uploadVerificationDocument(args: {
    userId: string;
    qrxId: string;
    document: SelectedVerificationDocument;
  }) {
    const safeFilename = sanitizeFilename(args.document.file.name);
    const storagePath = `${args.userId}/${args.qrxId}/${Date.now().toString()}-${safeFilename}`;

    const { error: uploadError } = await supabase.storage
      .from(QRX_VERIFICATION_BUCKET)
      .upload(storagePath, args.document.file, {
        contentType:
          args.document.file.type ||
          (args.document.documentType === "pdf"
            ? "application/pdf"
            : "application/octet-stream"),
        upsert: false,
      });

    if (uploadError) throw uploadError;

    return {
      storagePath,
      documentUrl: `storage://${QRX_VERIFICATION_BUCKET}/${storagePath}`,
    };
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
      throw new Error(
        ui.sessionExpired,
      );
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorText(null);
    setSuccessText(null);

    let chargedCreation = false;
    let chargedVerification = false;
    let chargedStorageCredits = 0;
    let createdQrxId: string | null = null;

    try {
      const nextTitle = title.trim();

      if (!nextTitle) {
        throw new Error(ui.enterTitle);
      }

      const nextPassword = qrxPassword.trim();
      const nextPasswordRepeat = qrxPasswordRepeat.trim();

      if (passwordProtected && nextPassword.length < 4) {
        throw new Error(ui.passwordMin);
      }

      if (passwordProtected && nextPassword !== nextPasswordRepeat) {
        throw new Error(ui.passwordMismatch);
      }

      if (wantsVerification && qrxType !== "business") {
        throw new Error(
          ui.verificationBusinessOnly,
        );
      }

      if (
        qrxType === "business" &&
        wantsVerification &&
        !verificationDocument
      ) {
        throw new Error(
          ui.verificationProofRequired,
        );
      }

      const lat = parseOptionalNumber(locationLat, ui.latitude, ui.validNumber);
      const lng = parseOptionalNumber(locationLng, ui.longitude, ui.validNumber);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(ui.login);
      }

      if (
        creationCostCredits == null ||
        totalCostCredits == null ||
        credits == null
      ) {
        throw new Error(
          ui.pricingStillLoading,
        );
      }

      if (totalCostCredits > 0 && credits < totalCostCredits) {
        throw new Error(
          runtimeUi.notEnough.replace("{{need}}", String(totalCostCredits)).replace("{{have}}", String(credits)),
        );
      }

      if (totalCostCredits > 0 && !costConfirmed) {
        const costParts: string[] = [];

        if (creationCostCredits > 0) {
          costParts.push(runtimeUi.createCost.replace("{{count}}", String(creationCostCredits)));
        }

        if (estimatedStorageCredits > 0) {
          costParts.push(
            runtimeUi.storageCost.replace("{{count}}", String(estimatedStorageCredits)),
          );
        }

        if (verificationCredits > 0) {
          costParts.push(runtimeUi.verifyCost.replace("{{count}}", String(verificationCredits)));
        }

        const storageNotice =
          estimatedStorageCredits > 0
            ? `\n\n${runtimeUi.storageEstimate}`
            : "";

        const confirmed = window.confirm(
          `${runtimeUi.confirmSpend}\n\n${costParts.join("\n")}\n\n${runtimeUi.estimatedTotal.replace("{{count}}", String(totalCostCredits))}\n${runtimeUi.balance.replace("{{count}}", String(credits))}${storageNotice}\n\n${runtimeUi.confirmPaid}`,
        );

        if (!confirmed) {
          setSaving(false);
          return;
        }

        setCostConfirmed(true);
      }

      if (creationCostCredits > 0) {
        await spendCredits(creationCostCredits);
        chargedCreation = true;
      }

      if (verificationCredits > 0) {
        await spendCredits(verificationCredits);
        chargedVerification = true;
      }

      const insertPayload = {
        category: qrxType === "business" ? category : null,
        owner_user_id: user.id,
        title: nextTitle,
        company_name: qrxType === "business" ? toNullable(companyName) : null,
        description: toNullable(description),
        news: newsItems.length > 0 ? newsItems : null,
        type: qrxType,
        location_name: toNullable(locationName),
        location_lat: lat,
        location_lng: lng,
        logo_url: null,
        cover_image_url: null,
        cta_phone: qrxType === "business" ? toNullable(ctaPhone) : null,
        cta_website: qrxType === "business" ? toNullable(ctaWebsite) : null,
        cta_email: qrxType === "business" ? toNullable(ctaEmail) : null,
        cta_navigation:
          qrxType === "business" ? toNullable(ctaNavigation) : null,
        verified: false,
        suspended: false,
        password_protected: false,
        collection_title:
          selectedCollectionQrxIds.length > 0
            ? toNullable(collectionTitle)
            : null,
        collection_description:
          selectedCollectionQrxIds.length > 0
            ? toNullable(collectionDescription)
            : null,
      };

      let insertResult = await supabase
        .from("qr_x_entries")
        .insert(insertPayload)
        .select("id")
        .single();

      if (
        insertResult.error &&
        isMissingColumnError(insertResult.error, "cta_email")
      ) {
        const fallbackPayload = {
          category: insertPayload.category,
          owner_user_id: insertPayload.owner_user_id,
          title: insertPayload.title,
          company_name: insertPayload.company_name,
          description: insertPayload.description,
          news: insertPayload.news,
          type: insertPayload.type,
          location_name: insertPayload.location_name,
          location_lat: insertPayload.location_lat,
          location_lng: insertPayload.location_lng,
          logo_url: insertPayload.logo_url,
          cover_image_url: insertPayload.cover_image_url,
          cta_phone: insertPayload.cta_phone,
          cta_website: insertPayload.cta_website,
          cta_navigation: insertPayload.cta_navigation,
          verified: insertPayload.verified,
          suspended: insertPayload.suspended,
          password_protected: insertPayload.password_protected,
          collection_title: insertPayload.collection_title,
          collection_description: insertPayload.collection_description,
        };

        insertResult = await supabase
          .from("qr_x_entries")
          .insert(fallbackPayload)
          .select("id")
          .single();
      }

      const { data, error } = insertResult;

      if (error) {
        throw error;
      }

      const newId = data?.id;
      createdQrxId = newId ?? null;

      if (newId && selectedCollectionQrxIds.length > 0) {
        await saveCollectionItems({
          collectionQrxId: newId,
          userId: user.id,
        });
      }

      if (passwordProtected && newId) {
        await saveQrxPasswordProtection({
          qrxId: newId,
          enabled: true,
          password: nextPassword,
        });
      }

      if (newId && logoFile) {
        const logoUpload = await uploadQrxMedia({
          qrxId: newId,
          file: logoFile,
          prefix: "logo",
        });

        const { error: logoUpdateError } = await supabase
          .from("qr_x_entries")
          .update({ logo_url: logoUpload.publicUrl })
          .eq("id", newId);

        if (logoUpdateError) throw logoUpdateError;
      }

      if (newId && qrxType === "business" && coverFile) {
        const positionedCoverFile = await createPositionedCoverFile(coverFile, coverPositionX, coverPositionY, coverZoom);
        const coverUpload = await uploadQrxMedia({
          qrxId: newId,
          file: positionedCoverFile,
          prefix: "cover",
        });

        const { error: coverUpdateError } = await supabase
          .from("qr_x_entries")
          .update({ cover_image_url: coverUpload.publicUrl })
          .eq("id", newId);

        if (coverUpdateError) throw coverUpdateError;
      }

      if (newId && galleryFiles.length > 0) {
        for (const item of galleryFiles) {
          const galleryUpload = await uploadQrxMedia({
            qrxId: newId,
            file: item.file,
            prefix: "gallery",
            mediaType: "image",
          });
          chargedStorageCredits += Math.max(0, galleryUpload.chargedCredits);
        }
      }

      if (newId && fileUploads.length > 0) {
        for (const item of fileUploads) {
          const fileUpload = await uploadQrxMedia({
            qrxId: newId,
            file: item.file,
            prefix: "file",
            mediaType: "file",
          });
          chargedStorageCredits += Math.max(0, fileUpload.chargedCredits);
        }
      }

      if (
        newId &&
        user.id &&
        qrxType === "business" &&
        wantsVerification &&
        verificationDocument
      ) {
        const uploadedVerification = await uploadVerificationDocument({
          userId: user.id,
          qrxId: newId,
          document: verificationDocument,
        });

        const { error: verificationInsertError } = await supabase
          .from("qrx_verification_requests")
          .insert({
            qrx_id: newId,
            owner_user_id: user.id,
            status: "pending",
            credits_charged: verificationCredits,
            refund_done: false,
            document_url: uploadedVerification.documentUrl,
            document_path: uploadedVerification.storagePath,
            document_filename: verificationDocument.file.name,
            document_mime_type:
              verificationDocument.file.type ||
              (verificationDocument.documentType === "pdf"
                ? "application/pdf"
                : "application/octet-stream"),
            document_type: verificationDocument.documentType,
          });

        if (verificationInsertError) throw verificationInsertError;
      }

      clearGalleryFiles();
      clearFileUploads();
      setNewsItems([]);
      setNewsDraft("");
      clearVerificationDocument();
      setWantsVerification(false);
      setCollectionTitle("");
      setCollectionDescription("");
      setSelectedCollectionQrxIds([]);
      clearSavedDraft();
      await loadCreditAndPricingData();

      const totalCreditsUsed =
        creationCostCredits + verificationCredits + chargedStorageCredits;
      const costText = totalCreditsUsed > 0
        ? ` ${runtimeUi.creditsDeducted.replace("{{count}}", String(totalCreditsUsed))}`
        : ` ${runtimeUi.firstFree}`;
      const storageText = chargedStorageCredits > 0
        ? ` ${runtimeUi.storageCharged.replace("{{count}}", String(chargedStorageCredits))}`
        : "";
      const verificationText = wantsVerification && verificationCredits > 0
        ? ` ${runtimeUi.verifyRequested}`
        : "";
      setSuccessText(`${passwordProtected ? runtimeUi.createdProtected : runtimeUi.created}${costText}${storageText}${verificationText}`);

      window.setTimeout(() => {
        if (newId) {
          router.push(`/${locale}/dashboard/qrx/${newId}/edit`);
        } else {
          router.push(`/${locale}/dashboard/qrx`);
        }
      }, 700);
    } catch (error) {
      console.error("QRX CREATE ERROR", error);

      if (createdQrxId) {
        await deleteCreatedQrxIfNeeded(createdQrxId);
      }

      if (
        chargedCreation &&
        creationCostCredits != null &&
        creationCostCredits > 0
      ) {
        try {
          await addCredits(creationCostCredits);
        } catch (refundError) {
          console.warn(
            "Credit-Rückbuchung nach Fehler fehlgeschlagen:",
            refundError,
          );
        }
      }

      if (chargedVerification && verificationCredits > 0) {
        try {
          await addCredits(verificationCredits);
        } catch (refundError) {
          console.warn(
            "Credit-Rückbuchung Verifizierung nach Fehler fehlgeschlagen:",
            refundError,
          );
        }
      }

      if (chargedStorageCredits > 0) {
        try {
          await addCredits(chargedStorageCredits);
        } catch (refundError) {
          console.warn(
            "Credit-Rückbuchung Storage nach Fehler fehlgeschlagen:",
            refundError,
          );
        }
      }

      await loadCreditAndPricingData();
      setErrorText(
        normalizeErrorMessage(error) || ui.createFailed,
      );
    } finally {
      setSaving(false);
    }
  }

  const isBusiness = qrxType === "business";

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}/dashboard`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>

        <nav className={styles.nav} aria-label={ui.createKicker}>
          <Link href={`/${locale}/dashboard`}>{ui.dashboard}</Link>
          <Link href={`/${locale}/dashboard/qrx`}>{ui.myQrx}</Link>
        </nav>
      </header>

      <section className={styles.hero} style={{ maxWidth: 880, width: "100%", margin: "0 auto" }}>
        <div>
          <span className={styles.kicker}>{ui.createKicker}</span>
          <h1>{ui.newTitle}</h1>
          <p>
            {ui.createHero}
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link
            href={`/${locale}/dashboard/qrx`}
            className={styles.secondaryButton}
          >
            {ui.backMyQrx}
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 880,
          margin: "0 auto",
          borderRadius: 30,
          background: "rgba(15, 23, 42, 0.82)",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
          padding: 22,
        }}
      >
        <div className={styles.cardHeader}>
          <div>
            <h2>{ui.baseData}</h2>
            <p>{ui.baseHint}</p>
          </div>
          <span>{isBusiness ? ui.businessQrx : ui.normalQrx}</span>
        </div>

        {errorText ? (
          <div
            style={{
              borderRadius: 22,
              padding: 16,
              marginBottom: 16,
              background: "rgba(239, 68, 68, 0.14)",
              border: "1px solid rgba(252, 165, 165, 0.22)",
              color: "#fecaca",
              fontWeight: 850,
              lineHeight: 1.55,
            }}
          >
            {errorText}
          </div>
        ) : null}

        {successText ? (
          <div
            style={{
              borderRadius: 22,
              padding: 16,
              marginBottom: 16,
              background: "rgba(34, 197, 94, 0.14)",
              border: "1px solid rgba(134, 239, 172, 0.22)",
              color: "#bbf7d0",
              fontWeight: 850,
              lineHeight: 1.55,
            }}
          >
            {successText}
          </div>
        ) : null}

        {draftNotice ? (
          <div
            style={{
              borderRadius: 22,
              padding: 16,
              marginBottom: 16,
              background: "rgba(59, 130, 246, 0.14)",
              border: "1px solid rgba(147, 197, 253, 0.24)",
              color: "#dbeafe",
              fontWeight: 850,
              lineHeight: 1.55,
              display: "grid",
              gap: 12,
            }}
          >
            <span>{draftNotice}</span>
            <button
              type="button"
              onClick={clearSavedDraft}
              style={dismissDraftButtonStyle}
            >
              {ui.hideNotice}
            </button>
          </div>
        ) : null}

        <div
          style={{
            borderRadius: 22,
            padding: 16,
            marginBottom: 16,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <strong style={{ color: "#ffffff", fontSize: 16 }}>
              {ui.creditCheck}
            </strong>
            <div style={creditsHeaderActionsStyle}>
              <span style={{ color: "#cbd5e1", fontWeight: 900 }}>
                {ui.currentCredits}: {pricingLoading ? "…" : (credits ?? 0)}
              </span>
              <button
                type="button"
                onClick={() => void loadCreditAndPricingData()}
                disabled={pricingLoading}
                style={refreshCreditsButtonStyle}
              >
                {pricingLoading ? ui.refreshing : ui.refreshCredits}
              </button>
            </div>
          </div>

          <div
            style={{
              color: "#94a3b8",
              lineHeight: 1.55,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {pricingLoading || creationCostCredits == null ? (
              ui.costsLoading
            ) : qrxType === "normal" && creationCostCredits === 0 ? (
              ui.firstNormalFree
            ) : (
              <>
                Dieser {isBusiness ? "Business QR-X" : "normale QR-X"} kostet{" "}
                <strong style={{ color: "#ffffff" }}>
                  {creationCostCredits} Credits
                </strong>
                {verificationCredits > 0 ? (
                  <>
                    {" "}
                    + {ui.verification}{" "}
                    <strong style={{ color: "#ffffff" }}>
                      {verificationCredits} Credits
                    </strong>
                  </>
                ) : null}
                .
              </>
            )}
          </div>

          {!pricingLoading &&
          creationCostCredits != null &&
          totalCostCredits != null &&
          credits != null &&
          credits < totalCostCredits ? (
            <div
              style={{ color: "#fecaca", fontWeight: 900, lineHeight: 1.55 }}
            >
              {ui.insufficient} {ui.required}: {totalCostCredits}, {ui.available}:{" "}
              {credits}.{" "}
              <Link
                href={`/${locale}/dashboard/credits`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#bfdbfe" }}
              >
                {ui.buyCredits}
              </Link>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <button
              type="button"
              onClick={() => setQrxType("normal")}
              style={{
                minHeight: 74,
                borderRadius: 18,
                border:
                  qrxType === "normal"
                    ? "1px solid #bbf7d0"
                    : "1px solid rgba(148, 163, 184, 0.22)",
                background:
                  qrxType === "normal"
                    ? "rgba(34,197,94,0.16)"
                    : "rgba(255,255,255,0.06)",
                color: "#ffffff",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
              ⌗ {ui.normalQrx}
            </button>

            <button
              type="button"
              onClick={() => setQrxType("business")}
              style={{
                minHeight: 74,
                borderRadius: 18,
                border:
                  qrxType === "business"
                    ? "1px solid #fed7aa"
                    : "1px solid rgba(148, 163, 184, 0.22)",
                background:
                  qrxType === "business"
                    ? "rgba(251,146,60,0.16)"
                    : "rgba(255,255,255,0.06)",
                color: "#ffffff",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
              🏢 {ui.businessQrx}
            </button>
          </div>

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                {ui.logo}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                {ui.logoHint}
              </p>
            </div>

            {logoPreview ? (
              <div style={previewRowStyle}>
                <img
                  src={logoPreview}
                  alt={ui.logoPreviewAlt}
                  style={logoPreviewStyle}
                />
                <button
                  type="button"
                  onClick={clearLogoSelection}
                  className={styles.secondaryButton}
                  style={{ border: 0, cursor: "pointer" }}
                >
                  {ui.removeLogo}
                </button>
              </div>
            ) : null}

            <label style={fileButtonStyle}>
              {ui.chooseLogo}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {isBusiness ? (
            <div style={mediaSectionStyle}>
              <div>
                <h3
                  style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}
                >
                  {ui.cover}
                </h3>
                <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                  {ui.coverHint}
                  deines Business QR-X.
                </p>
              </div>

              {coverPreview ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={coverPreviewViewportStyle}>
                    <img
                      src={coverPreview}
                      alt={ui.coverPreviewAlt}
                      style={{ ...coverPreviewStyle, objectPosition: `${coverPositionX}% ${coverPositionY}%`, transform: `scale(${coverZoom / 100})`, transformOrigin: `${coverPositionX}% ${coverPositionY}%` }}
                    />
                  </div>
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
                  <button
                    type="button"
                    onClick={clearCoverSelection}
                    className={styles.secondaryButton}
                    style={{ border: 0, cursor: "pointer" }}
                  >
                    {ui.removeCover}
                  </button>
                </div>
              ) : null}

              <label style={fileButtonStyle}>
                {ui.chooseCover}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          ) : null}

          <label style={labelStyle}>
            {ui.title}
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              style={inputStyle}
              required
            />
          </label>

          {isBusiness ? (
            <>
              <label style={labelStyle}>
                {ui.companyName}
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      color: "#ffffff",
                      fontSize: 18,
                    }}
                  >
                    {ui.categoryLabel}
                  </h3>
                  <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                    {ui.categoryHint}
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  {BUSINESS_CATEGORY_OPTIONS.map((item) => {
                    const active = category === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setCategory(item.value)}
                        style={{
                          minHeight: 58,
                          borderRadius: 16,
                          border: active
                            ? "1px solid #facc15"
                            : "1px solid rgba(148, 163, 184, 0.22)",
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
                        }}
                      >
                        <span aria-hidden="true">{item.icon}</span>
                        <span>{QR_CATEGORY_TEXT[qrxLocale][item.value]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}

          <label style={labelStyle}>
            {ui.description}
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              style={{
                ...inputStyle,
                minHeight: 140,
                paddingTop: 14,
                resize: "vertical",
              }}
            />
          </label>

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                {ui.news}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                {ui.newsHint}
              </p>
            </div>

            <textarea
              value={newsDraft}
              onChange={(event) => setNewsDraft(event.target.value)}
              style={{
                ...inputStyle,
                minHeight: 110,
                paddingTop: 14,
                resize: "vertical",
              }}
              placeholder={ui.newsPlaceholder}
            />

            <button type="button" onClick={addNewsItem} style={fileButtonStyle}>
              {ui.addNews}
            </button>

            {newsItems.length > 0 ? (
              <div style={newsSelectionBoxStyle}>
                <div style={selectionHeaderStyle}>
                  <strong>
                    {newsItems.length} News-Eintrag
                    {newsItems.length === 1 ? "" : "e"} angelegt
                  </strong>
                  {newsItems.length > MAX_VISIBLE_NEWS ? (
                    <span style={newsScrollHintStyle}>
                      {ui.newsScrollHint.replace("{{count}}", String(MAX_VISIBLE_NEWS))}
                    </span>
                  ) : null}
                </div>

                <div style={newsPreviewListStyle(newsItems.length)}>
                  {newsItems.map((item, index) => (
                    <article
                      key={`${item.createdAt}-${index}`}
                      style={newsPreviewRowStyle}
                    >
                      <div style={{ display: "grid", gap: 6 }}>
                        <div style={newsPreviewTextStyle}>{item.text}</div>
                        <div style={newsPreviewDateStyle}>
                          {new Date(item.createdAt).toLocaleString(locale)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeNewsItem(index)}
                        style={previewRemoveButtonStyle}
                      >
                        {ui.delete}
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                {ui.collection}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
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

                <p style={{ margin: 0, color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>
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

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                {ui.location}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                {ui.locationHint}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 10,
              }}
            >
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
                  <input
                    value={locationName}
                    onChange={(event) => setLocationName(event.target.value)}
                    style={inputStyle}
                    placeholder={ui.locationPlaceholder}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <label style={labelStyle}>
                    {ui.latitude}
                    <input
                      value={locationLat}
                      onChange={(event) => setLocationLat(event.target.value)}
                      style={inputStyle}
                      placeholder={ui.exampleLat}
                    />
                  </label>

                  <label style={labelStyle}>
                    {ui.longitude}
                    <input
                      value={locationLng}
                      onChange={(event) => setLocationLng(event.target.value)}
                      style={inputStyle}
                      placeholder={ui.exampleLng}
                    />
                  </label>
                </div>
              </>
            ) : null}
          </div>

          {isBusiness ? (
            <>
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.09)",
                  margin: "4px 0",
                }}
              />

              <div>
                <h3
                  style={{ margin: "0 0 10px", color: "#ffffff", fontSize: 18 }}
                >
                  {ui.contact}
                </h3>
                <p
                  style={{
                    margin: "0 0 14px",
                    color: "#94a3b8",
                    lineHeight: 1.55,
                  }}
                >
                  {ui.contactHint}
                </p>
              </div>

              <label style={labelStyle}>
                {ui.phone}
                <input
                  value={ctaPhone}
                  onChange={(event) => setCtaPhone(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                {ui.website}
                <input
                  value={ctaWebsite}
                  onChange={(event) => setCtaWebsite(event.target.value)}
                  style={inputStyle}
                  placeholder="https://..."
                />
              </label>

              <label style={labelStyle}>
                {ui.email}
                <input
                  value={ctaEmail}
                  onChange={(event) => setCtaEmail(event.target.value)}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Navigation
                <input
                  value={ctaNavigation}
                  onChange={(event) => setCtaNavigation(event.target.value)}
                  style={inputStyle}
                  placeholder={ui.addressPlaceholder}
                />
              </label>
            </>
          ) : null}

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                {ui.gallery}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                {ui.galleryHint}
              </p>
            </div>

            <label style={fileButtonStyle}>
              {ui.chooseGallery}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryFilesChange}
                style={{ display: "none" }}
              />
            </label>

            {galleryFiles.length > 0 ? (
              <div style={selectionInfoStyle}>
                <div style={selectionHeaderStyle}>
                  <strong>{ui.selectedImages.replace("{{count}}", String(galleryFiles.length))}</strong>
                  <button
                    type="button"
                    onClick={clearGalleryFiles}
                    style={miniDangerButtonStyle}
                  >
                    {ui.removeAllImages}
                  </button>
                </div>

                <div style={galleryPreviewGridStyle}>
                  {galleryFiles.map((item) => (
                    <div key={item.id} style={galleryPreviewCardStyle}>
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={`${item.file.name} Vorschau`}
                          style={galleryImagePreviewStyle}
                        />
                      ) : null}

                      <div style={previewFileMetaStyle}>
                        <strong>{item.file.name}</strong>
                        <span>{formatBytes(item.file.size)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeGalleryFile(item.id)}
                        style={previewRemoveButtonStyle}
                      >
                        {ui.delete}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div style={mediaSectionStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                {ui.files}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                {ui.filesHint}
              </p>
            </div>

            <label style={fileButtonStyle}>
              {ui.chooseFiles}
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,image/*,application/pdf"
                onChange={handleFileUploadsChange}
                style={{ display: "none" }}
              />
            </label>

            {fileUploads.length > 0 ? (
              <div style={selectionInfoStyle}>
                <div style={selectionHeaderStyle}>
                  <strong>{ui.selectedFiles.replace("{{count}}", String(fileUploads.length))}</strong>
                  <button
                    type="button"
                    onClick={clearFileUploads}
                    style={miniDangerButtonStyle}
                  >
                    {ui.removeAllFiles}
                  </button>
                </div>

                <div style={filePreviewListStyle}>
                  {fileUploads.map((item) => (
                    <div key={item.id} style={filePreviewCardStyle}>
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={`${item.file.name} Vorschau`}
                          style={fileImagePreviewStyle}
                        />
                      ) : (
                        <div style={fileIconPreviewStyle}>
                          {item.file.type === "application/pdf" ||
                          item.file.name.toLowerCase().endsWith(".pdf")
                            ? "PDF"
                            : "FILE"}
                        </div>
                      )}

                      <div style={previewFileMetaStyle}>
                        <strong>{item.file.name}</strong>
                        <span>
                          {item.file.type || ui.file} ·{" "}
                          {formatBytes(item.file.size)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFileUpload(item.id)}
                        style={previewRemoveButtonStyle}
                      >
                        {ui.delete}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {isBusiness ? (
            <div style={verificationSectionStyle(wantsVerification)}>
              <div>
                <h3 style={{ margin: "0 0 7px", color: "#ffffff", fontSize: 18 }}>
                  {ui.verificationTitle}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    lineHeight: 1.55,
                    fontSize: 13,
                  }}
                >
                  {ui.verificationIntro}
                </p>
              </div>

              <div style={verificationBenefitsGridStyle}>
                <div style={verificationBenefitCardStyle}>
                  <span style={verificationBenefitIconStyle}>✓</span>
                  <div>
                    <strong style={verificationBenefitHeadingStyle}>{ui.credibility}</strong>
                    <p style={verificationBenefitCopyStyle}>
                      {ui.verifiedBadgeBenefit}
                    </p>
                  </div>
                </div>

                <div style={verificationBenefitCardStyle}>
                  <span style={verificationBenefitIconStyle}>◇</span>
                  <div>
                    <strong style={verificationBenefitHeadingStyle}>{ui.credibility}</strong>
                    <p style={verificationBenefitCopyStyle}>
                      {ui.credibilityText}
                    </p>
                  </div>
                </div>

                <div style={verificationBenefitCardStyle}>
                  <span style={verificationBenefitIconStyle}>●</span>
                  <div>
                    <strong style={verificationBenefitHeadingStyle}>{ui.badge}</strong>
                    <p style={verificationBenefitCopyStyle}>
                      {ui.badgeText}
                    </p>
                  </div>
                </div>

                <div style={verificationBenefitCardStyle}>
                  <span style={verificationBenefitIconStyle}>▣</span>
                  <div>
                    <strong style={verificationBenefitHeadingStyle}>{ui.privateDocs}</strong>
                    <p style={verificationBenefitCopyStyle}>
                      {ui.privateDocsText}
                    </p>
                  </div>
                </div>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  color: "#ffffff",
                  fontWeight: 950,
                  cursor: "pointer",
                  padding: "14px 15px",
                  borderRadius: 16,
                  background: wantsVerification
                    ? "rgba(250,204,21,0.10)"
                    : "rgba(255,255,255,0.035)",
                  border: wantsVerification
                    ? "1px solid rgba(250,204,21,0.28)"
                    : "1px solid rgba(148,163,184,0.14)",
                }}
              >
                <span>
                  {ui.requestVerification} · {QRX_VERIFICATION_COST_CREDITS} Credits
                  <small
                    style={{
                      display: "block",
                      marginTop: 4,
                      color: "#94a3b8",
                      fontWeight: 700,
                      lineHeight: 1.45,
                    }}
                  >
                    {ui.refundHint}
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={wantsVerification}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setWantsVerification(checked);
                    if (!checked) clearVerificationDocument();
                  }}
                  style={{ width: 20, height: 20, accentColor: "#facc15" }}
                />
              </label>

              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  lineHeight: 1.55,
                  fontSize: 13,
                }}
              >
                {ui.proofHint}
              </p>

              {wantsVerification ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <label style={fileButtonStyle}>
                    {ui.chooseProof}
                    <input
                      type="file"
                      accept="image/*,application/pdf,.pdf"
                      onChange={handleVerificationDocumentChange}
                      style={{ display: "none" }}
                    />
                  </label>

                  {verificationDocument ? (
                    <div style={verificationPreviewCardStyle}>
                      {verificationDocument.previewUrl ? (
                        <img
                          src={verificationDocument.previewUrl}
                          alt={ui.verificationPreviewAlt}
                          style={fileImagePreviewStyle}
                        />
                      ) : (
                        <div style={fileIconPreviewStyle}>PDF</div>
                      )}

                      <div style={previewFileMetaStyle}>
                        <strong>{verificationDocument.file.name}</strong>
                        <span>
                          {verificationDocument.documentType.toUpperCase()} ·{" "}
                          {formatBytes(verificationDocument.file.size)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={clearVerificationDocument}
                        style={previewRemoveButtonStyle}
                      >
                        {ui.delete}
                      </button>
                    </div>
                  ) : (
                    <div style={verificationHintStyle}>
                      {ui.proofInstruction}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <div
            style={{
              borderRadius: 22,
              padding: 16,
              background: passwordProtected
                ? "rgba(59,130,246,0.14)"
                : "rgba(255,255,255,0.045)",
              border: passwordProtected
                ? "1px solid rgba(147,197,253,0.28)"
                : "1px solid rgba(255,255,255,0.08)",
              display: "grid",
              gap: 12,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                color: "#ffffff",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
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

            <p
              style={{
                margin: 0,
                color: "#94a3b8",
                lineHeight: 1.55,
                fontSize: 13,
              }}
            >
              {ui.passwordHint}
            </p>

            {passwordProtected ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <label style={labelStyle}>
                  {ui.password}
                  <input
                    type="password"
                    value={qrxPassword}
                    onChange={(event) => setQrxPassword(event.target.value)}
                    style={inputStyle}
                    minLength={4}
                    required={passwordProtected}
                    autoComplete="new-password"
                  />
                </label>

                <label style={labelStyle}>
                  {ui.repeatPassword}
                  <input
                    type="password"
                    value={qrxPasswordRepeat}
                    onChange={(event) =>
                      setQrxPasswordRepeat(event.target.value)
                    }
                    style={inputStyle}
                    minLength={4}
                    required={passwordProtected}
                    autoComplete="new-password"
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div style={storageBoxStyle}>
            <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
              {ui.storageQuota}
            </h3>
            <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
              {ui.storageQuotaHint.replace("{{free}}", String(FREE_STORAGE_MB)).replace("{{pack}}", String(STORAGE_PACK_MB))}
            </p>
            <div style={storageGridStyle}>
              <div style={storageMetricStyle}>
                <span style={storageMetricLabelStyle}>{ui.selected}</span>
                <strong>{formatMb(selectedStorageMb)}</strong>
              </div>
              <div style={storageMetricStyle}>
                <span style={storageMetricLabelStyle}>
                  {ui.quotaAfterCreation}
                </span>
                <strong>{formatMb(estimatedStorageLimitMb)}</strong>
              </div>
              <div style={storageMetricStyle}>
                <span style={storageMetricLabelStyle}>{ui.storageCredits}</span>
                <strong>{estimatedStorageCredits}</strong>
              </div>
            </div>
            {estimatedStorageCredits > 0 ? (
              <p
                style={{
                  margin: 0,
                  color: "#fde68a",
                  lineHeight: 1.55,
                  fontWeight: 850,
                }}
              >
                {estimatedStorageCredits} Credit{estimatedStorageCredits === 1 ? "" : "s"}. {ui.storageHint}
              </p>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: "#bbf7d0",
                  lineHeight: 1.55,
                  fontWeight: 850,
                }}
              >
                {ui.noStorageCost}
              </p>
            )}
          </div>

          <div
            style={totalCostBoxStyle(
              !pricingLoading &&
                totalCostCredits != null &&
                credits != null &&
                credits < totalCostCredits,
            )}
          >
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                {ui.totalCosts}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                {ui.costOverview}
              </p>
            </div>

            <div style={costRowsStyle}>
              <div style={costRowStyle}>
                <span>{ui.qrxCreation}</span>
                <strong>
                  {pricingLoading || creationCostCredits == null
                    ? "…"
                    : `${creationCostCredits} Credits`}
                </strong>
              </div>
              <div style={costRowStyle}>
                <span>{ui.verification}</span>
                <strong>{verificationCredits} Credits</strong>
              </div>
              <div style={costRowStyle}>
                <span>{ui.additionalStorageCredits}</span>
                <strong>{estimatedStorageCredits} Credits</strong>
              </div>
              <div style={costTotalRowStyle}>
                <span>{ui.totalLabel}</span>
                <strong>
                  {pricingLoading || totalCostCredits == null
                    ? "…"
                    : `${totalCostCredits} Credits`}
                </strong>
              </div>
            </div>

            {!pricingLoading &&
            totalCostCredits != null &&
            credits != null &&
            credits < totalCostCredits ? (
              <p
                style={{
                  margin: 0,
                  color: "#fecaca",
                  lineHeight: 1.55,
                  fontWeight: 900,
                }}
              >
                {ui.missingCredits.replace("{{count}}", String(totalCostCredits - credits)).replace("{{suffix}}", totalCostCredits - credits === 1 ? "" : "s")}
              </p>
            ) : null}
          </div>

          <div style={creditsBuyBoxStyle}>
            <div>
              <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: 18 }}>
                {ui.buyCreditsTitle}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.55 }}>
                {ui.buyCreditsHint}
              </p>
            </div>

            <div style={creditsBuyActionsStyle}>
              <Link
                href={`/${locale}/dashboard/credits`}
                target="_blank"
                rel="noopener noreferrer"
                style={wideCreditLinkStyle}
              >
                💳 {ui.buyCredits}
              </Link>
              <button
                type="button"
                onClick={() => void loadCreditAndPricingData()}
                disabled={pricingLoading}
                style={wideRefreshCreditsButtonStyle}
              >
                {pricingLoading ? ui.refreshing : ui.refreshCredits}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 8,
            }}
          >
            <Link
              href={`/${locale}/dashboard/qrx`}
              className={styles.secondaryButton}
            >
              {ui.cancel}
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                pricingLoading ||
                creationCostCredits == null ||
                totalCostCredits == null ||
                credits == null ||
                !hasEnoughCredits
              }
              className={styles.primaryButton}
              style={{
                border: 0,
                cursor:
                  saving ||
                  pricingLoading ||
                  creationCostCredits == null ||
                  totalCostCredits == null ||
                  credits == null ||
                  !hasEnoughCredits
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  saving ||
                  pricingLoading ||
                  creationCostCredits == null ||
                  totalCostCredits == null ||
                  credits == null ||
                  !hasEnoughCredits
                    ? 0.72
                    : 1,
              }}
            >
              {saving
                ? ui.creating
                : pricingLoading
                  ? ui.costsLoading
                  : !hasEnoughCredits
                    ? ui.notEnoughCredits
                    : ui.createQrx}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

const creditsHeaderActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const refreshCreditsButtonStyle: CSSProperties = {
  minHeight: 34,
  borderRadius: 999,
  border: "1px solid rgba(147,197,253,0.28)",
  background: "rgba(59,130,246,0.14)",
  color: "#bfdbfe",
  fontWeight: 950,
  cursor: "pointer",
  padding: "0 12px",
};

const creditsBuyActionsStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const wideRefreshCreditsButtonStyle: CSSProperties = {
  minHeight: 48,
  borderRadius: 16,
  border: "1px solid rgba(147,197,253,0.28)",
  background: "rgba(59,130,246,0.14)",
  color: "#bfdbfe",
  fontWeight: 950,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 18px",
};

function locationModeButtonStyle(active: boolean): CSSProperties {
  return {
    minHeight: 56,
    borderRadius: 16,
    border: active
      ? "1px solid #bbf7d0"
      : "1px solid rgba(148, 163, 184, 0.22)",
    background: active ? "rgba(34,197,94,0.16)" : "rgba(255,255,255,0.055)",
    color: "#ffffff",
    fontWeight: 950,
    cursor: "pointer",
    padding: "0 14px",
  };
}

const mediaSectionStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const previewRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const logoPreviewStyle: CSSProperties = {
  width: 104,
  height: 104,
  objectFit: "cover",
  borderRadius: 26,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
};

const coverPreviewViewportStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  overflow: "hidden",
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(15,23,42,0.55)",
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

const coverAdjustBoxStyle: CSSProperties = { display: "grid", gap: 8, padding: 14, borderRadius: 16, background: "rgba(15,23,42,0.55)", border: "1px solid rgba(148,163,184,0.18)" };
const coverAdjustHintStyle: CSSProperties = { color: "#94a3b8", fontSize: 13, lineHeight: 1.45 };
const coverRangeLabelStyle: CSSProperties = { display: "grid", gridTemplateColumns: "90px 1fr", gap: 10, alignItems: "center", color: "#cbd5e1", fontSize: 13, fontWeight: 800 };
const coverRangeStyle: CSSProperties = { width: "100%", cursor: "pointer", accentColor: "#6366f1" };
const coverZoomValueStyle: CSSProperties = { justifySelf: "end", color: "#94a3b8", fontSize: 12, fontWeight: 800 };
const coverResetButtonStyle: CSSProperties = { justifySelf: "start", border: "1px solid rgba(148,163,184,0.25)", background: "rgba(255,255,255,0.06)", color: "#fff", borderRadius: 10, padding: "7px 10px", cursor: "pointer", fontWeight: 800 };

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
};

const storageBoxStyle: CSSProperties = {
  borderRadius: 18,
  padding: 16,
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.24)",
  display: "grid",
  gap: 12,
};

const storageGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
};

const storageMetricStyle: CSSProperties = {
  borderRadius: 14,
  padding: 12,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  display: "grid",
  gap: 4,
  color: "#ffffff",
};

const storageMetricLabelStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 850,
};

const selectionInfoStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 850,
  lineHeight: 1.55,
  wordBreak: "break-word",
  display: "grid",
  gap: 10,
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
  justifySelf: "start",
};

const selectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const galleryPreviewGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: 12,
};

const galleryPreviewCardStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  borderRadius: 18,
  padding: 10,
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const galleryImagePreviewStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  borderRadius: 14,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const filePreviewListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const filePreviewCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "64px 1fr auto",
  alignItems: "center",
  gap: 12,
  borderRadius: 18,
  padding: 10,
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(148,163,184,0.18)",
};

const fileImagePreviewStyle: CSSProperties = {
  width: 64,
  height: 64,
  objectFit: "cover",
  borderRadius: 14,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const fileIconPreviewStyle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e0f2fe",
  fontSize: 12,
  fontWeight: 950,
};

const previewFileMetaStyle: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 4,
  color: "#dbeafe",
};

const previewRemoveButtonStyle: CSSProperties = {
  minHeight: 36,
  borderRadius: 12,
  border: "1px solid rgba(252,165,165,0.24)",
  background: "rgba(239,68,68,0.16)",
  color: "#fecaca",
  fontWeight: 950,
  cursor: "pointer",
  padding: "0 12px",
};

const verificationBenefitsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: 10,
};

const verificationBenefitCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "34px minmax(0, 1fr)",
  gap: 10,
  alignItems: "start",
  padding: 12,
  borderRadius: 15,
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const verificationBenefitIconStyle: CSSProperties = {
  width: 30,
  height: 30,
  display: "grid",
  placeItems: "center",
  borderRadius: 10,
  color: "#e7c66f",
  background: "rgba(212,168,79,0.09)",
  border: "1px solid rgba(212,168,79,0.18)",
  fontWeight: 950,
  fontSize: 12,
};

const verificationBenefitHeadingStyle: CSSProperties = {
  display: "block",
  color: "#f8fafc",
  fontSize: 13,
  lineHeight: 1.35,
  marginBottom: 3,
};

const verificationBenefitCopyStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 12,
  lineHeight: 1.55,
};

function verificationSectionStyle(active: boolean): CSSProperties {
  return {
    display: "grid",
    gap: 12,
    borderRadius: 22,
    padding: 16,
    background: active ? "rgba(250,204,21,0.12)" : "rgba(255,255,255,0.045)",
    border: active
      ? "1px solid rgba(250,204,21,0.32)"
      : "1px solid rgba(255,255,255,0.08)",
  };
}

const verificationPreviewCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "64px 1fr auto",
  alignItems: "center",
  gap: 12,
  borderRadius: 18,
  padding: 10,
  background: "rgba(15,23,42,0.58)",
  border: "1px solid rgba(250,204,21,0.2)",
};

const verificationHintStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(250,204,21,0.10)",
  border: "1px solid rgba(250,204,21,0.18)",
  color: "#fde68a",
  fontSize: 13,
  fontWeight: 850,
  lineHeight: 1.55,
};

const dismissDraftButtonStyle: CSSProperties = {
  minHeight: 38,
  borderRadius: 999,
  border: "1px solid rgba(147,197,253,0.34)",
  background: "rgba(15,23,42,0.54)",
  color: "#dbeafe",
  cursor: "pointer",
  fontWeight: 900,
  justifySelf: "start",
  padding: "0 14px",
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

function newsPreviewListStyle(count: number): CSSProperties {
  const shouldScroll = count > MAX_VISIBLE_NEWS;

  return {
    display: "grid",
    gap: 10,
    maxHeight: shouldScroll ? 430 : "none",
    overflowY: shouldScroll ? "auto" : "visible",
    paddingRight: shouldScroll ? 8 : 0,
    overscrollBehavior: "contain",
    scrollbarWidth: "thin",
  };
}

function totalCostBoxStyle(warning: boolean): CSSProperties {
  return {
    borderRadius: 22,
    padding: 16,
    background: warning ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.045)",
    border: warning
      ? "1px solid rgba(252,165,165,0.24)"
      : "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 12,
  };
}

const newsSelectionBoxStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 850,
  lineHeight: 1.55,
  display: "grid",
  gap: 10,
};

const newsScrollHintStyle: CSSProperties = {
  color: "#fde68a",
  fontSize: 12,
  fontWeight: 950,
};

const newsPreviewRowStyle: CSSProperties = {
  borderRadius: 16,
  padding: 12,
  background: "rgba(15,23,42,0.62)",
  border: "1px solid rgba(148,163,184,0.18)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 12,
  alignItems: "start",
};

const newsPreviewTextStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 14,
  lineHeight: 1.55,
  fontWeight: 850,
  whiteSpace: "pre-wrap",
};

const newsPreviewDateStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 800,
};

const creditsBuyBoxStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 12,
};

const wideCreditLinkStyle: CSSProperties = {
  minHeight: 54,
  borderRadius: 16,
  padding: "0 18px",
  background: "rgba(255,255,255,0.075)",
  border: "1px solid rgba(148,163,184,0.22)",
  color: "#ffffff",
  fontWeight: 950,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const costRowsStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const costRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  color: "#cbd5e1",
  fontSize: 14,
  fontWeight: 850,
};

const costTotalRowStyle: CSSProperties = {
  ...costRowStyle,
  borderTop: "1px solid rgba(255,255,255,0.1)",
  paddingTop: 10,
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 950,
};
