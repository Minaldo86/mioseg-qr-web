"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import CollectionPreview, { type QrxCollectionPreviewItem } from "@/components/qrx/CollectionPreview";
import QrxActionsSection from "@/components/qrx/QrxActionsSection";
import QrxHeroSection from "@/components/qrx/QrxHeroSection";
import QrxMediaSection, { type QrxMediaDisplayItem } from "@/components/qrx/QrxMediaSection";
import QrxNewsSection from "@/components/qrx/QrxNewsSection";
import QrxStatsSection from "@/components/qrx/QrxStatsSection";
import { getBestMediaUrl, getMediaById } from "@/lib/media";
import { supabase } from "@/lib/supabase";
import styles from "../../dashboard/dashboard.module.css";

type PublicLocale = "de" | "en" | "tr" | "pl" | "ar" | "fr" | "es" | "it";
const PUBLIC_TEXT = {
  "de": {
    "home": "Startseite",
    "explore": "Explore",
    "loading": "QR-X wird geladen …",
    "back": "← Zurück zur Sammlung „{{title}}“",
    "location": "Standort",
    "category": "Kategorie",
    "created": "Erstellt",
    "phone": "Telefon",
    "website": "Webseite öffnen",
    "email": "E-Mail schreiben",
    "navigation": "Navigation öffnen",
    "followers": "Follower",
    "media": "Medien",
    "updates": "Updates",
    "user": "Nutzer",
    "users": "Nutzern",
    "transferHint": "Verlauf der QR-X-Übertragungen für diesen QR-X.",
    "reload": "Neu laden",
    "reloading": "Lädt …",
    "recipient": "Empfänger",
    "from": "Von",
    "to": "An",
    "accepted": "Angenommen",
    "expires": "Ablauf",
    "noTransfer": "Noch kein Transfer-Verlauf vorhanden.",
    "noTransferHint": "Wenn dieser QR-X übertragen wird, erscheint der Verlauf hier.",
    "login": "Bitte melde dich an, um diesem QR-X zu folgen.",
    "saveError": "Folgen konnte nicht geändert werden.",
    "missing": "QR-X ID fehlt.",
    "notFound": "Dieser QR-X wurde nicht gefunden.",
    "unavailable": "Dieser QR-X ist aktuell nicht verfügbar.",
    "loadError": "QR-X konnte nicht geladen werden.",
    "copy": "QR-X Link kopieren",
    "defaultDesc": "QR-X auf mioseg qr",
    "statsAria": "QR-X Kennzahlen",
    "categories": {
      "praxis_gesundheit": "Praxis & Gesundheit",
      "gastronomie": "Gastronomie",
      "unternehmen": "Unternehmen",
      "dienstleistung": "Dienstleistung",
      "handwerk": "Handwerk",
      "event": "Event",
      "verein": "Verein",
      "wohltaetigkeit": "Wohltätigkeit",
      "sehenswuerdigkeit": "Sehenswürdigkeit",
      "sonstiges": "Sonstiges"
    },
    "hero": {
      "business": "Business QR-X",
      "normal": "Normaler QR-X",
      "verified": "Verifiziert"
    },
    "actions": {
      "aria": "QR-X Aktionen",
      "own": "Eigener QR-X",
      "followed": "Gefolgt",
      "follow": "Folgen",
      "ownHint": "QR-X auf mioseg qr",
      "savedHint": "QR-X auf mioseg qr",
      "followHint": "QR-X auf mioseg qr",
      "loginHint": "Bitte melde dich an, um diesem QR-X zu folgen.",
      "wait": "Lädt …",
      "savedBy": "{{count}}",
      "image": "QR-X",
      "imageHint": "QR-X auf mioseg qr",
      "qrAlt": "QR-X {{title}}",
      "download": "Herunterladen",
      "copy": "QR-X Link kopieren"
    },
    "news": {
      "title": "News & Updates",
      "hint": "Aktuelle Informationen und Änderungen dieses QR-X.",
      "count": "{{count}} Updates",
      "empty": "Noch keine Updates vorhanden.",
      "emptyHint": "Wenn der Ersteller neue Informationen hinzufügt, erscheinen sie hier."
    },
    "mediaLabels": {
      "title": "Medien",
      "hint": "QR-X auf mioseg qr",
      "count": "{{count}} Medien",
      "images": "Bilder",
      "imageAlt": "QR-X",
      "files": "Dateien",
      "openFile": "Öffnen",
      "open": "Öffnen",
      "download": "Herunterladen"
    },
    "preview": {
      "untitled": "QR-X",
      "business": "Business QR-X",
      "normal": "Normaler QR-X",
      "collection": "Sammlung",
      "one": "Eintrag",
      "many": "Einträge",
      "verified": "Verifiziert",
      "part": "Sammlung",
      "open": "Öffnen →"
    }
  },
  "en": {
    "home": "Home",
    "explore": "Explore",
    "loading": "Loading QR-X …",
    "back": "← Back to collection “{{title}}”",
    "location": "Location",
    "category": "Category",
    "created": "Created",
    "phone": "Phone",
    "website": "Open website",
    "email": "Send email",
    "navigation": "Open navigation",
    "followers": "Followers",
    "media": "Media",
    "updates": "Updates",
    "user": "user",
    "users": "users",
    "transferHint": "History of QR-X transfers for this QR-X.",
    "reload": "Reload",
    "reloading": "Loading …",
    "recipient": "Recipient",
    "from": "From",
    "to": "To",
    "accepted": "Accepted",
    "expires": "Expires",
    "noTransfer": "No transfer history yet.",
    "noTransferHint": "When this QR-X is transferred, the history will appear here.",
    "login": "Please sign in to follow this QR-X.",
    "saveError": "Follow status could not be changed.",
    "missing": "QR-X ID is missing.",
    "notFound": "This QR-X was not found.",
    "unavailable": "This QR-X is currently unavailable.",
    "loadError": "QR-X could not be loaded.",
    "copy": "Copy QR-X link",
    "defaultDesc": "QR-X on mioseg qr",
    "statsAria": "QR-X statistics",
    "categories": {
      "praxis_gesundheit": "Practice & Health",
      "gastronomie": "Gastronomy",
      "unternehmen": "Company",
      "dienstleistung": "Service",
      "handwerk": "Craft & Trade",
      "event": "Event",
      "verein": "Association",
      "wohltaetigkeit": "Charity",
      "sehenswuerdigkeit": "Attraction",
      "sonstiges": "Other"
    },
    "hero": {
      "business": "Business QR-X",
      "normal": "Normal QR-X",
      "verified": "Verified"
    },
    "actions": {
      "aria": "QR-X actions",
      "own": "Your QR-X",
      "followed": "Following",
      "follow": "Follow",
      "ownHint": "QR-X on mioseg qr",
      "savedHint": "QR-X on mioseg qr",
      "followHint": "QR-X on mioseg qr",
      "loginHint": "Please sign in to follow this QR-X.",
      "wait": "Loading …",
      "savedBy": "{{count}}",
      "image": "QR-X",
      "imageHint": "QR-X on mioseg qr",
      "qrAlt": "QR-X {{title}}",
      "download": "Download",
      "copy": "Copy QR-X link"
    },
    "news": {
      "title": "News & Updates",
      "hint": "QR-X on mioseg qr",
      "count": "{{count}} items",
      "empty": "No transfer history yet.",
      "emptyHint": "When this QR-X is transferred, the history will appear here."
    },
    "mediaLabels": {
      "title": "Media",
      "hint": "QR-X on mioseg qr",
      "count": "{{count}} Media",
      "images": "Images",
      "imageAlt": "QR-X",
      "files": "Files",
      "openFile": "Open",
      "open": "Open",
      "download": "Download"
    },
    "preview": {
      "untitled": "QR-X",
      "business": "Business QR-X",
      "normal": "Normal QR-X",
      "collection": "Collection",
      "one": "item",
      "many": "items",
      "verified": "Verified",
      "part": "Collection",
      "open": "Open →"
    }
  },
  "tr": {
    "home": "Ana sayfa",
    "explore": "Keşfet",
    "loading": "QR-X yükleniyor …",
    "back": "← “{{title}}” koleksiyonuna dön",
    "location": "Konum",
    "category": "Kategori",
    "created": "Oluşturuldu",
    "phone": "Telefon",
    "website": "Web sitesini aç",
    "email": "E-posta gönder",
    "navigation": "Navigasyonu aç",
    "followers": "Takipçiler",
    "media": "Medya",
    "updates": "Güncellemeler",
    "user": "kullanıcı",
    "users": "kullanıcı",
    "transferHint": "Bu QR-X için QR-X aktarım geçmişi.",
    "reload": "Yeniden yükle",
    "reloading": "Yükleniyor …",
    "recipient": "Alıcı",
    "from": "Kimden",
    "to": "Kime",
    "accepted": "Kabul edildi",
    "expires": "Bitiş",
    "noTransfer": "Henüz aktarım geçmişi yok.",
    "noTransferHint": "Bu QR-X aktarıldığında geçmiş burada görünür.",
    "login": "Bu QR-X'i takip etmek için giriş yap.",
    "saveError": "Takip durumu değiştirilemedi.",
    "missing": "QR-X kimliği eksik.",
    "notFound": "Bu QR-X bulunamadı.",
    "unavailable": "Bu QR-X şu anda kullanılamıyor.",
    "loadError": "QR-X yüklenemedi.",
    "copy": "QR-X bağlantısını kopyala",
    "defaultDesc": "mioseg qr üzerinde QR-X",
    "statsAria": "QR-X istatistikleri",
    "categories": {
      "praxis_gesundheit": "Sağlık & Muayenehane",
      "gastronomie": "Gastronomi",
      "unternehmen": "Şirket",
      "dienstleistung": "Hizmet",
      "handwerk": "Zanaat",
      "event": "Etkinlik",
      "verein": "Dernek",
      "wohltaetigkeit": "Hayır kurumu",
      "sehenswuerdigkeit": "Gezilecek yer",
      "sonstiges": "Diğer"
    },
    "hero": {
      "business": "Business QR-X",
      "normal": "Normal QR-X",
      "verified": "Doğrulandı"
    },
    "actions": {
      "aria": "QR-X Aktionen",
      "own": "Kendi QR-X'in",
      "followed": "Takip ediliyor",
      "follow": "Takip et",
      "ownHint": "mioseg qr üzerinde QR-X",
      "savedHint": "mioseg qr üzerinde QR-X",
      "followHint": "mioseg qr üzerinde QR-X",
      "loginHint": "Bu QR-X'i takip etmek için giriş yap.",
      "wait": "Yükleniyor …",
      "savedBy": "{{count}}",
      "image": "QR-X",
      "imageHint": "mioseg qr üzerinde QR-X",
      "qrAlt": "QR-X {{title}}",
      "download": "İndir",
      "copy": "QR-X bağlantısını kopyala"
    },
    "news": {
      "title": "News & Updates",
      "hint": "mioseg qr üzerinde QR-X",
      "count": "{{count}} öğe",
      "empty": "Henüz aktarım geçmişi yok.",
      "emptyHint": "Bu QR-X aktarıldığında geçmiş burada görünür."
    },
    "mediaLabels": {
      "title": "Medya",
      "hint": "mioseg qr üzerinde QR-X",
      "count": "{{count}} Medya",
      "images": "Görseller",
      "imageAlt": "QR-X",
      "files": "Dosyalar",
      "openFile": "Aç",
      "open": "Aç",
      "download": "İndir"
    },
    "preview": {
      "untitled": "QR-X",
      "business": "Business QR-X",
      "normal": "Normal QR-X",
      "collection": "Koleksiyon",
      "one": "öğe",
      "many": "öğe",
      "verified": "Doğrulandı",
      "part": "Koleksiyon",
      "open": "Aç →"
    }
  },
  "pl": {
    "home": "Strona główna",
    "explore": "Odkrywaj",
    "loading": "Ładowanie QR-X …",
    "back": "← Wróć do kolekcji „{{title}}”",
    "location": "Lokalizacja",
    "category": "Kategoria",
    "created": "Utworzono",
    "phone": "Telefon",
    "website": "Otwórz stronę",
    "email": "Napisz e-mail",
    "navigation": "Otwórz nawigację",
    "followers": "Obserwujący",
    "media": "Media",
    "updates": "Aktualizacje",
    "user": "użytkownik",
    "users": "użytkowników",
    "transferHint": "Historia transferów tego QR-X.",
    "reload": "Odśwież",
    "reloading": "Ładowanie …",
    "recipient": "Odbiorca",
    "from": "Od",
    "to": "Do",
    "accepted": "Zaakceptowano",
    "expires": "Wygasa",
    "noTransfer": "Brak historii transferów.",
    "noTransferHint": "Po przeniesieniu tego QR-X historia pojawi się tutaj.",
    "login": "Zaloguj się, aby obserwować ten QR-X.",
    "saveError": "Nie udało się zmienić obserwowania.",
    "missing": "Brak ID QR-X.",
    "notFound": "Nie znaleziono tego QR-X.",
    "unavailable": "Ten QR-X jest obecnie niedostępny.",
    "loadError": "Nie udało się załadować QR-X.",
    "copy": "Kopiuj link QR-X",
    "defaultDesc": "QR-X w mioseg qr",
    "statsAria": "Statystyki QR-X",
    "categories": {
      "praxis_gesundheit": "Praktyka i zdrowie",
      "gastronomie": "Gastronomia",
      "unternehmen": "Firma",
      "dienstleistung": "Usługi",
      "handwerk": "Rzemiosło",
      "event": "Wydarzenie",
      "verein": "Stowarzyszenie",
      "wohltaetigkeit": "Dobroczynność",
      "sehenswuerdigkeit": "Atrakcja",
      "sonstiges": "Inne"
    },
    "hero": {
      "business": "Business QR-X",
      "normal": "Normalny QR-X",
      "verified": "Zweryfikowano"
    },
    "actions": {
      "aria": "QR-X Aktionen",
      "own": "Twój QR-X",
      "followed": "Obserwowany",
      "follow": "Obserwuj",
      "ownHint": "QR-X w mioseg qr",
      "savedHint": "QR-X w mioseg qr",
      "followHint": "QR-X w mioseg qr",
      "loginHint": "Zaloguj się, aby obserwować ten QR-X.",
      "wait": "Ładowanie …",
      "savedBy": "{{count}}",
      "image": "QR-X",
      "imageHint": "QR-X w mioseg qr",
      "qrAlt": "QR-X {{title}}",
      "download": "Pobierz",
      "copy": "Kopiuj link QR-X"
    },
    "news": {
      "title": "News & Updates",
      "hint": "QR-X w mioseg qr",
      "count": "{{count}} elementów",
      "empty": "Brak historii transferów.",
      "emptyHint": "Po przeniesieniu tego QR-X historia pojawi się tutaj."
    },
    "mediaLabels": {
      "title": "Media",
      "hint": "QR-X w mioseg qr",
      "count": "{{count}} Media",
      "images": "Obrazy",
      "imageAlt": "QR-X",
      "files": "Pliki",
      "openFile": "Otwórz",
      "open": "Otwórz",
      "download": "Pobierz"
    },
    "preview": {
      "untitled": "QR-X",
      "business": "Business QR-X",
      "normal": "Normalny QR-X",
      "collection": "Kolekcja",
      "one": "element",
      "many": "elementów",
      "verified": "Zweryfikowano",
      "part": "Kolekcja",
      "open": "Otwórz →"
    }
  },
  "ar": {
    "home": "الرئيسية",
    "explore": "استكشاف",
    "loading": "جارٍ تحميل QR-X …",
    "back": "العودة إلى المجموعة «{{title}}» →",
    "location": "الموقع",
    "category": "الفئة",
    "created": "تاريخ الإنشاء",
    "phone": "الهاتف",
    "website": "فتح الموقع",
    "email": "إرسال بريد إلكتروني",
    "navigation": "فتح الملاحة",
    "followers": "المتابعون",
    "media": "الوسائط",
    "updates": "التحديثات",
    "user": "مستخدم",
    "users": "مستخدمين",
    "transferHint": "سجل عمليات نقل QR-X لهذا العنصر.",
    "reload": "إعادة التحميل",
    "reloading": "جارٍ التحميل …",
    "recipient": "المستلم",
    "from": "من",
    "to": "إلى",
    "accepted": "تم القبول",
    "expires": "انتهاء الصلاحية",
    "noTransfer": "لا يوجد سجل نقل بعد.",
    "noTransferHint": "عند نقل QR-X هذا سيظهر السجل هنا.",
    "login": "سجّل الدخول لمتابعة QR-X هذا.",
    "saveError": "تعذر تغيير حالة المتابعة.",
    "missing": "معرّف QR-X مفقود.",
    "notFound": "لم يتم العثور على QR-X هذا.",
    "unavailable": "QR-X هذا غير متاح حاليًا.",
    "loadError": "تعذر تحميل QR-X.",
    "copy": "نسخ رابط QR-X",
    "defaultDesc": "QR-X على mioseg qr",
    "statsAria": "إحصاءات QR-X",
    "categories": {
      "praxis_gesundheit": "الصحة والعيادات",
      "gastronomie": "المطاعم",
      "unternehmen": "شركة",
      "dienstleistung": "خدمات",
      "handwerk": "حِرف",
      "event": "فعالية",
      "verein": "جمعية",
      "wohltaetigkeit": "خيري",
      "sehenswuerdigkeit": "معلم سياحي",
      "sonstiges": "أخرى"
    },
    "hero": {
      "business": "QR-X للأعمال",
      "normal": "QR-X عادي",
      "verified": "موثّق"
    },
    "actions": {
      "aria": "QR-X Aktionen",
      "own": "QR-X الخاص بك",
      "followed": "تتم المتابعة",
      "follow": "متابعة",
      "ownHint": "QR-X على mioseg qr",
      "savedHint": "QR-X على mioseg qr",
      "followHint": "QR-X على mioseg qr",
      "loginHint": "سجّل الدخول لمتابعة QR-X هذا.",
      "wait": "جارٍ التحميل …",
      "savedBy": "{{count}}",
      "image": "QR-X",
      "imageHint": "QR-X على mioseg qr",
      "qrAlt": "QR-X {{title}}",
      "download": "تنزيل",
      "copy": "نسخ رابط QR-X"
    },
    "news": {
      "title": "News & Updates",
      "hint": "QR-X على mioseg qr",
      "count": "{{count}} عناصر",
      "empty": "لا يوجد سجل نقل بعد.",
      "emptyHint": "عند نقل QR-X هذا سيظهر السجل هنا."
    },
    "mediaLabels": {
      "title": "الوسائط",
      "hint": "QR-X على mioseg qr",
      "count": "{{count}} الوسائط",
      "images": "الصور",
      "imageAlt": "QR-X",
      "files": "الملفات",
      "openFile": "فتح",
      "open": "فتح",
      "download": "تنزيل"
    },
    "preview": {
      "untitled": "QR-X",
      "business": "QR-X للأعمال",
      "normal": "QR-X عادي",
      "collection": "مجموعة",
      "one": "عنصر",
      "many": "عناصر",
      "verified": "موثّق",
      "part": "مجموعة",
      "open": "فتح →"
    }
  },
  "fr": {
    "home": "Accueil",
    "explore": "Explorer",
    "loading": "Chargement du QR-X …",
    "back": "← Retour à la collection « {{title}} »",
    "location": "Lieu",
    "category": "Catégorie",
    "created": "Créé",
    "phone": "Téléphone",
    "website": "Ouvrir le site",
    "email": "Envoyer un e-mail",
    "navigation": "Ouvrir la navigation",
    "followers": "Abonnés",
    "media": "Médias",
    "updates": "Mises à jour",
    "user": "utilisateur",
    "users": "utilisateurs",
    "transferHint": "Historique des transferts de ce QR-X.",
    "reload": "Actualiser",
    "reloading": "Chargement …",
    "recipient": "Destinataire",
    "from": "De",
    "to": "À",
    "accepted": "Accepté",
    "expires": "Expiration",
    "noTransfer": "Aucun historique de transfert.",
    "noTransferHint": "Lorsque ce QR-X sera transféré, l’historique apparaîtra ici.",
    "login": "Connectez-vous pour suivre ce QR-X.",
    "saveError": "Le suivi n’a pas pu être modifié.",
    "missing": "L’identifiant QR-X est manquant.",
    "notFound": "Ce QR-X est introuvable.",
    "unavailable": "Ce QR-X est actuellement indisponible.",
    "loadError": "Impossible de charger le QR-X.",
    "copy": "Copier le lien QR-X",
    "defaultDesc": "QR-X sur mioseg qr",
    "statsAria": "Statistiques QR-X",
    "categories": {
      "praxis_gesundheit": "Cabinet & santé",
      "gastronomie": "Gastronomie",
      "unternehmen": "Entreprise",
      "dienstleistung": "Service",
      "handwerk": "Artisanat",
      "event": "Événement",
      "verein": "Association",
      "wohltaetigkeit": "Caritatif",
      "sehenswuerdigkeit": "Site touristique",
      "sonstiges": "Autre"
    },
    "hero": {
      "business": "QR-X Business",
      "normal": "QR-X normal",
      "verified": "Vérifié"
    },
    "actions": {
      "aria": "QR-X Aktionen",
      "own": "Votre QR-X",
      "followed": "Suivi",
      "follow": "Suivre",
      "ownHint": "QR-X sur mioseg qr",
      "savedHint": "QR-X sur mioseg qr",
      "followHint": "QR-X sur mioseg qr",
      "loginHint": "Connectez-vous pour suivre ce QR-X.",
      "wait": "Chargement …",
      "savedBy": "{{count}}",
      "image": "QR-X",
      "imageHint": "QR-X sur mioseg qr",
      "qrAlt": "QR-X {{title}}",
      "download": "Télécharger",
      "copy": "Copier le lien QR-X"
    },
    "news": {
      "title": "News & Updates",
      "hint": "QR-X sur mioseg qr",
      "count": "{{count}} éléments",
      "empty": "Aucun historique de transfert.",
      "emptyHint": "Lorsque ce QR-X sera transféré, l’historique apparaîtra ici."
    },
    "mediaLabels": {
      "title": "Médias",
      "hint": "QR-X sur mioseg qr",
      "count": "{{count}} Médias",
      "images": "Images",
      "imageAlt": "QR-X",
      "files": "Fichiers",
      "openFile": "Ouvrir",
      "open": "Ouvrir",
      "download": "Télécharger"
    },
    "preview": {
      "untitled": "QR-X",
      "business": "QR-X Business",
      "normal": "QR-X normal",
      "collection": "Collection",
      "one": "élément",
      "many": "éléments",
      "verified": "Vérifié",
      "part": "Collection",
      "open": "Ouvrir →"
    }
  },
  "es": {
    "home": "Inicio",
    "explore": "Explorar",
    "loading": "Cargando QR-X …",
    "back": "← Volver a la colección «{{title}}»",
    "location": "Ubicación",
    "category": "Categoría",
    "created": "Creado",
    "phone": "Teléfono",
    "website": "Abrir sitio web",
    "email": "Enviar e-mail",
    "navigation": "Abrir navegación",
    "followers": "Seguidores",
    "media": "Medios",
    "updates": "Actualizaciones",
    "user": "usuario",
    "users": "usuarios",
    "transferHint": "Historial de transferencias de este QR-X.",
    "reload": "Recargar",
    "reloading": "Cargando …",
    "recipient": "Destinatario",
    "from": "De",
    "to": "A",
    "accepted": "Aceptado",
    "expires": "Caduca",
    "noTransfer": "Todavía no hay historial de transferencias.",
    "noTransferHint": "Cuando se transfiera este QR-X, el historial aparecerá aquí.",
    "login": "Inicia sesión para seguir este QR-X.",
    "saveError": "No se pudo cambiar el seguimiento.",
    "missing": "Falta el ID de QR-X.",
    "notFound": "No se encontró este QR-X.",
    "unavailable": "Este QR-X no está disponible actualmente.",
    "loadError": "No se pudo cargar el QR-X.",
    "copy": "Copiar enlace QR-X",
    "defaultDesc": "QR-X en mioseg qr",
    "statsAria": "Estadísticas QR-X",
    "categories": {
      "praxis_gesundheit": "Consulta y salud",
      "gastronomie": "Gastronomía",
      "unternehmen": "Empresa",
      "dienstleistung": "Servicio",
      "handwerk": "Oficios",
      "event": "Evento",
      "verein": "Asociación",
      "wohltaetigkeit": "Beneficencia",
      "sehenswuerdigkeit": "Atracción",
      "sonstiges": "Otros"
    },
    "hero": {
      "business": "QR-X Business",
      "normal": "QR-X normal",
      "verified": "Verificado"
    },
    "actions": {
      "aria": "QR-X Aktionen",
      "own": "Tu QR-X",
      "followed": "Siguiendo",
      "follow": "Seguir",
      "ownHint": "QR-X en mioseg qr",
      "savedHint": "QR-X en mioseg qr",
      "followHint": "QR-X en mioseg qr",
      "loginHint": "Inicia sesión para seguir este QR-X.",
      "wait": "Cargando …",
      "savedBy": "{{count}}",
      "image": "QR-X",
      "imageHint": "QR-X en mioseg qr",
      "qrAlt": "QR-X {{title}}",
      "download": "Descargar",
      "copy": "Copiar enlace QR-X"
    },
    "news": {
      "title": "News & Updates",
      "hint": "QR-X en mioseg qr",
      "count": "{{count}} elementos",
      "empty": "Todavía no hay historial de transferencias.",
      "emptyHint": "Cuando se transfiera este QR-X, el historial aparecerá aquí."
    },
    "mediaLabels": {
      "title": "Medios",
      "hint": "QR-X en mioseg qr",
      "count": "{{count}} Medios",
      "images": "Imágenes",
      "imageAlt": "QR-X",
      "files": "Archivos",
      "openFile": "Abrir",
      "open": "Abrir",
      "download": "Descargar"
    },
    "preview": {
      "untitled": "QR-X",
      "business": "QR-X Business",
      "normal": "QR-X normal",
      "collection": "Colección",
      "one": "elemento",
      "many": "elementos",
      "verified": "Verificado",
      "part": "Colección",
      "open": "Abrir →"
    }
  },
  "it": {
    "home": "Home",
    "explore": "Esplora",
    "loading": "Caricamento QR-X …",
    "back": "← Torna alla raccolta «{{title}}»",
    "location": "Posizione",
    "category": "Categoria",
    "created": "Creato",
    "phone": "Telefono",
    "website": "Apri sito web",
    "email": "Invia e-mail",
    "navigation": "Apri navigazione",
    "followers": "Follower",
    "media": "Media",
    "updates": "Aggiornamenti",
    "user": "utente",
    "users": "utenti",
    "transferHint": "Cronologia dei trasferimenti di questo QR-X.",
    "reload": "Ricarica",
    "reloading": "Caricamento …",
    "recipient": "Destinatario",
    "from": "Da",
    "to": "A",
    "accepted": "Accettato",
    "expires": "Scadenza",
    "noTransfer": "Nessuna cronologia dei trasferimenti.",
    "noTransferHint": "Quando questo QR-X verrà trasferito, la cronologia apparirà qui.",
    "login": "Accedi per seguire questo QR-X.",
    "saveError": "Impossibile modificare lo stato di seguito.",
    "missing": "ID QR-X mancante.",
    "notFound": "Questo QR-X non è stato trovato.",
    "unavailable": "Questo QR-X non è attualmente disponibile.",
    "loadError": "Impossibile caricare il QR-X.",
    "copy": "Copia link QR-X",
    "defaultDesc": "QR-X su mioseg qr",
    "statsAria": "Statistiche QR-X",
    "categories": {
      "praxis_gesundheit": "Studio e salute",
      "gastronomie": "Gastronomia",
      "unternehmen": "Azienda",
      "dienstleistung": "Servizio",
      "handwerk": "Artigianato",
      "event": "Evento",
      "verein": "Associazione",
      "wohltaetigkeit": "Beneficenza",
      "sehenswuerdigkeit": "Attrazione",
      "sonstiges": "Altro"
    },
    "hero": {
      "business": "QR-X Business",
      "normal": "QR-X normale",
      "verified": "Verificato"
    },
    "actions": {
      "aria": "QR-X Aktionen",
      "own": "Il tuo QR-X",
      "followed": "Seguito",
      "follow": "Segui",
      "ownHint": "QR-X su mioseg qr",
      "savedHint": "QR-X su mioseg qr",
      "followHint": "QR-X su mioseg qr",
      "loginHint": "Accedi per seguire questo QR-X.",
      "wait": "Caricamento …",
      "savedBy": "{{count}}",
      "image": "QR-X",
      "imageHint": "QR-X su mioseg qr",
      "qrAlt": "QR-X {{title}}",
      "download": "Scarica",
      "copy": "Copia link QR-X"
    },
    "news": {
      "title": "News & Updates",
      "hint": "QR-X su mioseg qr",
      "count": "{{count}} elementi",
      "empty": "Nessuna cronologia dei trasferimenti.",
      "emptyHint": "Quando questo QR-X verrà trasferito, la cronologia apparirà qui."
    },
    "mediaLabels": {
      "title": "Media",
      "hint": "QR-X su mioseg qr",
      "count": "{{count}} Media",
      "images": "Immagini",
      "imageAlt": "QR-X",
      "files": "File",
      "openFile": "Apri",
      "open": "Apri",
      "download": "Scarica"
    },
    "preview": {
      "untitled": "QR-X",
      "business": "QR-X Business",
      "normal": "QR-X normale",
      "collection": "Raccolta",
      "one": "elemento",
      "many": "elementi",
      "verified": "Verificato",
      "part": "Raccolta",
      "open": "Apri →"
    }
  }
} as const;
function normalizePublicLocale(value:string):PublicLocale{return ["de","en","tr","pl","ar","fr","es","it"].includes(value)?value as PublicLocale:"de";}

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

type NewsItem = {
  text: string;
  createdAt: string;
};

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

function getBusinessCategoryMeta(value: string | null | undefined) {
  if (!value) return null;
  return BUSINESS_CATEGORY_OPTIONS.find((item) => item.value === value) ?? null;
}

type QrxEntry = {
  id: string;
  owner_user_id: string | null;
  title: string | null;
  company_name: string | null;
  description: string | null;
  news: NewsItem[] | null;
  type: "normal" | "business" | string | null;
  category: string | null;
  verified: boolean | null;
  suspended: boolean | null;
  deleted_at: string | null;
  cover_image_url: string | null;
  cover_media_id?: string | null;
  logo_url: string | null;
  logo_media_id?: string | null;
  force_original_quality?: boolean | null;
  location_name: string | null;
  cta_phone: string | null;
  cta_website: string | null;
  cta_email: string | null;
  cta_navigation: string | null;
  views_total: number | null;
  follower_count: number | null;
  created_at: string | null;
};

type MediaAnalyticsEvent =
  "image_view" | "file_open" | "file_download" | "variant_delivery";

type MediaVariant = "thumb" | "medium" | "large" | "original";

type QrxMedia = {
  id: string;
  type: "image" | "file" | string;
  url: string;
  filename: string | null;
  bytes?: number | null;
  original_url?: string | null;
  large_url?: string | null;
  medium_url?: string | null;
  thumb_url?: string | null;
};

type TransferHistoryItem = {
  id?: string;
  transfer_id?: string;
  qrx_id?: string;
  status?: string;
  created_at?: string;
  accepted_at?: string | null;
  expires_at?: string | null;
  from_user_id?: string | null;
  from_name?: string | null;
  to_user_id?: string | null;
  to_name?: string | null;
  recipient_email?: string | null;
};


function getParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim())
    return value[0];
  return fallback;
}

function getDisplayTitle(entry: QrxEntry | null) {
  if (!entry) return "QR-X";
  return entry.company_name?.trim() || entry.title?.trim() || "QR-X";
}

function getSubtitleTitle(entry: QrxEntry | null) {
  if (!entry) return null;
  const company = entry.company_name?.trim();
  const title = entry.title?.trim();

  if (company && title && company !== title) return title;
  return null;
}

function normalizeUrl(value: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeNavigationUrl(value: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

function formatNumber(value: number | null | undefined, locale = "de") {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "0";

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.max(0, numberValue));
}

function formatDate(value: string | null | undefined, locale = "de") {
  if (!value) return "–";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "–";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeNewsItems(value: NewsItem[] | null | undefined) {
  const raw = Array.isArray(value) ? value : [];

  return raw
    .filter(
      (item) => typeof item?.text === "string" && item.text.trim().length > 0,
    )
    .map((item, index) => ({
      id: `${item.createdAt ?? "news"}-${index}`,
      text: item.text.trim(),
      createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
    }))
    .sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
    });
}

function getAnalyticsSessionId() {
  if (typeof window === "undefined") return null;

  const storageKey = "mioseg_qrx_media_session_id";
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.sessionStorage.setItem(storageKey, generated);
  return generated;
}

function getMediaVariant(
  mediaItem: QrxMedia,
  purpose: "gallery" | "fullscreen",
  forceOriginal: boolean,
): MediaVariant {
  if (forceOriginal) return "original";

  if (purpose === "gallery") {
    if (mediaItem.medium_url) return "medium";
    if (mediaItem.large_url) return "large";
    if (mediaItem.thumb_url) return "thumb";
    return "original";
  }

  if (mediaItem.large_url) return "large";
  if (mediaItem.medium_url) return "medium";
  if (mediaItem.thumb_url) return "thumb";
  return "original";
}

function shouldTrackMediaEvent(
  eventType: MediaAnalyticsEvent,
  mediaId: string,
  variant: MediaVariant,
) {
  if (typeof window === "undefined") return false;

  const key = `mioseg_media_event:${eventType}:${mediaId}:${variant}`;
  const now = Date.now();
  const previous = Number(window.sessionStorage.getItem(key) ?? 0);
  const dedupeWindowMs = 30 * 60 * 1000;

  if (Number.isFinite(previous) && now - previous < dedupeWindowMs) {
    return false;
  }

  window.sessionStorage.setItem(key, String(now));
  return true;
}

export default function PublicQrxDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = getParam(
    params?.locale as string | string[] | undefined,
    "de",
  );
  const ui = PUBLIC_TEXT[normalizePublicLocale(locale)];
  const qrxId = getParam(params?.id as string | string[] | undefined, "");
  const parentQrxId = searchParams.get("parentQrxId");
  const parentQrxTitle = searchParams.get("parentQrxTitle");

  const [entry, setEntry] = useState<QrxEntry | null>(null);
  const [media, setMedia] = useState<QrxMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveCount, setSaveCount] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>(
    [],
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [collectionItems, setCollectionItems] = useState<QrxCollectionPreviewItem[]>([]);

  useEffect(() => {
    void loadQrx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrxId]);

  async function loadQrx() {
    setLoading(true);
    setErrorText(null);

    try {
      if (!qrxId) throw new Error(ui.missing);

      const { data: userData } = await supabase.auth.getUser();
      setCurrentUserId(userData.user?.id ?? null);

      const { data, error } = await supabase
        .from("qr_x_entries")
        .select(
          "id,owner_user_id,title,company_name,description,news,type,category,verified,suspended,deleted_at,cover_image_url,cover_media_id,logo_url,logo_media_id,force_original_quality,location_name,cta_phone,cta_website,cta_email,cta_navigation,views_total,follower_count,created_at",
        )
        .eq("id", qrxId)
        .maybeSingle()
        .returns<QrxEntry>();

      if (error) throw error;
      if (!data || data.deleted_at)
        throw new Error(ui.notFound);
      if (data.suspended)
        throw new Error(ui.unavailable);

      setEntry(data);

      const { data: mediaData, error: mediaError } = await supabase
        .from("qr_x_media")
        .select(
          "id,type,url,filename,bytes,original_url,large_url,medium_url,thumb_url",
        )
        .eq("qrx_id", qrxId)
        .returns<QrxMedia[]>();

      if (mediaError) {
        console.warn("QR-X media load error:", mediaError);
        setMedia([]);
      } else {
        setMedia(mediaData ?? []);
      }

      const { data: collectionRows, error: collectionError } = await supabase
        .from("qrx_collection_items")
        .select("linked_qrx_id,sort_order,custom_title")
        .eq("collection_qrx_id", qrxId)
        .order("sort_order", { ascending: true });

      if (collectionError) {
        console.warn("QR-X collection rows load error:", collectionError);
        setCollectionItems([]);
      } else {
        const rows = (collectionRows ?? []) as Array<{
          linked_qrx_id: string;
          sort_order: number | null;
          custom_title: string | null;
        }>;

        const linkedIds = rows
          .map((row) => row.linked_qrx_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0);

        if (linkedIds.length === 0) {
          setCollectionItems([]);
        } else {
          const { data: childEntries, error: childError } = await supabase
            .from("qr_x_entries")
            .select(
              "id,title,company_name,description,type,logo_url,cover_image_url,location_name,verified,deleted_at,suspended",
            )
            .in("id", linkedIds)
            .is("deleted_at", null)
            .or("suspended.is.null,suspended.eq.false");

          if (childError) {
            console.warn("QR-X collection children load error:", childError);
            setCollectionItems([]);
          } else {
            const childrenById = new Map(
              ((childEntries ?? []) as Array<
                QrxCollectionPreviewItem & {
                  deleted_at?: string | null;
                  suspended?: boolean | null;
                }
              >).map((child) => [child.id, child]),
            );

            const items = rows.reduce<QrxCollectionPreviewItem[]>(
              (accumulator, row) => {
                const child = childrenById.get(row.linked_qrx_id);

                if (!child || child.deleted_at || child.suspended === true) {
                  return accumulator;
                }

                accumulator.push({
                  id: child.id,
                  title: child.title ?? null,
                  company_name: child.company_name ?? null,
                  description: child.description ?? null,
                  type: child.type ?? null,
                  logo_url: child.logo_url ?? null,
                  cover_image_url: child.cover_image_url ?? null,
                  location_name: child.location_name ?? null,
                  verified: child.verified ?? null,
                  custom_title: row.custom_title ?? null,
                });

                return accumulator;
              },
              [],
            );

            setCollectionItems(items);
          }
        }
      }
    } catch (error) {
      setEntry(null);
      setMedia([]);
      setCollectionItems([]);
      setErrorText(
        error instanceof Error
          ? error.message
          : ui.loadError,
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSaveInfo(qrxIdInner: string, userId: string | null) {
    try {
      setSaveLoading(true);

      if (userId) {
        const { data, error } = await supabase.rpc("qrx_save_info", {
          p_qrx_id: qrxIdInner,
        });

        if (!error && Array.isArray(data) && data.length > 0) {
          setSaveCount(Number(data[0]?.total_count ?? 0));
          setHasSaved(Boolean(data[0]?.has_saved));
          return;
        }
      }

      const { count } = await supabase
        .from("qrx_saves")
        .select("*", { count: "exact", head: true })
        .eq("qrx_id", qrxIdInner);

      setSaveCount(typeof count === "number" ? count : 0);

      if (userId) {
        const { data: savedRow } = await supabase
          .from("qrx_saves")
          .select("qrx_id")
          .eq("qrx_id", qrxIdInner)
          .eq("user_id", userId)
          .maybeSingle();

        setHasSaved(Boolean(savedRow));
      } else {
        setHasSaved(false);
      }
    } catch (error) {
      console.warn("qrx save info load error:", error);
      setSaveCount(entry?.follower_count ?? 0);
      setHasSaved(false);
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleToggleSave() {
    if (!qrxId) return;

    if (!currentUserId) {
      setErrorText(ui.login);
      return;
    }

    if (entry?.owner_user_id && entry.owner_user_id === currentUserId) {
      setErrorText(null);
      return;
    }

    try {
      setSaveLoading(true);
      setErrorText(null);

      if (hasSaved) {
        const { error } = await supabase
          .from("qrx_saves")
          .delete()
          .eq("qrx_id", qrxId)
          .eq("user_id", currentUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("qrx_saves")
          .upsert(
            { qrx_id: qrxId, user_id: currentUserId },
            { onConflict: "qrx_id,user_id" },
          );

        if (error) throw error;
      }

      await loadSaveInfo(qrxId, currentUserId);
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : ui.saveError,
      );
    } finally {
      setSaveLoading(false);
    }
  }

  async function loadTransferHistory(qrxIdInner: string) {
    try {
      setHistoryLoading(true);

      const { data, error } = await supabase.rpc("get_qrx_transfer_history", {
        p_qrx_id: qrxIdInner,
      });

      if (error) {
        console.warn("get_qrx_transfer_history error:", error);
        setTransferHistory([]);
        return;
      }

      const list = (data ?? []) as TransferHistoryItem[];
      setTransferHistory(
        [...list].sort((a, b) => {
          const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
          const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
          return tb - ta;
        }),
      );
    } catch (error) {
      console.warn("transfer history load error:", error);
      setTransferHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  function getPublicQrxUrl() {
    if (!qrxId) return "";
    if (typeof window === "undefined")
      return `https://mioseg-qr.com/qrx/${qrxId}`;
    return `${window.location.origin}/qrx/${qrxId}`;
  }

  async function handleCopyPublicLink() {
    const url = getPublicQrxUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(ui.copy, url);
    }
  }

  async function trackMediaEvent(
    eventType: MediaAnalyticsEvent,
    mediaItem: QrxMedia,
    variant: MediaVariant,
  ) {
    if (!qrxId || !mediaItem.id) return;
    if (!shouldTrackMediaEvent(eventType, mediaItem.id, variant)) return;

    try {
      await fetch("/api/media/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: eventType,
          qrx_id: qrxId,
          media_id: mediaItem.id,
          media_type: mediaItem.type,
          variant,
          session_id: getAnalyticsSessionId(),
          source: "web_qrx_detail",
        }),
        keepalive: true,
      });
    } catch (error) {
      console.warn("media analytics tracking error:", error);
    }
  }

  function handleImageOpen(mediaItem: QrxMedia) {
    const variant = getMediaVariant(
      mediaItem,
      "fullscreen",
      forceOriginalQuality,
    );
    void trackMediaEvent("image_view", mediaItem, variant);
  }

  function handleFileOpen(mediaItem: QrxMedia) {
    void trackMediaEvent("file_open", mediaItem, "original");
  }

  function handleFileDownload(mediaItem: QrxMedia) {
    void trackMediaEvent("file_download", mediaItem, "original");
  }

  async function handleDownloadQrImage() {
    const url = getPublicQrxUrl();
    if (!url) return;

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&margin=28&data=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `mioseg-qrx-${qrxId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(qrImageUrl, "_blank", "noopener,noreferrer");
    }
  }

  useEffect(() => {
    if (!entry?.id) return;
    void loadSaveInfo(entry.id, currentUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id, currentUserId]);

  useEffect(() => {
    if (!entry?.id || !currentUserId || entry.owner_user_id !== currentUserId)
      return;
    void loadTransferHistory(entry.id);
  }, [entry?.id, entry?.owner_user_id, currentUserId]);

  const title = getDisplayTitle(entry);
  const subtitleTitle = getSubtitleTitle(entry);
  const description =
    entry?.description?.trim() ||
    entry?.location_name?.trim() ||
    ui.defaultDesc;
  const forceOriginalQuality = Boolean(entry?.force_original_quality);
  const coverMedia = getMediaById(media, entry?.cover_media_id);
  const logoMedia = getMediaById(media, entry?.logo_media_id);
  const cover =
    getBestMediaUrl({
      media: coverMedia,
      purpose: "hero",
      forceOriginal: forceOriginalQuality,
    }) ||
    entry?.cover_image_url?.trim() ||
    null;
  const logo =
    getBestMediaUrl({
      media: logoMedia,
      purpose: "medium",
      forceOriginal: forceOriginalQuality,
    }) ||
    entry?.logo_url?.trim() ||
    null;
  const isBusiness = entry?.type === "business";
  const website = normalizeUrl(entry?.cta_website ?? null);
  const navigation = normalizeNavigationUrl(entry?.cta_navigation ?? null);
  const rawCategoryMeta = getBusinessCategoryMeta(entry?.category);
  const categoryMeta = rawCategoryMeta && entry?.category ? { ...rawCategoryMeta, label: ui.categories[entry.category as keyof typeof ui.categories] ?? rawCategoryMeta.label } : rawCategoryMeta;
  const newsItems = useMemo(
    () => normalizeNewsItems(entry?.news),
    [entry?.news],
  );
  const imageMedia = media.filter((item) => {
    const isLogoById =
      !!entry?.logo_media_id && item.id === entry.logo_media_id;
    const isCoverById =
      !!entry?.cover_media_id && item.id === entry.cover_media_id;
    const urls = [
      item.url,
      item.original_url,
      item.large_url,
      item.medium_url,
      item.thumb_url,
    ];
    return (
      item.type === "image" &&
      !isLogoById &&
      !isCoverById &&
      !urls.includes(logo) &&
      !urls.includes(cover)
    );
  });
  const fileMedia = media.filter((item) => item.type === "file");
  const isOwner = Boolean(
    entry?.owner_user_id &&
    currentUserId &&
    entry.owner_user_id === currentUserId,
  );
  const publicQrxUrl = qrxId
    ? typeof window === "undefined"
      ? `https://mioseg-qr.com/qrx/${qrxId}`
      : `${window.location.origin}/qrx/${qrxId}`
    : "";
  const qrImageUrl = publicQrxUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=18&data=${encodeURIComponent(publicQrxUrl)}`
    : "";

  const imageDisplayItems: QrxMediaDisplayItem[] = imageMedia.map((item) => ({
    id: item.id,
    type: item.type,
    url: item.url,
    filename: item.filename,
    displayUrl:
      getBestMediaUrl({
        media: item,
        purpose: "gallery",
        forceOriginal: forceOriginalQuality,
      }) || item.url,
    fullscreenUrl:
      getBestMediaUrl({
        media: item,
        purpose: "fullscreen",
        forceOriginal: forceOriginalQuality,
      }) || item.url,
  }));

  const fileDisplayItems: QrxMediaDisplayItem[] = fileMedia.map((item) => ({
    id: item.id,
    type: item.type,
    url: item.url,
    filename: item.filename,
    displayUrl: item.url,
    fullscreenUrl: item.url,
  }));

  const stats = [
    {
      label: ui.followers,
      value: formatNumber(saveCount ?? entry?.follower_count, locale),
      icon: "👥",
    },
    {
      label: ui.media,
      value: formatNumber(media.length, locale),
      icon: "🖼️",
    },
    {
      label: ui.updates,
      value: formatNumber(newsItems.length, locale),
      icon: "📰",
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href={`/${locale}`} className={styles.brand}>
          <img src="/logo-wwhite.png" alt="Mioseg qr Logo" />
        </Link>
        <nav className={styles.nav} aria-label="QR-X Navigation">
          <Link href={`/${locale}`}>{ui.home}</Link>
          <Link href={`/${locale}/explore`}>{ui.explore}</Link>
        </nav>
      </header>

      <section style={panelStyle}>
        {loading ? <div style={loadingStyle}>{ui.loading}</div> : null}
        {!loading && errorText ? (
          <div style={errorStyle}>{errorText}</div>
        ) : null}

        {!loading && entry ? (
          <>
            {parentQrxId && parentQrxTitle ? (
              <Link
                href={`/${locale}/qrx/${parentQrxId}`}
                style={collectionBackLinkStyle}
              >
                {ui.back.replace("{{title}}", parentQrxTitle)}
              </Link>
            ) : null}

            <QrxHeroSection
              title={title}
              subtitleTitle={subtitleTitle}
              description={description}
              cover={cover}
              logo={logo}
              isBusiness={isBusiness}
              categoryMeta={categoryMeta}
              verified={entry.verified === true}
              labels={ui.hero}
            />

            <QrxStatsSection stats={stats} ariaLabel={ui.statsAria} />

            <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
              {entry.location_name?.trim() ? (
                <InfoRow title={`📍 ${ui.location}`} text={entry.location_name.trim()} />
              ) : null}

              {categoryMeta ? (
                <InfoRow title={`▦ ${ui.category}`} text={`${categoryMeta.icon} ${categoryMeta.label}`} />
              ) : null}

              {entry.created_at ? <InfoRow title={`🕒 ${ui.created}`} text={formatDate(entry.created_at, locale)} /> : null}

              {isBusiness ? (
                <div style={ctaGridStyle}>
                  {entry.cta_phone?.trim() ? <a href={`tel:${entry.cta_phone.trim()}`} className={styles.primaryButton}>{ui.phone}</a> : null}
                  {website ? <a href={website} target="_blank" rel="noreferrer" className={styles.secondaryButton}>{ui.website}</a> : null}
                  {entry.cta_email?.trim() ? <a href={`mailto:${entry.cta_email.trim()}`} className={styles.secondaryButton}>{ui.email}</a> : null}
                  {navigation ? <a href={navigation} target="_blank" rel="noreferrer" className={styles.secondaryButton}>{ui.navigation}</a> : null}
                </div>
              ) : null}
            </div>

            <QrxActionsSection
              isOwner={isOwner}
              hasSaved={hasSaved}
              currentUserId={currentUserId}
              saveLoading={saveLoading}
              followerCount={`${formatNumber(saveCount ?? entry.follower_count, locale)} Nutzer${Number(saveCount ?? entry.follower_count ?? 0) === 1 ? "" : "n"}`}
              qrImageUrl={qrImageUrl}
              title={title}
              onToggleSave={handleToggleSave}
              onDownloadQr={handleDownloadQrImage}
              onCopyLink={handleCopyPublicLink}
              labels={ui.actions}
            />
          </>
        ) : null}
      </section>

      {!loading && entry ? (
        <QrxNewsSection items={newsItems} formatDate={(value) => formatDate(value, locale)} labels={ui.news} />
      ) : null}

      {!loading && entry && collectionItems.length > 0 ? (
        <section style={panelStyle}>
          <CollectionPreview
            parentQrxId={entry.id}
            parentQrxTitle={title}
            items={collectionItems}
            locale={locale}
            labels={ui.preview}
          />
        </section>
      ) : null}

      {!loading && entry && isOwner ? (
        <section style={panelStyle}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Transfer</h2>
              <p>{ui.transferHint}</p>
            </div>
            <button
              type="button"
              onClick={() => loadTransferHistory(entry.id)}
              className={styles.secondaryButton}
              style={{ border: 0 }}
            >
              {historyLoading ? ui.reloading : ui.reload}
            </button>
          </div>

          {transferHistory.length > 0 ? (
            <div style={transferListStyle}>
              {transferHistory.map((item, index) => (
                <article
                  key={
                    item.id ?? item.transfer_id ?? `${item.created_at}-${index}`
                  }
                  style={transferCardStyle}
                >
                  <div style={transferTopLineStyle}>
                    <strong>{item.status ?? "Transfer"}</strong>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  {item.recipient_email ? (
                    <span>{ui.recipient}: {item.recipient_email}</span>
                  ) : null}
                  {item.from_name ? <span>{ui.from}: {item.from_name}</span> : null}
                  {item.to_name ? <span>{ui.to}: {item.to_name}</span> : null}
                  {item.accepted_at ? (
                    <span>{ui.accepted}: {formatDate(item.accepted_at, locale)}</span>
                  ) : null}
                  {item.expires_at ? (
                    <span>{ui.expires}: {formatDate(item.expires_at, locale)}</span>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <strong>{ui.noTransfer}</strong>
              <span>
                {ui.noTransferHint}
              </span>
            </div>
          )}
        </section>
      ) : null}

      {!loading ? (
        <QrxMediaSection
          imageItems={imageDisplayItems}
          fileItems={fileDisplayItems}
          totalCount={media.length}
          onImageOpen={(id) => {
            const item = media.find((mediaItem) => mediaItem.id === id);
            if (item) handleImageOpen(item);
          }}
          onFileOpen={(id) => {
            const item = media.find((mediaItem) => mediaItem.id === id);
            if (item) handleFileOpen(item);
          }}
          labels={ui.mediaLabels}
          onFileDownload={(id) => {
            const item = media.find((mediaItem) => mediaItem.id === id);
            if (item) handleFileDownload(item);
          }}
        />
      ) : null}
    </main>
  );
}

function InfoRow({ title, text }: { title: string; text: string }) {
  return (
    <div style={infoRowStyle}>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

const collectionBackLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 42,
  marginBottom: 14,
  borderRadius: 999,
  padding: "0 14px",
  background: "rgba(37,99,235,0.14)",
  border: "1px solid rgba(147,197,253,0.22)",
  color: "#dbeafe",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 950,
};

const panelStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 18px",
  borderRadius: 30,
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  boxShadow: "0 22px 62px rgba(0, 0, 0, 0.17)",
  padding: 22,
};

const loadingStyle: CSSProperties = {
  minHeight: 220,
  display: "grid",
  placeItems: "center",
  color: "#cbd5e1",
  fontWeight: 950,
};

const errorStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(252, 165, 165, 0.22)",
  color: "#fecaca",
  fontWeight: 850,
  lineHeight: 1.55,
};

const coverStyle: CSSProperties = {
  minHeight: 360,
  borderRadius: 28,
  overflow: "hidden",
  position: "relative",
  background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.7))",
};

const coverImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 360,
  objectFit: "cover",
  display: "block",
};

const coverPlaceholderStyle: CSSProperties = {
  minHeight: 360,
  display: "grid",
  placeItems: "center",
  color: "rgba(255,255,255,0.18)",
  fontSize: 72,
  fontWeight: 950,
};

const coverOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(6,12,21,0.1) 0%, rgba(6,12,21,0.88) 100%)",
};

const coverContentStyle: CSSProperties = {
  position: "absolute",
  left: 24,
  right: 24,
  bottom: 24,
  display: "flex",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const logoStyle: CSSProperties = {
  width: 92,
  height: 92,
  objectFit: "cover",
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.24)",
  background: "#fff",
};

const badgeRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 10,
};

function badgeStyle(isBusiness: boolean): CSSProperties {
  return {
    minHeight: 32,
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "0 10px",
    background: isBusiness ? "#fff7ed" : "#ecfdf3",
    color: isBusiness ? "#9a4f00" : "#166534",
    fontSize: 12,
    fontWeight: 950,
    border: isBusiness ? "1px solid #fed7aa" : "1px solid #bbf7d0",
  };
}

const categoryBadgeStyle: CSSProperties = {
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(59,130,246,0.18)",
  color: "#dbeafe",
  fontSize: 12,
  fontWeight: 950,
  border: "1px solid rgba(147,197,253,0.28)",
};

const verifiedBadgeStyle: CSSProperties = {
  minHeight: 32,
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "0 10px",
  background: "rgba(13,23,38,0.86)",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 950,
  border: "1px solid rgba(255,255,255,0.18)",
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  color: "#fff",
  fontSize: 42,
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: "-0.04em",
};

const subtitleTitleStyle: CSSProperties = {
  marginTop: 8,
  color: "#bfdbfe",
  fontSize: 16,
  fontWeight: 950,
};

const heroDescriptionStyle: CSSProperties = {
  margin: "10px 0 0",
  color: "#dbeafe",
  lineHeight: 1.6,
  maxWidth: 760,
};

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const statCardStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const statIconStyle: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.08)",
  fontSize: 20,
};

const statValueStyle: CSSProperties = {
  display: "block",
  color: "#ffffff",
  fontSize: 22,
  fontWeight: 950,
};

const statLabelStyle: CSSProperties = {
  display: "block",
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 850,
};

const infoRowStyle: CSSProperties = {
  display: "grid",
  gap: 5,
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
};

const ctaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const newsListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const newsCardStyle: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  display: "grid",
  gap: 8,
};

const newsDateStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 950,
};

const newsTextStyle: CSSProperties = {
  margin: 0,
  color: "#dbeafe",
  lineHeight: 1.65,
  fontWeight: 750,
  whiteSpace: "pre-wrap",
};

const emptyStateStyle: CSSProperties = {
  borderRadius: 22,
  padding: 18,
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#94a3b8",
  display: "grid",
  gap: 6,
};

const sectionSubTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  color: "#ffffff",
  fontSize: 18,
  fontWeight: 950,
};

const galleryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const galleryItemStyle: CSSProperties = {
  display: "block",
  borderRadius: 22,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.105)",
  background: "rgba(255,255,255,0.055)",
};

const galleryImageStyle: CSSProperties = {
  width: "100%",
  height: 190,
  objectFit: "cover",
  display: "block",
};

const fileListStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const fileItemStyle: CSSProperties = {
  minHeight: 54,
  borderRadius: 18,
  padding: "0 14px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  fontWeight: 900,
};

const fileActionRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const fileActionLinkStyle: CSSProperties = {
  color: "#bfdbfe",
  textDecoration: "none",
  fontWeight: 950,
};

const actionsLayoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
  marginTop: 20,
};

const followBoxStyle: CSSProperties = {
  borderRadius: 24,
  padding: 18,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(147,197,253,0.22)",
  display: "grid",
  gap: 14,
};

const qrDownloadBoxStyle: CSSProperties = {
  borderRadius: 24,
  padding: 18,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.09)",
  display: "grid",
  gap: 14,
};

const boxTitleStyle: CSSProperties = {
  margin: "0 0 6px",
  color: "#ffffff",
  fontSize: 20,
  fontWeight: 950,
};

const boxHintStyle: CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  lineHeight: 1.55,
  fontSize: 13,
  fontWeight: 760,
};

const saveCountStyle: CSSProperties = {
  color: "#bfdbfe",
  fontSize: 13,
  fontWeight: 900,
};

const qrImageStyle: CSSProperties = {
  width: 180,
  height: 180,
  borderRadius: 22,
  background: "#ffffff",
  padding: 12,
  justifySelf: "center",
};

const qrButtonRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const transferListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const transferCardStyle: CSSProperties = {
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#cbd5e1",
  display: "grid",
  gap: 6,
  fontSize: 13,
  fontWeight: 800,
};

const transferTopLineStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  color: "#ffffff",
};
