export type ParsedIntent = {
  profile: string;
  genres: number[];
  keywords: string[];
  exclude: string[];
  languageBoost: string[];
  moods: string[];
  vibes: string[];
  referenceTitle: string | null;
};

const knownTitleMap: Record<string, string> = {
  "how to lose a guy": "How to Lose a Guy in 10 Days",
  "how to lose a guy in 10 days": "How to Lose a Guy in 10 Days",
  "off campus": "Off Campus",
  drishyam: "Drishyam",
  andhadhun: "Andhadhun",
  dhurandhar: "Dhurandhar",
  "your name": "Your Name",
  "jab we met": "Jab We Met",
  "rocky aur rani": "Rocky Aur Rani Kii Prem Kahaani",
  "karthik calling karthik": "Karthik Calling Karthik",
  mismatched: "Mismatched",
  "kota factory": "Kota Factory",
  "hostel daze": "Hostel Daze",
  flames: "FLAMES",
};

export function extractReferenceTitle(query: string) {
  const q = query.toLowerCase();

  for (const key of Object.keys(knownTitleMap)) {
    if (q.includes(key)) return knownTitleMap[key];
  }

  const likeMatch =
    q.match(/like\s+(.+?)(?:\s+but|\s+with|\s+in hindi|\s+in english|$)/i) ||
    q.match(/similar to\s+(.+?)(?:\s+but|\s+with|\s+in hindi|\s+in english|$)/i);

  if (likeMatch?.[1]) {
    return likeMatch[1]
      .replace(/movies?/gi, "")
      .replace(/series/gi, "")
      .trim();
  }

  return null;
}

export function detectLanguages(query: string) {
  const q = query.toLowerCase();
  const langs: string[] = [];

  if (q.includes("hindi") || q.includes("bollywood") || q.includes("desi")) langs.push("hi");
  if (q.includes("english") || q.includes("hollywood")) langs.push("en");
  if (q.includes("korean") || q.includes("kdrama")) langs.push("ko");
  if (q.includes("anime") || q.includes("japanese")) langs.push("ja");
  if (q.includes("tamil")) langs.push("ta");
  if (q.includes("telugu")) langs.push("te");
  if (q.includes("malayalam")) langs.push("ml");

  return [...new Set(langs)];
}

export function parseIntent(query: string): ParsedIntent {
  const q = query.toLowerCase();

  const intent: ParsedIntent = {
    profile: "general",
    genres: [],
    keywords: [],
    exclude: [],
    languageBoost: detectLanguages(query),
    moods: [],
    vibes: [],
    referenceTitle: extractReferenceTitle(query),
  };

  if (
    q.includes("campus") ||
    q.includes("college") ||
    q.includes("student") ||
    q.includes("hostel") ||
    q.includes("teen") ||
    q.includes("school") ||
    q.includes("off campus")
  ) {
    intent.profile = "campus";
    intent.genres.push(18, 35, 10749);
    intent.keywords.push(
      "college life",
      "student life",
      "campus romance",
      "friendship",
      "coming of age",
      "hostel life",
      "young adult"
    );
    intent.exclude.push("space", "cyberpunk", "war", "zombie", "superhero", "murder");
    intent.vibes.push("youthful", "relatable", "friendship", "fun");
  }

  if (
    q.includes("romance") ||
    q.includes("romantic") ||
    q.includes("love") ||
    q.includes("rom com") ||
    q.includes("rom-com") ||
    q.includes("cozy") ||
    q.includes("feel good") ||
    q.includes("comfort") ||
    q.includes("how to lose a guy")
  ) {
    intent.profile = "romance";
    intent.genres.push(10749, 35, 18);
    intent.keywords.push(
      "romantic comedy",
      "fake dating",
      "chaotic romance",
      "enemies to lovers",
      "feel good romance",
      "heartwarming romance"
    );
    intent.exclude.push("war", "slasher", "zombie", "gore", "cyberpunk", "space");
    intent.vibes.push("cute", "warm", "fun", "emotional");
  }

  if (
    q.includes("thriller") ||
    q.includes("crime") ||
    q.includes("suspense") ||
    q.includes("mind bending") ||
    q.includes("mind-bending") ||
    q.includes("mystery") ||
    q.includes("dark") ||
    q.includes("psychological") ||
    q.includes("drishyam") ||
    q.includes("andhadhun")
  ) {
    intent.profile = "thriller";
    intent.genres.push(53, 80, 9648);
    intent.keywords.push(
      "crime thriller",
      "psychological thriller",
      "murder mystery",
      "investigation",
      "dark suspense",
      "plot twist"
    );
    intent.exclude.push("romantic comedy", "feel good", "wedding", "campus romance");
    intent.vibes.push("dark", "serious", "tense", "mind bending");
  }

  if (
    q.includes("action") ||
    q.includes("spy") ||
    q.includes("patriotic") ||
    q.includes("mission") ||
    q.includes("agent") ||
    q.includes("dhurandhar")
  ) {
    intent.profile = "action";
    intent.genres.push(28, 53, 12);
    intent.keywords.push(
      "spy thriller",
      "undercover mission",
      "patriotic action",
      "agent thriller",
      "high stakes action"
    );
    intent.exclude.push("romantic comedy", "musical", "slice of life");
    intent.vibes.push("intense", "adrenaline", "heroic");
  }

  if (
    q.includes("anime") ||
    q.includes("animation") ||
    q.includes("fantasy") ||
    q.includes("magical") ||
    q.includes("your name")
  ) {
    intent.profile = "animeFantasy";
    intent.genres.push(16, 14, 12, 18);
    intent.keywords.push(
      "emotional anime",
      "fantasy anime",
      "magical romance",
      "dreamlike anime",
      "beautiful animation"
    );
    intent.exclude.push("crime documentary", "political drama");
    intent.vibes.push("dreamy", "magical", "emotional");
  }

  if (q.includes("horror") || q.includes("scary") || q.includes("ghost") || q.includes("haunted")) {
    intent.profile = "horror";
    intent.genres.push(27, 53, 9648);
    intent.keywords.push("supernatural horror", "haunted", "ghost story", "psychological horror");
    intent.exclude.push("romantic comedy", "feel good");
    intent.vibes.push("scary", "tense", "dark");
  }

  if (q.includes("sad") || q.includes("cry") || q.includes("heartbreak")) {
    intent.profile = intent.profile === "general" ? "emotional" : intent.profile;
    intent.genres.push(18);
    intent.keywords.push("emotional drama", "heartbreak", "moving drama", "deeply emotional");
    intent.vibes.push("sad", "deep", "emotional");
  }

  if (intent.referenceTitle) intent.keywords.push(intent.referenceTitle);
  if (intent.keywords.length === 0) intent.keywords.push(query);

  intent.genres = [...new Set(intent.genres)];
  intent.keywords = [...new Set(intent.keywords)];
  intent.exclude = [...new Set(intent.exclude)];
  intent.vibes = [...new Set(intent.vibes)];
  intent.moods = [...new Set(intent.moods)];

  return intent;
}