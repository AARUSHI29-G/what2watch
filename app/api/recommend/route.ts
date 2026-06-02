import { NextResponse } from "next/server";
import { findMatches } from "@/lib/semanticMatcher";
import { parseIntent } from "@/lib/aiIntentParser";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

async function tmdbFetch(url: URL) {
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

function cleanTitleQuery(message: string) {
  return message
    .toLowerCase()
    .replace(/give me/gi, "")
    .replace(/recommend/gi, "")
    .replace(/movies like/gi, "")
    .replace(/movie like/gi, "")
    .replace(/series like/gi, "")
    .replace(/similar to/gi, "")
    .replace(/both/gi, "")
    .replace(/hindi/gi, "")
    .replace(/english/gi, "")
    .replace(/movies/gi, "")
    .replace(/movie/gi, "")
    .replace(/series/gi, "")
    .trim();
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
    (x: any) =>
      (x.media_type === "movie" || x.media_type === "tv") &&
      x.poster_path &&
      x.overview
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

  return (data?.results || []).filter((x: any) => x.poster_path && x.overview);
}

async function discoverByIntent(intent: ReturnType<typeof parseIntent>) {
  if (!TMDB_API_KEY) return [];

  const all: any[] = [];
  const langs = intent.languageBoost.length > 0 ? intent.languageBoost : ["hi", "en"];

  for (const lang of langs) {
    for (let page = 1; page <= 4; page++) {
      const url = new URL(`${TMDB_BASE}/discover/movie`);

      url.searchParams.set("api_key", TMDB_API_KEY);
      url.searchParams.set("include_adult", "false");
      url.searchParams.set("region", "IN");
      url.searchParams.set("page", String(page));
      url.searchParams.set("sort_by", "popularity.desc");
      url.searchParams.set("vote_count.gte", "20");
      url.searchParams.set("with_original_language", lang);

      if (intent.genres.length > 0) {
        url.searchParams.set("with_genres", intent.genres.join(","));
      }

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

  return all.filter((x) => x.poster_path && x.overview);
}

async function keywordSearch(intent: ReturnType<typeof parseIntent>) {
  if (!TMDB_API_KEY) return [];

  const all: any[] = [];
  const langs = intent.languageBoost.length > 0 ? intent.languageBoost : ["hi", "en"];

  for (const keyword of intent.keywords) {
    for (const lang of langs) {
      const query = lang === "hi" ? `Hindi ${keyword}` : keyword;

      const url = new URL(`${TMDB_BASE}/search/movie`);
      url.searchParams.set("api_key", TMDB_API_KEY);
      url.searchParams.set("query", query);
      url.searchParams.set("include_adult", "false");
      url.searchParams.set("region", "IN");

      const data = await tmdbFetch(url);

      const results = (data?.results || []).filter(
        (x: any) =>
          x.poster_path &&
          x.overview &&
          (!intent.languageBoost.length || intent.languageBoost.includes(x.original_language))
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

function passesIntentFilters(item: any, intent: ReturnType<typeof parseIntent>) {
  if (!item.poster_path || !item.overview) return false;

  if (
    intent.languageBoost.length > 0 &&
    !intent.languageBoost.includes(item.original_language)
  ) {
    return false;
  }

  const text = `${item.title || ""} ${item.name || ""} ${item.overview || ""}`.toLowerCase();

  for (const bad of intent.exclude) {
    if (text.includes(bad.toLowerCase())) return false;
  }

  if (intent.genres.length > 0 && item.genre_ids?.length) {
    const overlap = intent.genres.some((g) => item.genre_ids.includes(g));
    if (!overlap) return false;
  }

  if (intent.profile === "romance") {
    const banned = [
      "cyberpunk",
      "robot",
      "future",
      "space",
      "detective",
      "serial killer",
      "murder",
      "death note",
      "dystopian",
    ];

    if (banned.some((b) => text.includes(b))) return false;
  }

  if (intent.profile === "thriller") {
    const banned = [
      "wedding",
      "feel good",
      "romantic comedy",
      "college romance",
      "coming of age romance",
    ];

    if (banned.some((b) => text.includes(b))) return false;
  }

  if (intent.profile === "campus") {
    const banned = ["cyberpunk", "space", "superhero", "war", "serial killer"];
    if (banned.some((b) => text.includes(b))) return false;
  }

  return true;
}

function scoreItem(item: any, intent: ReturnType<typeof parseIntent>) {
  let score = 0;

  const title = (item.title || item.name || "").toLowerCase();
  const overview = (item.overview || "").toLowerCase();
  const combined = `${title} ${overview}`;

  if (item.poster_path) score += 20;
  if (item.vote_average >= 6.5) score += 20;
  if (item.vote_average >= 7.5) score += 20;
  if (item.vote_count >= 200) score += 20;

  if (intent.languageBoost.includes(item.original_language)) score += 120;

  if (item._source === "reference-recommendation") score += 300;
  if (item._source === "keyword-search") score += 90;
  if (item._source === "intent-discover") score += 60;
  if (item._source === "dataset") score += 40;

  if (intent.genres.length > 0 && item.genre_ids?.length) {
    const overlap = intent.genres.some((g) => item.genre_ids.includes(g));
    if (overlap) score += 140;
  }

  for (const keyword of intent.keywords) {
    if (combined.includes(keyword.toLowerCase())) score += 60;
  }

  if (intent.profile === "romance") {
    const romanceWords = [
      "romance",
      "romantic",
      "dating",
      "love",
      "relationship",
      "couple",
      "wedding",
      "heart",
      "rom com",
      "romantic comedy",
      "feel good",
    ];

    const romanceMatch = romanceWords.some((w) => combined.includes(w));
    if (romanceMatch) score += 220;
    else score -= 300;
  }

  if (intent.profile === "thriller") {
    const thrillerWords = [
      "crime",
      "murder",
      "thriller",
      "mystery",
      "investigation",
      "psychological",
      "dark",
      "killer",
      "suspense",
    ];

    const thrillerMatch = thrillerWords.some((w) => combined.includes(w));
    if (thrillerMatch) score += 220;
    else score -= 300;
  }

  if (intent.profile === "campus") {
    const campusWords = [
      "college",
      "student",
      "teen",
      "campus",
      "school",
      "friendship",
      "coming of age",
      "hostel",
    ];

    const campusMatch = campusWords.some((w) => combined.includes(w));
    if (campusMatch) score += 200;
    else score -= 240;
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
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
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

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: "TMDB key missing" }, { status: 500 });
    }

    const intent = parseIntent(message);
    const allResults: any[] = [];

    if (intent.referenceTitle) {
      const refResults = await searchMulti(intent.referenceTitle);
      const reference = refResults[0];

      if (reference) {
        allResults.push({
          ...reference,
          _source: "reference-recommendation",
        });

        const recs = await getRecommendations(reference.id, reference.media_type);

        allResults.push(
          ...recs.map((item: any) => ({
            ...item,
            media_type: reference.media_type || "movie",
            _source: "reference-recommendation",
          }))
        );
      }
    }

    const cleaned = cleanTitleQuery(message);

    if (allResults.length < 8 && cleaned) {
      const direct = await searchMulti(cleaned);

      allResults.push(
        ...direct.map((item: any) => ({
          ...item,
          _source: "direct-search",
        }))
      );
    }

    allResults.push(...(await discoverByIntent(intent)));
    allResults.push(...(await keywordSearch(intent)));

    const semanticMatches = findMatches(
      `${message} ${intent.keywords.join(" ")} ${intent.vibes.join(" ")}`
    ).slice(0, 12);

    for (const match of semanticMatches) {
      const tmdb = await searchMovie(match.title);

      if (!tmdb) continue;

      allResults.push({
        ...tmdb,
        media_type: "movie",
        _source: "dataset",
      });
    }

    const unique = Array.from(
      new Map(
        allResults.map((item: any) => [`${item.media_type || "movie"}-${item.id}`, item])
      ).values()
    );

    const ranked = unique
      .filter((item: any) => passesIntentFilters(item, intent))
      .map((item: any) => ({
        ...item,
        _score: scoreItem(item, intent),
      }))
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 40);

    const formatted = await Promise.all(
      ranked.slice(0, 20).map((item: any) =>
        formatItem(
          item,
          item._source === "reference-recommendation"
            ? `Recommended because it is similar to ${intent.referenceTitle} and matches your requested vibe.`
            : item._source === "keyword-search"
            ? "Recommended using expanded mood, genre, and semantic keyword matching."
            : item._source === "dataset"
            ? "Recommended from the curated semantic dataset and verified through TMDB."
            : "Recommended because it matches your natural-language request, mood, and viewing style.",
          item._source === "reference-recommendation" ? 90 : 84
        )
      )
    );

    return NextResponse.json({
      intent,
      movies: formatted,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "AI recommendation failed" },
      { status: 500 }
    );
  }
}