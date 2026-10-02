export type HelpArticle = {
  slug: string;
  category: string;
  title: string;
  description: string;
  intro: string;
  points: string[];
};

export const helpArticles: HelpArticle[] = [
  {
    "slug": "was-ist-mioseg-qr",
    "category": "Erste Schritte",
    "title": "Was ist Mioseg QR?",
    "description": "Mioseg QR verbindet die physische mit der digitalen Welt.",
    "intro": "Mioseg QR verbindet die physische mit der digitalen Welt. Mit einem Mioseg QR kannst du Gegenstände, Orte, Produkte und Projekte digital zugänglich machen. Hinterlege Informationen, Bilder, Dokumente, Kontaktdaten, Standorte oder Updates und ändere diese Inhalte später, ohne den bereits angebrachten QR-Code ersetzen zu müssen.",
    "points": [
      "Gleichzeitig ist Mioseg QR dein QR-Manager: QR-Codes scannen, speichern, organisieren und später wiederfinden.",
      "Ein dynamischer Mioseg QR bleibt als QR-Code gleich, während die dahinterliegenden Inhalte später geändert oder erweitert werden können.",
      "Normale Mioseg QR eignen sich für allgemeine dynamische Inhalte. Business QR ergänzen diese um Unternehmensprofil, Kontaktmöglichkeiten, Explore und optionale Verifizierung."
    ]
  },
  {
    "slug": "konto-erstellen-anmelden",
    "category": "Erste Schritte",
    "title": "Konto erstellen und anmelden",
    "description": "Verwalte eigene Mioseg QR und persönliche Funktionen dauerhaft.",
    "intro": "Für eigene Mioseg QR, Business-Funktionen und die dauerhafte Verwaltung persönlicher Inhalte benötigst du ein Mioseg-QR-Konto.",
    "points": [
      "Öffne Mioseg QR und wähle Registrieren. Gib die erforderlichen Angaben ein und schließe die Registrierung ab.",
      "Wenn du bereits ein Konto besitzt, wähle Anmelden und verwende deine Zugangsdaten.",
      "Im Profil-/Kontobereich kannst du die verfügbaren Profil-, Rechnungs- und Unternehmensdaten verwalten."
    ]
  },
  {
    "slug": "qr-code-scannen",
    "category": "Scannen & Organisieren",
    "title": "QR-Code mit der Kamera scannen",
    "description": "Scanne klassische QR-Codes und Mioseg QR direkt mit der Kamera.",
    "intro": "Öffne den Scanner, richte die Kamera auf den QR-Code und warte, bis Mioseg QR ihn erkennt. Anschließend kannst du das Ergebnis prüfen, öffnen oder speichern.",
    "points": [
      "Ein gespeicherter Scan kann später in Meine Scans wiedergefunden werden.",
      "Auch klassische QR-Codes, die nicht mit Mioseg QR erstellt wurden, können gescannt werden.",
      "Wird ein Mioseg QR geöffnet, können zusätzliche dynamische Inhalte wie Medien, Standort oder Updates angezeigt werden."
    ]
  },
  {
    "slug": "qr-code-aus-galerie",
    "category": "Scannen & Organisieren",
    "title": "QR-Code aus Foto oder Screenshot erkennen",
    "description": "Scanne QR-Codes, die bereits auf deinem Smartphone gespeichert sind.",
    "intro": "Ein QR-Code muss nicht vor der Kamera liegen. Über Aus Galerie auswählen kannst du ein Foto oder einen Screenshot mit QR-Code auswählen und erkennen lassen.",
    "points": [
      "Öffne den Scanner und wähle Aus Galerie auswählen.",
      "Wähle das Foto oder den Screenshot aus.",
      "Nach der Erkennung kannst du den Inhalt öffnen oder speichern. Besonders praktisch ist das bei QR-Codes aus E-Mails oder Messenger-Nachrichten auf demselben Smartphone."
    ]
  },
  {
    "slug": "meine-scans",
    "category": "Scannen & Organisieren",
    "title": "Meine Scans: speichern und wiederfinden",
    "description": "Ein Scan muss nicht nach wenigen Sekunden wieder verloren sein.",
    "intro": "Meine Scans ist deine persönliche Ablage für gespeicherte QR-Codes. Dort kannst du bereits gescannte Inhalte erneut öffnen und verwalten.",
    "points": [
      "Scannen → Speichern → Organisieren → Wiederfinden.",
      "Gespeicherte Scans können Ordnern zugeordnet und später erneut aufgerufen werden.",
      "So wird Mioseg QR vom Scanner zum persönlichen QR-Manager."
    ]
  },
  {
    "slug": "ordner-unterordner",
    "category": "Scannen & Organisieren",
    "title": "Ordner und Unterordner verwenden",
    "description": "Organisiere QR-Codes in einer Struktur, die zu dir passt.",
    "intro": "Mioseg QR unterstützt Ordner und verschachtelte Unterordner über mehrere Ebenen. Dadurch lassen sich auch umfangreiche private oder berufliche Sammlungen übersichtlich strukturieren.",
    "points": [
      "Beispiel: Firma → Baustellen → Köln → Projekt A → Elektro.",
      "Einträge können den verfügbaren Ordnern zugeordnet oder zwischen Ordnern verschoben werden.",
      "Kartenbezogene Bereiche können Ordner und deren Unterordner gemeinsam berücksichtigen."
    ]
  },
  {
    "slug": "mioseg-qr-erstellen",
    "category": "Mioseg QR",
    "title": "Eigenen Mioseg QR erstellen",
    "description": "Erstelle einen dauerhaft verwaltbaren digitalen Informationspunkt.",
    "intro": "Mit einem eigenen Mioseg QR erstellst du einen dynamischen QR-Code. Der QR-Code bleibt bestehen, während du die Inhalte dahinter später bearbeiten kannst.",
    "points": [
      "Wähle normalen Mioseg QR oder Business QR.",
      "Hinterlege Titel und gewünschte Inhalte wie Text, Medien, Dateien, Standort oder Updates.",
      "Prüfe Speicher- und Credit-Hinweise, speichere und erzeuge den QR-Code."
    ]
  },
  {
    "slug": "mioseg-qr-bearbeiten",
    "category": "Mioseg QR",
    "title": "Mioseg QR bearbeiten und aktualisieren",
    "description": "Ändere Inhalte, ohne den gedruckten QR-Code auszutauschen.",
    "intro": "Eigene Mioseg QR können nach der Erstellung weiterbearbeitet werden. Genau darin liegt der zentrale Vorteil des dynamischen QR-Codes.",
    "points": [
      "Öffne deinen Mioseg QR und wechsle in den Bearbeitungsmodus.",
      "Passe die verfügbaren Inhalte und Einstellungen an.",
      "Speichere die Änderungen. Die öffentliche Darstellung kann durch technische Zwischenspeicherung kurzzeitig noch den vorherigen Stand zeigen."
    ]
  },
  {
    "slug": "medien-dateien-updates",
    "category": "Mioseg QR",
    "title": "Medien, Dateien und News & Updates",
    "description": "Bündele Informationen direkt hinter deinem QR-Code.",
    "intro": "Mioseg QR kann Bilder, Dateien sowie Audio-/Videoinhalte und News & Updates bereitstellen.",
    "points": [
      "Bilder können als Galerie dargestellt und geöffnet werden.",
      "Dateien können zum Beispiel Anleitungen oder PDFs bereitstellen.",
      "News & Updates eignen sich für Änderungen, Wartungshinweise, Termine oder neue Dokumente. Die aktuelle Oberfläche ist auf bis zu fünf Update-Einträge ausgelegt."
    ]
  },
  {
    "slug": "standort-karte-navigation",
    "category": "Explore & Karte",
    "title": "Standort, Karte und Navigation",
    "description": "Verbinde digitale Informationen mit einem realen Ort.",
    "intro": "Ein Mioseg QR kann mit einem Standort und einer verständlichen Standortbezeichnung verknüpft werden.",
    "points": [
      "Bei Nutzung des Gerätestandorts benötigt die App die entsprechende Systemberechtigung.",
      "Die Karte kann eigene Mioseg QR, gespeicherte Mioseg QR und normale Scans darstellen.",
      "Ordnerfilter können einen Hauptordner zusammen mit seinen Unterordnern auf der Karte berücksichtigen."
    ]
  },
  {
    "slug": "business-qr",
    "category": "Business QR",
    "title": "Business QR erstellen und verwalten",
    "description": "Verbinde dynamische QR-Inhalte mit einem professionellen Unternehmensprofil.",
    "intro": "Business QR ergänzen die Mioseg-QR-Funktionen um geschäftliche Informationen und direkte Aktionen.",
    "points": [
      "Mögliche Angaben sind Firmenname, Logo, Titelbild, Kategorie, Website, Telefon, E-Mail und Standort.",
      "Zusätzlich können Social-Media-Profile, Medien, Dateien und Updates hinterlegt werden.",
      "Unternehmensinformationen können später geändert werden, ohne den QR-Code auszutauschen."
    ]
  },
  {
    "slug": "social-media",
    "category": "Business QR",
    "title": "Social Media im Business QR",
    "description": "Verlinke deine öffentlichen Unternehmensprofile direkt.",
    "intro": "Business QR können Profilangaben für Instagram, TikTok, YouTube, Facebook und LinkedIn enthalten.",
    "points": [
      "Es handelt sich um direkte Profilverknüpfungen.",
      "Eine externe Feed- oder API-Synchronisierung ist derzeit nicht Bestandteil der Funktion.",
      "Social-Media-Profillinks selbst kosten keine Credits."
    ]
  },
  {
    "slug": "explore",
    "category": "Explore & Karte",
    "title": "Explore und öffentliche Auffindbarkeit",
    "description": "Entdecke öffentliche Business QR auf der Karte.",
    "intro": "Explore ist der öffentliche Entdeckungsbereich von Mioseg QR. Dafür freigegebene Business QR können dort sichtbar und bei vorhandenem Standort über die Karte entdeckt werden.",
    "points": [
      "Nutzer können öffentliche Business QR öffnen und je nach verfügbaren Funktionen speichern, folgen oder Navigation verwenden.",
      "Kategorien und Kartenansicht helfen bei der Orientierung.",
      "Unternehmen entscheiden selbst, ob ihr Business QR in Explore erscheinen soll."
    ]
  },
  {
    "slug": "in-explore-anzeigen",
    "category": "Explore & Karte",
    "title": "„In Explore anzeigen“ verwenden",
    "description": "Bestimme selbst, ob dein Business QR öffentlich entdeckt werden kann.",
    "intro": "Die Einstellung In Explore anzeigen ist von der reinen Standortangabe getrennt.",
    "points": [
      "Ist sie aktiviert, kann der Business QR in Explore berücksichtigt werden.",
      "Ist sie deaktiviert, bleibt der Business QR über QR-Code bzw. direkten Link erreichbar, wird aber nicht in Explore gelistet.",
      "Bei neuen Business QR ist die Explore-Sichtbarkeit standardmäßig aktiviert und kann später geändert werden."
    ]
  },
  {
    "slug": "speichern-folgen",
    "category": "Mioseg QR",
    "title": "Mioseg QR speichern und folgen",
    "description": "Bleib mit interessanten dynamischen QR-Codes verbunden.",
    "intro": "Öffentliche Mioseg QR können je nach verfügbarer Funktion gespeichert bzw. verfolgt werden.",
    "points": [
      "Durch Speichern bleibt ein Mioseg QR im eigenen Konto leichter wiederauffindbar.",
      "Follow stellt eine dauerhafte Verbindung zu einem Mioseg QR her und ist für spätere relevante Aktualisierungen gedacht.",
      "Ein normaler Scan und ein gespeicherter dynamischer Mioseg QR erfüllen unterschiedliche Zwecke."
    ]
  },
  {
    "slug": "passwortschutz",
    "category": "Sicherheit",
    "title": "Mioseg QR mit Passwort schützen",
    "description": "Schütze Inhalte vor unmittelbarem öffentlichen Zugriff.",
    "intro": "Eigene Mioseg QR können mit einem Passwort geschützt werden. Besucher müssen dann das richtige Passwort eingeben, bevor sie den geschützten Inhalt öffnen können.",
    "points": [
      "Der Passwortschutz eignet sich für Inhalte, die nicht für jeden unmittelbar sichtbar sein sollen.",
      "Er ersetzt keine vollständige Rechte- oder Dokumentenmanagementlösung.",
      "Explore-Sichtbarkeit und Passwortschutz sind unterschiedliche Funktionen."
    ]
  },
  {
    "slug": "business-verifizierung",
    "category": "Business QR",
    "title": "Business-Verifizierung",
    "description": "Zeige Besuchern einen geprüften Verifizierungsstatus.",
    "intro": "Für einen Business QR kann eine Verifizierung beantragt werden. Sie soll zeigen, dass die dafür eingereichten Informationen und unterstützenden Nachweise geprüft wurden.",
    "points": [
      "Die Verifizierungsanfrage wird über die vorgesehene Business-Funktion eingereicht.",
      "Nach erfolgreicher Prüfung wird der Business QR als verifiziert gekennzeichnet.",
      "Die Verifizierung kostet nach dem aktuellen Modell zusätzlich 10 Credits."
    ]
  },
  {
    "slug": "mioseg-qr-uebertragen",
    "category": "Teilen & Übertragen",
    "title": "Mioseg QR übertragen",
    "description": "Übertrage einen bestehenden digitalen Informationspunkt an einen anderen Nutzer.",
    "intro": "Eigene Mioseg QR können an einen anderen Nutzer übertragen werden. Der physische QR-Code kann dabei bestehen bleiben.",
    "points": [
      "Typische Fälle sind Eigentümer-, Projekt- oder Verantwortungswechsel.",
      "Die Detailansicht enthält Transferstatus und Transferhistorie.",
      "Vor einer Übertragung sollten Rechte an Inhalten sowie vertrauliche oder personenbezogene Informationen geprüft werden."
    ]
  },
  {
    "slug": "credits-speicher",
    "category": "Credits & Speicher",
    "title": "Credits und Speicher",
    "description": "Verstehe, wann Credits benötigt werden.",
    "intro": "Mioseg QR verwendet Credits für bestimmte Erstellungs-, Speicher- und Zusatzfunktionen. Einfache Aufrufe, Speichern und Follow sind nach dem aktuellen Modell kostenlos.",
    "points": [
      "Erster normaler Mioseg QR: kostenlos; weitere normale: 5 Credits.",
      "Erster Business QR: 2 Credits; weitere Business QR: 7 Credits; Verifizierung: +10 Credits.",
      "Je Mioseg QR sind 2 MB enthalten. Weitere 5 MB kosten 1 Credit. Die endgültige Speicherberechnung erfolgt serverseitig beim Upload."
    ]
  },
  {
    "slug": "eigene-qrs-verwalten",
    "category": "Mioseg QR",
    "title": "Eigene und gespeicherte Mioseg QR verwalten",
    "description": "Behalte eigene und gespeicherte Inhalte auseinander.",
    "intro": "Mioseg QR unterscheidet zwischen eigenen QR-Einträgen und Mioseg QR, die von anderen erstellt und in deinem Konto gespeichert wurden.",
    "points": [
      "Für die persönliche Darstellung kann ein Alias verwendet werden; dieser ändert nur deine eigene Ansicht.",
      "Eigene Mioseg QR können gelöscht werden.",
      "Gespeicherte Mioseg QR anderer Nutzer werden aus deiner gespeicherten Liste entfernt, ohne den ursprünglichen Mioseg QR zu löschen."
    ]
  },
  {
    "slug": "qr-speichern-teilen",
    "category": "Teilen & Übertragen",
    "title": "QR-Code speichern, teilen und anbringen",
    "description": "Bring die digitale Information an den physischen Ort.",
    "intro": "Der zu einem eigenen Mioseg QR erzeugte QR-Code kann gespeichert bzw. geteilt und anschließend beispielsweise auf einem Aufkleber, Schild, Dokument, Produkt oder Gerät verwendet werden.",
    "points": [
      "Damit wird ein physischer Gegenstand oder Ort mit dem digitalen Mioseg-QR-Inhalt verbunden.",
      "Spätere Inhaltsänderungen erfordern normalerweise keinen neuen gedruckten QR-Code."
    ]
  },
  {
    "slug": "oeffentliche-webseite",
    "category": "Mioseg QR",
    "title": "Öffentliche Mioseg-QR-Seite im Web",
    "description": "Öffne freigegebene Inhalte auch außerhalb der App.",
    "intro": "Ein Mioseg QR kann über seinen QR-Code oder direkten Link als öffentliche Webansicht geöffnet werden.",
    "points": [
      "Je nach QR können Titel, Beschreibung, Business-Profil, Medien, Dateien, Updates, Standort und Kontaktaktionen erscheinen.",
      "Passwortgeschützte Mioseg QR zeigen vor dem Inhalt eine Passwortabfrage.",
      "Die konkrete Darstellung hängt vom jeweiligen QR-Typ und den hinterlegten Inhalten ab."
    ]
  },
  {
    "slug": "anwendungsbeispiele",
    "category": "Erste Schritte",
    "title": "Typische Anwendungsbeispiele",
    "description": "Von Maschine und Immobilie bis zur privaten QR-Sammlung.",
    "intro": "Mioseg QR kann physische Gegenstände, Orte, Produkte und Projekte dauerhaft mit digitalen Informationen verbinden.",
    "points": [
      "Maschine: Anleitungen, technische Daten, Wartung und Service direkt am Gerät.",
      "Immobilie: Exposé, Bilder, Dokumente, Standort und Kontakt.",
      "Produkt, Gastronomie, Baustelle oder private Sammlung: Inhalte aktuell halten bzw. gescannte QR-Codes strukturiert wiederfinden."
    ]
  },
  {
    "slug": "problemloesungen",
    "category": "Problemlösungen",
    "title": "Problemlösungen",
    "description": "Schnelle Hilfe bei häufigen Fragen.",
    "intro": "Viele Probleme lassen sich durch wenige Prüfungen eingrenzen.",
    "points": [
      "QR wird nicht erkannt: Beleuchtung, Abstand und vollständige Sichtbarkeit prüfen; alternativ Screenshot/Galerie verwenden.",
      "Business QR fehlt in Explore: Einstellung In Explore anzeigen prüfen.",
      "Änderung noch nicht sichtbar: Speichern prüfen und kurze technische Zwischenspeicherung berücksichtigen. Bei Standortproblemen die Systemberechtigung prüfen."
    ]
  },
  {
    "slug": "sicherheit-datenschutz",
    "category": "Sicherheit",
    "title": "Sichtbarkeit, Sicherheit und Datenschutz verstehen",
    "description": "Explore-Sichtbarkeit und Zugriffsschutz sind nicht dasselbe.",
    "intro": "Mioseg QR bietet unterschiedliche Funktionen für Auffindbarkeit und Zugriff.",
    "points": [
      "Ein Business QR ohne Explore-Sichtbarkeit ist nicht automatisch privat: Wer den direkten Link oder QR-Code besitzt, kann die öffentliche Seite weiterhin erreichen.",
      "Passwortschutz steuert den Zugang zum geschützten Inhalt.",
      "Veröffentliche nur Inhalte, für deren Bereitstellung du berechtigt bist."
    ]
  }
];

export const helpCategories = [
  "Erste Schritte",
  "Scannen & Organisieren",
  "Mioseg QR",
  "Business QR",
  "Explore & Karte",
  "Teilen & Übertragen",
  "Sicherheit",
  "Credits & Speicher",
  "Problemlösungen",
];

export function getHelpArticle(slug: string) {
  return helpArticles.find((article) => article.slug === slug);
}
