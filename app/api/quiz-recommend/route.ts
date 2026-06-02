import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { findMatches } from "@/lib/semanticMatcher";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

type Answers = {
  mood?: string[];
  genre?: string[];
  subGenre?: string[];
  vibe?: string[];
  language?: string[];
  release?: string[];
  platform?: string[];
};

const languageMap: Record<string, string> = {
  Hindi: "hi",
  English: "en",
  Korean: "ko",
  Japanese: "ja",
  Tamil: "ta",
  Telugu: "te",
  Malayalam: "ml",
  Anime: "ja",
};

const genreMap: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Fantasy: 14,
  Horror: 27,
  Musical: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Sci-Fi": 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

function clean(arr?: string[]) {
  return (arr || []).filter((x) => x && !x.includes("Any"));
}

function textOf(answers: Answers) {
  return [
    ...clean(answers.mood),
    ...clean(answers.genre),
    ...clean(answers.subGenre),
    ...clean(answers.vibe),
    ...clean(answers.language),
    ...clean(answers.release),
  ]
    .join(" ")
    .toLowerCase();
}

function hasAny(text: string, words: string[]) {
  return words.some((w) => text.includes(w.toLowerCase()));
}

async function tmdbFetch(url: URL) {
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

function getLanguageCodes(answers: Answers) {
  return clean(answers.language)
    .map((l) => languageMap[l])
    .filter(Boolean);
}

function getGenreIds(answers: Answers) {
  return clean(answers.genre)
    .map((g) => genreMap[g])
    .filter(Boolean);
}

function getEraParams(answers: Answers) {
  const release = clean(answers.release).join(" ").toLowerCase();

  if (release.includes("classic")) {
    return { from: "1950-01-01", to: "1989-12-31" };
  }

  if (release.includes("90s")) {
    return { from: "1990-01-01", to: "1999-12-31" };
  }

  if (release.includes("2000s")) {
    return { from: "2000-01-01", to: "2009-12-31" };
  }

  if (release.includes("modern")) {
    return { from: "2010-01-01", to: "2023-12-31" };
  }

  if (release.includes("latest")) {
    return { from: "2020-01-01", to: "2026-12-31" };
  }

  return {};
}

function getReferenceTitles(answers: Answers) {
  const t = textOf(answers);
  const langs = clean(answers.language);
  const isHindi = langs.includes("Hindi");
  const isEnglish = langs.includes("English");
  const isAnime = langs.includes("Anime") || langs.includes("Japanese");

  if (
    hasAny(t, [
      "romance",
      "romantic",
      "rom-com",
      "friends-to-lovers",
      "enemies-to-lovers",
      "slow burn",
      "second chance",
      "forbidden love",
      "cozy",
      "heartwarming",
    ])
  ) {
    if (isHindi) {
      return [
        "Jab We Met",
        "Hum Tum",
        "Jaane Tu... Ya Jaane Na",
        "Love Aaj Kal",
        "Yeh Jawaani Hai Deewani",
        "Wake Up Sid",
        "Barfi!",
        "The Lunchbox",
      ];
    }

    return [
      "10 Things I Hate About You",
      "How to Lose a Guy in 10 Days",
      "Love, Rosie",
      "The Proposal",
      "Set It Up",
      "Anyone But You",
      "Crazy Rich Asians",
      "To All the Boys I've Loved Before",
    ];
  }

  if (
    hasAny(t, [
      "crime",
      "thriller",
      "survival thriller",
      "psychological thriller",
      "mystery thriller",
      "detective",
      "murder",
      "dark",
      "suspenseful",
      "edge-of-seat",
    ])
  ) {
    if (isHindi) {
      return [
        "Drishyam",
        "Andhadhun",
        "Kahaani",
        "Talaash",
        "Badla",
        "Ugly",
        "NH10",
        "Raman Raghav 2.0",
      ];
    }

    return [
      "Prisoners",
      "Se7en",
      "Gone Girl",
      "Zodiac",
      "Wind River",
      "Nightcrawler",
      "Sicario",
      "Green Room",
      "No Country for Old Men",
      "Captain Phillips",
    ];
  }

  if (
    hasAny(t, [
      "action",
      "spy",
      "revenge",
      "gangster",
      "military",
      "mass",
      "high-stakes",
    ])
  ) {
    if (isHindi) {
      return ["KGF", "War", "Pathaan", "Baby", "Special 26", "Vikram Vedha", "Don"];
    }

    return [
      "John Wick",
      "Mission: Impossible",
      "The Bourne Identity",
      "Mad Max: Fury Road",
      "Skyfall",
      "Casino Royale",
    ];
  }

  if (
    isAnime ||
    hasAny(t, ["anime", "animation", "visually stunning", "magical"])
  ) {
    return [
      "Your Name.",
      "A Silent Voice: The Movie",
      "Spirited Away",
      "Weathering with You",
      "I Want to Eat Your Pancreas",
      "Suzume",
    ];
  }

  if (
    hasAny(t, [
      "emotional",
      "sad",
      "melancholic",
      "deep",
      "meaningful",
      "inspirational",
      "hopeful",
    ])
  ) {
    if (isHindi) {
      return [
        "Masaan",
        "12th Fail",
        "Taare Zameen Par",
        "Barfi!",
        "The Lunchbox",
        "October",
      ];
    }

    return [
      "The Fault in Our Stars",
      "La La Land",
      "Good Will Hunting",
      "Dead Poets Society",
      "Manchester by the Sea",
      "The Pursuit of Happyness",
    ];
  }

  if (hasAny(t, ["sci-fi", "time travel", "space", "dystopian", "ai", "robot"])) {
    return [
      "Inception",
      "Interstellar",
      "The Matrix",
      "Arrival",
      "Ex Machina",
      "Blade Runner 2049",
    ];
  }

  if (hasAny(t, ["war", "military", "naval", "submarine", "patriotic"])) {
    return [
      "Dunkirk",
      "1917",
      "Saving Private Ryan",
      "Uri: The Surgical Strike",
      "The Ghazi Attack",
      "K-19: The Widowmaker",
    ];
  }

  return isHindi
    ? ["3 Idiots", "Dangal", "PK", "Zindagi Na Milegi Dobara", "Queen"]
    : ["The Shawshank Redemption", "Forrest Gump", "The Truman Show", "The Grand Budapest Hotel"];
}

async function searchMovie(title: string) {
  if (!TMDB_API_KEY) return null;

  const url = new URL(`${TMDB_BASE}/search/movie`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("query", title);
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("region", "IN");

  const data = await tmdbFetch(url);
  return (data?.results || []).find((m: any) => m.poster_path && m.overview) || null;
}

async function getRecommendations(id: number) {
  if (!TMDB_API_KEY) return [];

  const url = new URL(`${TMDB_BASE}/movie/${id}/recommendations`);
  url.searchParams.set("api_key", TMDB_API_KEY);

  const data = await tmdbFetch(url);
  return (data?.results || []).filter((m: any) => m.poster_path && m.overview);
}

async function discoverMovies(answers: Answers) {
  if (!TMDB_API_KEY) return [];

  const all: any[] = [];
  const languageCodes = getLanguageCodes(answers);
  const genreIds = getGenreIds(answers);
  const era = getEraParams(answers);

  const langs = languageCodes.length ? languageCodes : ["en", "hi"];

  for (const lang of langs) {
    for (let page = 1; page <= 3; page++) {
      const url = new URL(`${TMDB_BASE}/discover/movie`);
      url.searchParams.set("api_key", TMDB_API_KEY);
      url.searchParams.set("include_adult", "false");
      url.searchParams.set("region", "IN");
      url.searchParams.set("page", String(page));
      url.searchParams.set("sort_by", "vote_average.desc");
      url.searchParams.set("vote_count.gte", "80");
      url.searchParams.set("with_original_language", lang);

      if (genreIds.length) {
        url.searchParams.set("with_genres", genreIds.join(","));
      }

      if (era.from) url.searchParams.set("primary_release_date.gte", era.from);
      if (era.to) url.searchParams.set("primary_release_date.lte", era.to);

      const data = await tmdbFetch(url);

      all.push(
        ...(data?.results || []).map((m: any) => ({
          ...m,
          _source: "discover",
        }))
      );
    }
  }

  return all.filter((m) => m.poster_path && m.overview);
}

async function getProviders(id: number) {
  if (!TMDB_API_KEY) return ["Not listed"];

  try {
    const url = new URL(`${TMDB_BASE}/movie/${id}/watch/providers`);
    url.searchParams.set("api_key", TMDB_API_KEY);

    const data = await tmdbFetch(url);
    const india = data?.results?.IN;

    const providers = [
      ...(india?.flatrate || []),
      ...(india?.rent || []),
      ...(india?.buy || []),
    ];

    const names = [...new Set(providers.map((p: any) => p.provider_name))];

    return names.length ? names.slice(0, 4) : ["Not listed"];
  } catch {
    return ["Not listed"];
  }
}

function passesStrictFilters(movie: any, answers: Answers) {
  if (!movie.poster_path || !movie.overview) return false;

  const t = textOf(answers);
  const content = `${movie.title || ""} ${movie.overview || ""}`.toLowerCase();
  const langCodes = getLanguageCodes(answers);
  const genreIds = getGenreIds(answers);

  if (langCodes.length && !langCodes.includes(movie.original_language)) {
    return false;
  }

  if (genreIds.length && movie.genre_ids?.length) {
    const overlap = genreIds.some((id) => movie.genre_ids.includes(id));
    if (!overlap && movie._source !== "reference") return false;
  }

  if (hasAny(t, ["romance", "romantic", "rom-com"])) {
    const bad = ["war", "zombie", "alien", "monster", "superhero", "robot"];
    if (bad.some((w) => content.includes(w))) return false;
  }

  if (hasAny(t, ["crime", "thriller", "mystery", "survival thriller"])) {
    const bad = ["princess", "magical", "animated", "cartoon", "super mario", "woodland"];
    if (bad.some((w) => content.includes(w))) return false;
  }

  return true;
}

function scoreMovie(movie: any, answers: Answers) {
  let score = 0;

  const t = textOf(answers);
  const content = `${movie.title || ""} ${movie.overview || ""}`.toLowerCase();
  const langCodes = getLanguageCodes(answers);
  const genreIds = getGenreIds(answers);

  if (movie._source === "reference") score += 1000;
  if (movie._source === "reference-recommendation") score += 650;
  if (movie._source === "dataset") score += 500;
  if (movie._source === "discover") score += 200;

  if (langCodes.includes(movie.original_language)) score += 250;

  if (genreIds.length && movie.genre_ids?.length) {
    const count = genreIds.filter((id) => movie.genre_ids.includes(id)).length;
    score += count * 220;
  }

  const keywords = [
    ...clean(answers.mood),
    ...clean(answers.genre),
    ...clean(answers.subGenre),
    ...clean(answers.vibe),
  ];

  for (const k of keywords) {
    const key = k.toLowerCase();
    if (content.includes(key)) score += 80;
  }

  if (movie.vote_average >= 7) score += 80;
  if (movie.vote_average >= 8) score += 120;
  if (movie.vote_count >= 500) score += 60;

  if (!clean(answers.release).includes("Latest")) {
    const year = Number((movie.release_date || "").slice(0, 4));
    if (year > new Date().getFullYear()) score -= 500;
  }

  if (hasAny(t, ["romance", "romantic", "rom-com"]) && movie.genre_ids?.includes(10749)) {
    score += 350;
  }

  if (hasAny(t, ["crime"]) && movie.genre_ids?.includes(80)) {
    score += 350;
  }

  if (hasAny(t, ["thriller", "suspenseful"]) && movie.genre_ids?.includes(53)) {
    score += 350;
  }

  if (hasAny(t, ["mystery"]) && movie.genre_ids?.includes(9648)) {
    score += 250;
  }

  return score;
}

async function formatMovie(movie: any, answers: Answers) {
  const platforms = await getProviders(movie.id);

  return {
    id: `movie-${movie.id}`,
    tmdbId: movie.id,
    mediaType: "movie",
    title: movie.title,
    year: (movie.release_date || "").slice(0, 4) || "N/A",
    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    overview: movie.overview || "No overview available.",
    match: Math.min(98, Math.max(86, Math.round(80 + (movie.vote_average || 6) * 2))),
    rating: movie.vote_average,
    voteCount: movie.vote_count,
    platforms,
    reason: `Recommended because it matches your quiz choices: ${[
      ...clean(answers.mood),
      ...clean(answers.genre),
      ...clean(answers.subGenre),
      ...clean(answers.vibe),
      ...clean(answers.language),
    ]
      .slice(0, 8)
      .join(", ")}.`,
  };
}

function buildPersonality(answers: Answers) {
  const t = textOf(answers);

  if (hasAny(t, ["crime", "thriller", "mystery", "detective", "dark"])) {
    return {
      title: "The Thriller Detective",
      emoji: "🕵️",
      description:
        "You love mysteries, danger, crime puzzles, intense twists, and stories that keep your brain alert till the end.",
    };
  }

  if (hasAny(t, ["romance", "romantic", "rom-com", "heartwarming", "cozy"])) {
    return {
      title: "The Cozy Romantic",
      emoji: "💘",
      description:
        "You enjoy charming chemistry, emotional comfort, relationship-driven stories, and movies that leave you smiling.",
    };
  }

  if (hasAny(t, ["action", "spy", "revenge", "gangster", "military"])) {
    return {
      title: "The Adrenaline Seeker",
      emoji: "🔥",
      description:
        "You prefer high-stakes missions, revenge arcs, powerful heroes, and fast-paced cinematic energy.",
    };
  }

  if (hasAny(t, ["emotional", "sad", "melancholic", "inspirational", "meaningful"])) {
    return {
      title: "The Emotional Storyteller",
      emoji: "🎭",
      description:
        "You connect deeply with heartfelt journeys, layered characters, and stories that stay with you after they end.",
    };
  }

  return {
    title: "The Cinematic Explorer",
    emoji: "🎬",
    description:
      "You enjoy discovering stories across genres, moods, languages, and cinematic experiences.",
  };
}

async function geminiRefineTitles(answers: Answers) {
  if (!GEMINI_API_KEY) return [];

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Return ONLY valid JSON array of 10 real movie titles. No markdown.

User quiz:
Mood: ${clean(answers.mood).join(", ")}
Genre: ${clean(answers.genre).join(", ")}
Subgenre: ${clean(answers.subGenre).join(", ")}
Vibe: ${clean(answers.vibe).join(", ")}
Language: ${clean(answers.language).join(", ")}
Release: ${clean(answers.release).join(", ")}

Rules:
- Titles must be real movies on TMDB.
- Strongly match genre, mood, subgenre, language.
- Avoid unrelated genres.
- If language is Hindi, prefer Hindi films.
- If language is English, prefer English films.
`;

    const result = await model.generateContent(prompt);
    const txt = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(txt);

    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch (err) {
    console.error("Quiz Gemini title refine failed:", err);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: "TMDB key missing" }, { status: 500 });
    }

    const body = await req.json();
    const answers: Answers = body.answers || body;

    const all: any[] = [];

    const referenceTitles = getReferenceTitles(answers);
    const geminiTitles = await geminiRefineTitles(answers);

    const titlePool = [...new Set([...referenceTitles, ...geminiTitles])];

    for (const title of titlePool) {
      const movie = await searchMovie(title);

      if (movie) {
        all.push({
          ...movie,
          _source: "reference",
        });

        const recs = await getRecommendations(movie.id);

        all.push(
          ...recs.slice(0, 5).map((r: any) => ({
            ...r,
            _source: "reference-recommendation",
          }))
        );
      }
    }

    all.push(...(await discoverMovies(answers)));

    const semanticQuery = [
      ...clean(answers.mood),
      ...clean(answers.genre),
      ...clean(answers.subGenre),
      ...clean(answers.vibe),
      ...clean(answers.language),
    ].join(" ");

    const datasetMatches = findMatches(semanticQuery).slice(0, 10);

    for (const item of datasetMatches) {
      const movie = await searchMovie(item.title);
      if (movie) {
        all.push({
          ...movie,
          _source: "dataset",
        });
      }
    }

    const unique = Array.from(
      new Map(all.map((m: any) => [`movie-${m.id}`, m])).values()
    );

    let ranked = unique
      .filter((m: any) => passesStrictFilters(m, answers))
      .map((m: any) => ({
        ...m,
        _score: scoreMovie(m, answers),
      }))
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

    if (ranked.length < 6) {
      ranked = unique
        .map((m: any) => ({
          ...m,
          _score: scoreMovie(m, answers),
        }))
        .sort((a: any, b: any) => b._score - a._score)
        .slice(0, 20);
    }

    const movies = await Promise.all(
      ranked.map((m: any) => formatMovie(m, answers))
    );

    return NextResponse.json({
      personality: buildPersonality(answers),
      movies,
    });
  } catch (err) {
    console.error("Quiz recommendation failed:", err);
    return NextResponse.json(
      { error: "Quiz recommendation failed" },
      { status: 500 }
    );
  }
}