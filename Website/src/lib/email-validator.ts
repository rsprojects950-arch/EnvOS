/**
 * Production Email Validation & Anti-Abuse Security Layer
 * 
 * Protects EnvOS from:
 * 1. Disposable / burner / temporary mail domains (e.g. temp-mail, mailinator, guerrillamail)
 * 2. Gmail alias abuse (ignoring dots & stripping plus-tags to enforce 1-account-per-inbox)
 * 3. Malformed or invalid syntax
 * 
 * Supports all legitimate developers and organizations:
 * - Google (@gmail.com and Google Workspace custom domains)
 * - Microsoft (@outlook.com, @hotmail.com, @live.com, Office 365)
 * - Apple (@icloud.com, @me.com, @mac.com)
 * - Proton (@proton.me, @protonmail.com)
 * - Yahoo (@yahoo.com)
 * - Academic (.edu, .ac.uk) & custom company/personal domains (.dev, .io, .com, .org, etc.)
 */

// Standard RFC 5322 compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Comprehensive Set of Known Disposable / Temp / Burner Email Domains
export const DISPOSABLE_DOMAINS = new Set<string>([
  // Popular throwaway services
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "10minemail.com",
  "20minutemail.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmail.com",
  "tempmail.net",
  "tempmail.io",
  "tempmailaddress.com",
  "tempemail.net",
  "tempinbox.com",
  "temporaryinbox.com",
  "temporarymail.com",
  "mailinator.com",
  "mailinator2.com",
  "mailinator.net",
  "notmailinator.com",
  "mailin8r.com",
  "spamherelots.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "pokemail.net",
  "spam4.me",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "cool.fr.nf",
  "jetable.fr.nf",
  "nospam.ze.tc",
  "nomail.xl.cx",
  "mega.zik.dj",
  "speed.1s.fr",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "dispostable.com",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "trashmail.org",
  "trashmail.ws",
  "getnada.com",
  "nada.ltd",
  "nada.email",
  "generator.email",
  "fakemailgenerator.com",
  "fakeinbox.com",
  "mytrashmail.com",
  "mytemp.email",
  "emailondeck.com",
  "burnermail.io",
  "dropmail.me",
  "mohmal.com",
  "inboxkitten.com",
  "crazymailing.com",
  "mintemail.com",
  "discard.email",
  "spambog.com",
  "spambog.de",
  "spambog.ru",
  "spamgourmet.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "einrot.com",
  "fambit.com",
  "fleckens.com",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "bouncr.com",
  "mailcatch.com",
  "mailnesia.com",
  "tempm.com",
  "mailnull.com",
  "spoofmail.de",
  "zoemail.org",
  "0815.ru",
  "10mail.org",
  "20mail.it",
  "2prong.com",
  "anonbox.net",
  "anonymbox.com",
  "antichef.com",
  "antichef.net",
  "binkmail.com",
  "bobmail.info",
  "chammy.info",
  "devnullmail.com",
  "dfgh.net",
  "digitalsanctuary.com",
  "dmailman.com",
  "dodgeit.com",
  "dodgymail.com",
  "dontsendmespam.de",
  "drdrb.net",
  "dumpmail.de",
  "e4ward.com",
  "emailias.com",
  "emailmiser.com",
  "emailtemporaneo.net",
  "emz.net",
  "ephemail.net",
  "fastcheck.org",
  "fastacura.com",
  "gishpuppy.com",
  "hidemail.de",
  "ignorelist.com",
  "incognitoid.com",
  "ipoo.org",
  "jetable.org",
  "kasmail.com",
  "klzlk.com",
  "loaoa.com",
  "lookugly.com",
  "mail-temporaire.fr",
  "mailblocks.com",
  "mailexpire.com",
  "mailimate.com",
  "mailme.ir",
  "mailmetrash.com",
  "mailmoat.com",
  "meltmail.com",
  "messagebeamer.de",
  "mycleaninbox.net",
  "netmails.net",
  "nobulkmail.com",
  "nobullshitmail.com",
  "noclickemail.com",
  "no-spam.ws",
  "nospam4.us",
  "nospamfor.us",
  "nospammail.net",
  "nospamthanks.info",
  "nowmymail.com",
  "objectmail.com",
  "onewaymail.com",
  "pookmail.com",
  "safe-mail.net",
  "shieldemail.com",
  "shortmail.net",
  "slipry.net",
  "sneakemail.com",
  "soodo.com",
  "spamavert.com",
  "spambob.com",
  "spambob.net",
  "spambob.org",
  "spamex.com",
  "spamfree24.org",
  "spamhole.com",
  "spaml.com",
  "spammotel.com",
  "spamspot.com",
  "trbvm.com",
  "tyldd.com",
  "uggsrock.com",
  "umail.net",
  "unusablemail.com",
  "veryrealemail.com",
  "wetmail.de",
  "wh4f.org",
  "willhackforfood.biz",
  "willselfdestruct.com",
  "winmail.de",
  "wuzup.net",
  "xagloo.com",
  "xemail.me",
  "yapped.net",
  "zep-hyr.com",
]);

/**
 * Checks if a domain or email matches known disposable patterns
 */
export function isDisposableDomain(domainOrEmail: string): boolean {
  if (!domainOrEmail) return false;
  const parts = domainOrEmail.toLowerCase().trim().split("@");
  const domain = parts.length > 1 ? parts[1] : parts[0];

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return true;
  }

  // Pattern detection for dynamic / subdomain burner services
  const disposableKeywords = [
    "tempmail",
    "throwaway",
    "disposable",
    "trashmail",
    "fakemail",
    "burnermail",
    "guerrillamail",
    "10minute",
    "20minute",
    "inboxkitten",
    "mailinator",
    "dropmail",
  ];

  return disposableKeywords.some((keyword) => domain.includes(keyword));
}

/**
 * Normalizes email address for anti-abuse:
 * - Converts to lowercase & trims whitespace
 * - For Gmail addresses: strips dots and ignores `+tag` aliases (so user+1@gmail.com => user@gmail.com)
 * - Preserves standard formatting for custom and corporate domains
 */
export function normalizeEmail(email: string): string {
  const clean = (email || "").trim().toLowerCase();
  const atIndex = clean.indexOf("@");
  if (atIndex === -1) return clean;

  let local = clean.substring(0, atIndex);
  const domain = clean.substring(atIndex + 1);

  // Special normalization for Gmail / Googlemail to defeat alias spamming
  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Strip everything after '+'
    const plusIndex = local.indexOf("+");
    if (plusIndex !== -1) {
      local = local.substring(0, plusIndex);
    }
    // Remove all dots from local part
    local = local.replace(/\./g, "");
    return `${local}@gmail.com`;
  }

  // For other providers (e.g. Proton, Outlook, custom domains), normalize + aliases safely
  const plusIndex = local.indexOf("+");
  if (plusIndex !== -1) {
    local = local.substring(0, plusIndex);
  }

  return `${local}@${domain}`;
}

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  normalizedEmail: string;
  domain: string;
}

/**
 * Validates an email address against syntax rules and burner domain blocklists
 */
export function validateEmail(email: string): EmailValidationResult {
  const raw = (email || "").trim();

  if (!raw) {
    return {
      isValid: false,
      error: "Email address is required.",
      normalizedEmail: "",
      domain: "",
    };
  }

  if (raw.length > 254) {
    return {
      isValid: false,
      error: "Email address exceeds the maximum length of 254 characters.",
      normalizedEmail: "",
      domain: "",
    };
  }

  if (!EMAIL_REGEX.test(raw)) {
    return {
      isValid: false,
      error: "Please enter a valid email address.",
      normalizedEmail: "",
      domain: "",
    };
  }

  const parts = raw.split("@");
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: "Invalid email format.",
      normalizedEmail: "",
      domain: "",
    };
  }

  const domain = parts[1].toLowerCase().trim();

  // Validate TLD presence and structure
  const domainParts = domain.split(".");
  if (domainParts.length < 2 || domainParts.some((p) => p.length === 0)) {
    return {
      isValid: false,
      error: "Email must include a valid domain name.",
      normalizedEmail: "",
      domain,
    };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return {
      isValid: false,
      error: "Invalid domain extension.",
      normalizedEmail: "",
      domain,
    };
  }

  // Reject disposable / burner email domains
  if (isDisposableDomain(domain)) {
    return {
      isValid: false,
      error: "Disposable, temporary, or burner email addresses are not permitted. Please use your personal or work email.",
      normalizedEmail: "",
      domain,
    };
  }

  const normalized = normalizeEmail(raw);

  return {
    isValid: true,
    normalizedEmail: normalized,
    domain,
  };
}

