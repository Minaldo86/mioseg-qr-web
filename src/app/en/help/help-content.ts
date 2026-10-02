export type HelpArticle = { slug:string; category:string; title:string; description:string; intro:string; points:string[]; };
export const helpArticles: HelpArticle[] = [
  {
    "slug": "what-is-mioseg-qr",
    "category": "Getting started",
    "title": "What is Mioseg QR?",
    "description": "Mioseg QR connects the physical and digital world.",
    "intro": "Mioseg QR connects the physical and digital world. With a Mioseg QR, you can make objects, places, products and projects digitally accessible. Add information, images, documents, contact details, locations or updates and change them later without replacing the QR code that is already in use.",
    "points": [
      "At the same time, Mioseg QR is your QR manager: scan, save, organize and find QR codes again later.",
      "A dynamic Mioseg QR stays the same as a QR code while the content behind it can be changed or expanded later.",
      "Regular Mioseg QR are designed for general dynamic content. Business QR add a company profile, contact options, Explore and optional verification."
    ]
  },
  {
    "slug": "create-account-sign-in",
    "category": "Getting started",
    "title": "Create an account and sign in",
    "description": "Manage your Mioseg QR and personal features over time.",
    "intro": "You need a Mioseg QR account to create and manage your own Mioseg QR, use Business features and keep personal content connected to your account.",
    "points": [
      "Open Mioseg QR and choose Register. Enter the required information and complete registration.",
      "If you already have an account, choose Sign in and use your login details.",
      "Available profile, billing and business information can be managed in the profile/account area."
    ]
  },
  {
    "slug": "scan-qr-code",
    "category": "Scan & organize",
    "title": "Scan a QR code with the camera",
    "description": "Scan standard QR codes and Mioseg QR directly with your camera.",
    "intro": "Open the scanner, point the camera at the QR code and wait for Mioseg QR to recognize it. You can then review, open or save the result.",
    "points": [
      "A saved scan can be found again later in My Scans.",
      "Standard QR codes that were not created with Mioseg QR can also be scanned.",
      "When a Mioseg QR is opened, additional dynamic content such as media, location information or updates may be displayed."
    ]
  },
  {
    "slug": "scan-qr-from-gallery",
    "category": "Scan & organize",
    "title": "Scan a QR code from a photo or screenshot",
    "description": "Recognize QR codes that are already stored on your phone.",
    "intro": "A QR code does not have to be in front of the camera. Use Select from gallery to choose a photo or screenshot containing a QR code.",
    "points": [
      "Open the scanner and choose Select from gallery.",
      "Choose the photo or screenshot containing the QR code.",
      "After recognition, you can open or save the result. This is especially useful for QR codes received by email or messenger on the same phone."
    ]
  },
  {
    "slug": "my-scans",
    "category": "Scan & organize",
    "title": "My Scans: save and find QR codes again",
    "description": "A useful QR code should not disappear after a single scan.",
    "intro": "My Scans is your personal collection of saved QR codes. It lets you reopen and manage content you scanned earlier.",
    "points": [
      "Scan → Save → Organize → Find again.",
      "Saved scans can be assigned to folders and reopened later.",
      "This turns Mioseg QR from a simple scanner into your personal QR manager."
    ]
  },
  {
    "slug": "folders-subfolders",
    "category": "Scan & organize",
    "title": "Use folders and subfolders",
    "description": "Organize QR codes in a structure that fits your needs.",
    "intro": "Mioseg QR supports folders and nested subfolders across multiple levels, making both small personal collections and larger work structures easier to manage.",
    "points": [
      "Example: Company → Sites → Cologne → Project A → Electrical.",
      "Entries can be assigned to available folders or moved between folders.",
      "Map-related areas can take a folder and its nested subfolders into account."
    ]
  },
  {
    "slug": "create-mioseg-qr",
    "category": "Mioseg QR",
    "title": "Create your own Mioseg QR",
    "description": "Create a digital information point you can manage over time.",
    "intro": "With your own Mioseg QR, you create a dynamic QR code. The QR code can remain in place while you update the content behind it later.",
    "points": [
      "Choose a regular Mioseg QR or a Business QR.",
      "Add a title and the content you need, such as text, media, files, location information or updates.",
      "Review storage and Credit information, save your entry and generate the QR code."
    ]
  },
  {
    "slug": "edit-mioseg-qr",
    "category": "Mioseg QR",
    "title": "Edit and update a Mioseg QR",
    "description": "Change content without replacing the printed QR code.",
    "intro": "Your own Mioseg QR can be edited after creation. This is one of the key benefits of a dynamic QR code.",
    "points": [
      "Open your Mioseg QR and enter edit mode.",
      "Update the available content and settings.",
      "Save your changes. Due to technical caching, the public page may briefly show the previous version."
    ]
  },
  {
    "slug": "media-files-updates",
    "category": "Mioseg QR",
    "title": "Media, files and News & Updates",
    "description": "Keep useful information together behind one QR code.",
    "intro": "Mioseg QR can provide images, files, audio/video content and News & Updates.",
    "points": [
      "Images can be displayed in a gallery and opened by visitors.",
      "Files can provide documents such as manuals or PDFs.",
      "News & Updates are useful for changes, maintenance notices, dates or new documents. The current interface supports up to five update entries."
    ]
  },
  {
    "slug": "location-map-navigation",
    "category": "Explore & map",
    "title": "Location, map and navigation",
    "description": "Connect digital information to a real-world place.",
    "intro": "A Mioseg QR can be linked to a location and a clear location label.",
    "points": [
      "If the app uses your device location, the relevant system permission is required.",
      "The map can display your own Mioseg QR, saved Mioseg QR and regular scans.",
      "Folder filters can include a main folder together with its nested subfolders."
    ]
  },
  {
    "slug": "business-qr",
    "category": "Business QR",
    "title": "Create and manage a Business QR",
    "description": "Combine dynamic QR content with a professional business profile.",
    "intro": "Business QR extend Mioseg QR with business information and direct actions.",
    "points": [
      "Possible details include company name, logo, cover image, category, website, phone, email and location.",
      "Social media profiles, media, files and updates can also be added.",
      "Business information can be updated later without replacing the QR code."
    ]
  },
  {
    "slug": "social-media",
    "category": "Business QR",
    "title": "Social media in Business QR",
    "description": "Link directly to your public business profiles.",
    "intro": "Business QR can include profile links for Instagram, TikTok, YouTube, Facebook and LinkedIn.",
    "points": [
      "These are direct links to social profiles.",
      "External social feeds or API synchronization are not currently part of this feature.",
      "Social profile links themselves do not cost Credits."
    ]
  },
  {
    "slug": "explore",
    "category": "Explore & map",
    "title": "Explore and public discovery",
    "description": "Discover public Business QR on the map.",
    "intro": "Explore is Mioseg QR's public discovery area. Business QR that are enabled for Explore can appear there and, when a location is available, can be discovered on the map.",
    "points": [
      "Users can open public Business QR and, depending on available features, save, follow or use navigation.",
      "Categories and the map help users browse and discover.",
      "Businesses decide whether their Business QR should appear in Explore."
    ]
  },
  {
    "slug": "show-in-explore",
    "category": "Explore & map",
    "title": "Use “Show in Explore”",
    "description": "Choose whether your Business QR can be publicly discovered.",
    "intro": "The Show in Explore setting is separate from simply adding a location.",
    "points": [
      "When enabled, the Business QR can be included in Explore.",
      "When disabled, the Business QR remains accessible through its QR code or direct link but is not listed in Explore.",
      "For new Business QR, Explore visibility is enabled by default and can be changed later."
    ]
  },
  {
    "slug": "save-follow",
    "category": "Mioseg QR",
    "title": "Save and follow Mioseg QR",
    "description": "Stay connected to useful dynamic QR codes.",
    "intro": "Public Mioseg QR can be saved or followed when the corresponding feature is available.",
    "points": [
      "Saving makes a Mioseg QR easier to find again in your account.",
      "Follow creates an ongoing connection to a Mioseg QR and is intended for relevant future updates.",
      "A regular saved scan and a saved/followed dynamic Mioseg QR serve different purposes."
    ]
  },
  {
    "slug": "password-protection",
    "category": "Security",
    "title": "Protect a Mioseg QR with a password",
    "description": "Prevent immediate public access to protected content.",
    "intro": "Your own Mioseg QR can be protected with a password. Visitors must enter the correct password before opening protected content.",
    "points": [
      "Password protection is useful for content that should not be immediately visible to everyone.",
      "It is not a complete rights or document-management system.",
      "Explore visibility and password protection are separate controls."
    ]
  },
  {
    "slug": "business-verification",
    "category": "Business QR",
    "title": "Business verification",
    "description": "Show visitors a verified status.",
    "intro": "Verification can be requested for a Business QR. It is intended to show that the information and supporting evidence submitted for that Business QR have been reviewed.",
    "points": [
      "Submit the verification request through the available Business function.",
      "After successful review, the Business QR is marked as verified.",
      "Under the current model, Business verification costs an additional 10 Credits."
    ]
  },
  {
    "slug": "transfer-mioseg-qr",
    "category": "Share & transfer",
    "title": "Transfer a Mioseg QR",
    "description": "Transfer an existing digital information point to another user.",
    "intro": "Your own Mioseg QR can be transferred to another user while the physical QR code remains in place.",
    "points": [
      "Typical cases include a change of owner, project responsibility or business responsibility.",
      "The detail view contains transfer status and transfer history.",
      "Before transferring, review rights to the content and any confidential or personal information."
    ]
  },
  {
    "slug": "credits-storage",
    "category": "Credits & storage",
    "title": "Credits and storage",
    "description": "Understand when Credits are required.",
    "intro": "Mioseg QR uses Credits for selected creation, storage and additional functions. Under the current model, views, saving and Follow are free.",
    "points": [
      "First regular Mioseg QR: free; additional regular Mioseg QR: 5 Credits.",
      "First Business QR: 2 Credits; additional Business QR: 7 Credits; verification: +10 Credits.",
      "Each Mioseg QR includes 2 MB. Each additional 5 MB costs 1 Credit. Final storage calculation is performed server-side during upload."
    ]
  },
  {
    "slug": "manage-your-qrs",
    "category": "Mioseg QR",
    "title": "Manage your own and saved Mioseg QR",
    "description": "Keep your own entries separate from QR codes saved from other users.",
    "intro": "Mioseg QR distinguishes between QR entries you own and Mioseg QR created by other users that you saved to your account.",
    "points": [
      "A personal alias can change how an entry appears in your own account without changing what the creator sees.",
      "Your own Mioseg QR can be deleted.",
      "A Mioseg QR created by someone else can be removed from your saved list without deleting the original Mioseg QR."
    ]
  },
  {
    "slug": "save-share-qr-code",
    "category": "Share & transfer",
    "title": "Save, share and place your QR code",
    "description": "Bring digital information to the physical location.",
    "intro": "The QR code generated for your Mioseg QR can be saved or shared and then used on a sticker, sign, document, product, device or other object.",
    "points": [
      "This connects a physical object or location to the digital Mioseg QR content.",
      "Normal content updates do not require a new printed QR code."
    ]
  },
  {
    "slug": "public-web-page",
    "category": "Mioseg QR",
    "title": "Public Mioseg QR page on the web",
    "description": "Open shared content outside the app as well.",
    "intro": "A Mioseg QR can be opened through its QR code or direct link as a public web page.",
    "points": [
      "Depending on the QR, visitors may see a title, description, Business profile, media, files, updates, location and contact actions.",
      "Password-protected Mioseg QR display a password prompt before the protected content.",
      "The exact presentation depends on the QR type and the content that has been added."
    ]
  },
  {
    "slug": "use-cases",
    "category": "Getting started",
    "title": "Typical use cases",
    "description": "From machines and real estate to a personal QR collection.",
    "intro": "Mioseg QR can connect physical objects, places, products and projects with digital information that remains manageable over time.",
    "points": [
      "Machine: provide manuals, technical data, maintenance information and service contacts directly on the equipment.",
      "Real estate: provide property information, images, documents, location and contact details.",
      "Products, restaurants, construction projects or personal collections: keep information current or organize scanned QR codes so they can be found again."
    ]
  },
  {
    "slug": "troubleshooting",
    "category": "Troubleshooting",
    "title": "Troubleshooting",
    "description": "Quick help for common questions.",
    "intro": "Many common issues can be narrowed down with a few checks.",
    "points": [
      "QR code not recognized: check lighting, distance and whether the full code is visible; alternatively use a screenshot and the gallery scanner.",
      "Business QR missing from Explore: check Show in Explore.",
      "Change not visible yet: make sure it was saved and allow for brief technical caching. For location issues, check the device permission."
    ]
  },
  {
    "slug": "security-privacy",
    "category": "Security",
    "title": "Understand visibility, security and privacy",
    "description": "Explore visibility and access protection are not the same thing.",
    "intro": "Mioseg QR provides separate controls for discoverability and access.",
    "points": [
      "A Business QR that is hidden from Explore is not automatically private: anyone with the QR code or direct link may still be able to open the public page.",
      "Password protection controls access to protected content.",
      "Only publish content that you are authorized to make available."
    ]
  }
];
export const helpCategories = ["Getting started", "Scan & organize", "Mioseg QR", "Business QR", "Explore & map", "Share & transfer", "Security", "Credits & storage", "Troubleshooting"];
export function getHelpArticle(slug:string){ return helpArticles.find(a=>a.slug===slug); }
