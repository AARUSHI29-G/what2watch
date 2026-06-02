import { NextResponse } from "next/server";
import { extractIntent } from "@/lib/geminiIntent";
import { findMatches } from "@/lib/semanticMatcher";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

type AIIntent = {
  referenceTitles?: string[];
  genres?: string[];
  moods?: string[];
  tropes?: string[];
  languages?: string[];
  avoid?: string[];
  vibe?: string[];
};

const languageMap: Record<string, string> = {
  english: "en",
  hindi: "hi",
  bollywood: "hi",
  korean: "ko",
  japanese: "ja",
  anime: "ja",
  tamil: "ta",
  telugu: "te",
  malayalam: "ml",
};

const genreMap: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  drama: 18,
  fantasy: 14,
  horror: 27,
  mystery: 9648,
  romance: 10749,
  romantic: 10749,
  "romantic comedy": 10749,
  thriller: 53,
  suspense: 53,
  war: 10752,
};

const knownTitleFixes: Record<string, string> = {
  "jab we met": "Jab We Met",
  "how to lose a guy": "How to Lose a Guy in 10 Days",
  "how to lose a guy in 10 days": "How to Lose a Guy in 10 Days",
  "to all the boys": "To All the Boys I've Loved Before",
  "to all the boys i have loved before": "To All the Boys I've Loved Before",
  "submarine": "Submarine",
  "widow maker": "K-19: The Widowmaker",
};

function normalize(x = "") {
  return x.toLowerCase().trim();
}

function detectLanguagesFromMessage(message: string) {
  const q = normalize(message);
  const langs: string[] = [];

  if (q.includes("hindi") || q.includes("bollywood")) langs.push("hi");
  if (q.includes("english") || q.includes("hollywood")) langs.push("en");
  if (q.includes("korean")) langs.push("ko");
  if (q.includes("japanese") || q.includes("anime")) langs.push("ja");
  if (q.includes("tamil")) langs.push("ta");
  if (q.includes("telugu")) langs.push("te");
  if (q.includes("malayalam")) langs.push("ml");

  return [...new Set(langs)];
}

function getKnownReference(message: string) {
  const q = normalize(message);
  for (const key of Object.keys(knownTitleFixes)) {
    if (q.includes(key)) return knownTitleFixes[key];
  }
  return null;
}

function cleanPromptForTitle(message: string) {
  return message
    .toLowerCase()
    .replace(/give me/gi, "")
    .replace(/recommend/gi, "")
    .replace(/movies like/gi, "")
    .replace(/movie like/gi, "")
    .replace(/series like/gi, "")
    .replace(/similar to/gi, "")
    .replace(/something like/gi, "")
    .replace(/hindi/gi, "")
    .replace(/english/gi, "")
    .replace(/movies/gi, "")
    .replace(/movie/gi, "")
    .replace(/series/gi, "")
    .trim();
}

function getLanguageCodes(intent: AIIntent) {
  const langs = intent.languages || [];
  return [
    ...new Set(
      langs.map((l) => languageMap[normalize(l)] || normalize(l)).filter(Boolean)
    ),
  ];
}

function getGenreIds(intent: AIIntent) {
  const text = [
    ...(intent.genres || []),
    ...(intent.tropes || []),
    ...(intent.moods || []),
    ...(intent.vibe || []),
  ]
    .join(" ")
    .toLowerCase();

  const ids: number[] = [];
  Object.entries(genreMap).forEach(([key, id]) => {
    if (text.includes(key)) ids.push(id);
  });

  return [...new Set(ids)];
}

function isNavalQuery(message: string, intent: AIIntent) {
  const text = [
    message,
    ...(intent.genres || []),
    ...(intent.moods || []),
    ...(intent.tropes || []),
    ...(intent.vibe || []),
  ]
    .join(" ")
    .toLowerCase();

  return (
    text.includes("submarine") ||
    text.includes("navy") ||
    text.includes("naval") ||
    text.includes("warship") ||
    text.includes("underwater")
  );
}

async function tmdbFetch(url: URL) {
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function searchMulti(query: string) {
  if (!TMDB_API_KEY || !query) return [];

  const url = new URL(`${TMDB_BASE}/search/multi`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("query", query);
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("region", "IN");

  const data = await tmdbFetch(url);

  return (data?.results || []).filter(
    (item: any) =>
      (item.media_type === "movie" || item.media_type === "tv") &&
      item.poster_path &&
      item.overview
  );
}

async function searchMovie(title: string) {
  if (!TMDB_API_KEY || !title) return null;

  const url = new URL(`${TMDB_BASE}/search/movie`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("query", title);
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("region", "IN");

  const data = await tmdbFetch(url);
  return data?.results?.[0] || null;
}

async function getRecommendations(id: number, mediaType: string) {
  if (!TMDB_API_KEY) return [];

  const url = new URL(`${TMDB_BASE}/${mediaType}/${id}/recommendations`);
  url.searchParams.set("api_key", TMDB_API_KEY);

  const data = await tmdbFetch(url);
  return (data?.results || []).filter((item: any) => item.poster_path && item.overview);
}

async function discoverByIntent(intent: AIIntent) {
  if (!TMDB_API_KEY) return [];

  const all: any[] = [];
  const languageCodes = getLanguageCodes(intent);
  const genreIds = getGenreIds(intent);
  const langs = languageCodes.length ? languageCodes : ["en", "hi"];

  for (const lang of langs) {
    for (let page = 1; page <= 3; page++) {
      const url = new URL(`${TMDB_BASE}/discover/movie`);
      url.searchParams.set("api_key", TMDB_API_KEY);
      url.searchParams.set("include_adult", "false");
      url.searchParams.set("region", "IN");
      url.searchParams.set("page", String(page));
      url.searchParams.set("sort_by", "popularity.desc");
      url.searchParams.set("vote_count.gte", "20");
      url.searchParams.set("with_original_language", lang);

      if (genreIds.length) url.searchParams.set("with_genres", genreIds.join(","));

      const data = await tmdbFetch(url);

      all.push(
        ...(data?.results || []).map((item: any) => ({
          ...item,
          media_type: "movie",
          _source: "intent-discover",
        }))
      );
    }
  }

  return all.filter((item) => item.poster_path && item.overview);
}

async function keywordSearch(message: string, intent: AIIntent) {
  if (!TMDB_API_KEY) return [];

  const all: any[] = [];
  const languageCodes = getLanguageCodes(intent);
  const langs = languageCodes.length ? languageCodes : ["en", "hi"];

  let keywords = [
    ...(intent.genres || []),
    ...(intent.tropes || []),
    ...(intent.moods || []),
    ...(intent.vibe || []),
  ].filter(Boolean);

  if (isNavalQuery(message, intent)) {
    keywords = [
      "submarine movie",
      "navy movie",
      "naval thriller",
      "submarine thriller",
      "underwater war",
      "warship",
      ...keywords,
    ];
  }

  for (const keyword of keywords) {
    for (const lang of langs) {
      const query = lang === "hi" ? `Hindi ${keyword}` : keyword;

      const url = new URL(`${TMDB_BASE}/search/movie`);
      url.searchParams.set("api_key", TMDB_API_KEY);
      url.searchParams.set("query", query);
      url.searchParams.set("include_adult", "false");
      url.searchParams.set("region", "IN");

      const data = await tmdbFetch(url);

      const results = (data?.results || []).filter(
        (item: any) =>
          item.poster_path &&
          item.overview &&
          (!languageCodes.length || languageCodes.includes(item.original_language))
      );

      all.push(
        ...results.map((item: any) => ({
          ...item,
          media_type: "movie",
          _source: "keyword-search",
        }))
      );
    }
  }

  return all;
}

async function getProviders(id: number, mediaType: string) {
  if (!TMDB_API_KEY) return ["Not listed"];

  try {
    const url = new URL(`${TMDB_BASE}/${mediaType}/${id}/watch/providers`);
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

function passesFilters(item: any, intent: AIIntent, message: string) {
  if (!item.poster_path || !item.overview) return false;

  const languageCodes = getLanguageCodes(intent);

  if (languageCodes.length && !languageCodes.includes(item.original_language)) {
    return false;
  }

  const content = `${item.title || ""} ${item.name || ""} ${item.overview || ""}`.toLowerCase();

  for (const bad of intent.avoid || []) {
    if (content.includes(bad.toLowerCase())) return false;
  }

  if (isNavalQuery(message, intent)) {
    const navalWords = [
      "submarine",
      "navy",
      "naval",
      "underwater",
      "warship",
      "u-boat",
      "sea",
      "ocean",
      "captain",
      "crew",
    ];

    const navalMatch = navalWords.some((w) => content.includes(w));

    if (!navalMatch && item._source !== "reference-title" && item._source !== "reference-recommendation") {
      return false;
    }
  }

  return true;
}

function scoreItem(item: any, intent: AIIntent, message: string) {
  let score = 0;

  const content = `${item.title || ""} ${item.name || ""} ${item.overview || ""}`.toLowerCase();

  const languageCodes = getLanguageCodes(intent);
  const genreIds = getGenreIds(intent);

  if (item.poster_path) score += 20;
  if (item.vote_average >= 6.5) score += 20;
  if (item.vote_average >= 7.5) score += 20;
  if (item.vote_count >= 200) score += 20;
  if (item.popularity >= 10) score += 10;

  if (languageCodes.includes(item.original_language)) score += 180;

  if (genreIds.length && item.genre_ids?.length) {
    const overlap = genreIds.some((id) => item.genre_ids.includes(id));
    if (overlap) score += 120;
  }

  if (item._source === "reference-title") score += 1000;
  if (item._source === "reference-recommendation") score += 850;
  if (item._source === "keyword-search") score += 160;
  if (item._source === "intent-discover") score += 80;
  if (item._source === "dataset") score += 60;
  if (item._boost) score += item._boost;

  if (isNavalQuery(message, intent)) {
    const navalWords = ["submarine", "navy", "naval", "underwater", "warship", "u-boat", "ocean", "sea"];
    if (navalWords.some((w) => content.includes(w))) score += 500;
    else score -= 500;
  }

  for (const term of [
    ...(intent.genres || []),
    ...(intent.tropes || []),
    ...(intent.moods || []),
    ...(intent.vibe || []),
  ]) {
    if (content.includes(term.toLowerCase())) score += 50;
  }

  return score;
}

async function formatItem(item: any, reason: string, matchBase = 84) {
  const mediaType = item.media_type || "movie";
  const platforms = await getProviders(item.id, mediaType);

  return {
    id: `${mediaType}-${item.id}`,
    tmdbId: item.id,
    mediaType,
    title: item.title || item.name,
    year: (item.release_date || item.first_air_date || "").slice(0, 4) || "N/A",
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    overview: item.overview || "No overview available.",
    match: Math.min(98, Math.max(matchBase, Math.round(80 + (item.vote_average || 6) * 2))),
    rating: item.vote_average,
    voteCount: item.vote_count,
    platforms,
    reason,
  };
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });
    if (!TMDB_API_KEY) return NextResponse.json({ error: "TMDB key missing" }, { status: 500 });

    let intent: AIIntent = await extractIntent(message);

    const hardLangs = detectLanguagesFromMessage(message);
    if (hardLangs.length) {
      intent.languages = hardLangs;
    }

    const knownRef = getKnownReference(message);
    if (knownRef) {
      intent.referenceTitles = [knownRef, ...(intent.referenceTitles || [])];
    }

    const titleSearchQueries = [
      knownRef,
      ...(intent.referenceTitles || []),
      cleanPromptForTitle(message),
      message,
    ].filter(Boolean) as string[];

    for (const q of titleSearchQueries) {
      const directMatches = await searchMulti(q);
      if (!directMatches.length) continue;

      const cleanedQuery = q.toLowerCase().trim();

      const exact =
        directMatches.find((r: any) => {
          const t = (r.title || r.name || "").toLowerCase();
          return t === cleanedQuery || t.includes(cleanedQuery) || cleanedQuery.includes(t);
        }) || directMatches[0];

      const title = exact.title || exact.name;
      if (title) {
        intent.referenceTitles = [...new Set([title, ...(intent.referenceTitles || [])])];
      }
      break;
    }

    console.log("FINAL AI INTENT:", intent);

    const allResults: any[] = [];

    for (const title of intent.referenceTitles || []) {
      const refs = await searchMulti(title);
      const cleanedTitle = title.toLowerCase().trim();

      const ref =
        refs.find((r: any) => {
          const t = (r.title || r.name || "").toLowerCase();
          return t === cleanedTitle || t.includes(cleanedTitle) || cleanedTitle.includes(t);
        }) || refs[0];

      if (ref) {
        allResults.push({ ...ref, _source: "reference-title", _boost: 1200 });

        const recs = await getRecommendations(ref.id, ref.media_type || "movie");

        allResults.push(
          ...recs.map((item: any) => ({
            ...item,
            media_type: item.media_type || ref.media_type || "movie",
            _source: "reference-recommendation",
            _boost: 900,
          }))
        );
      }
    }

    allResults.push(...(await discoverByIntent(intent)));
    allResults.push(...(await keywordSearch(message, intent)));

    const datasetMatches = findMatches(
      [message, ...(intent.genres || []), ...(intent.moods || []), ...(intent.tropes || []), ...(intent.vibe || [])].join(" ")
    ).slice(0, 10);

    for (const match of datasetMatches) {
      const tmdb = await searchMovie(match.title);
      if (!tmdb) continue;
      allResults.push({ ...tmdb, media_type: "movie", _source: "dataset" });
    }

    const unique = Array.from(
      new Map(allResults.map((item: any) => [`${item.media_type || "movie"}-${item.id}`, item])).values()
    );

    const ranked = unique
      .filter((item: any) => passesFilters(item, intent, message))
      .map((item: any) => ({ ...item, _score: scoreItem(item, intent, message) }))
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

    const formatted = await Promise.all(
      ranked.map((item: any) =>
        formatItem(
          item,
          item._source === "reference-title"
            ? "This is the reference title detected from your prompt."
            : item._source === "reference-recommendation"
            ? `Recommended because it is similar to ${intent.referenceTitles?.[0] || "your reference movie"}.`
            : item._source === "keyword-search"
            ? "Recommended using Gemini-extracted tropes, mood, genre, and vibe."
            : item._source === "dataset"
            ? "Recommended from your curated semantic dataset and verified through TMDB."
            : "Recommended because it matches Gemini's understanding of your request.",
          item._source === "reference-recommendation" || item._source === "reference-title" ? 90 : 84
        )
      )
    );

    return NextResponse.json({ intent, movies: formatted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AI recommendation failed" }, { status: 500 });
  }
}