"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, ThemeKey } from "@/lib/themes";

type Movie = {
  id: string;
  title: string;
  year: string;
  poster: string | null;
  overview: string;
  match: number;
  platforms: string[];
  reason: string;
  rating?: number;
  voteCount?: number;
};

type MoviePersonality = {
  title: string;
  emoji: string;
  description: string;
};

export default function ResultsPage() {
  const router = useRouter();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [themeKey, setThemeKey] = useState<ThemeKey>("What2Watch");
  const [loading, setLoading] = useState(true);

  const [personality, setPersonality] =
    useState<MoviePersonality | null>(null);

  const [showPersonalityPopup, setShowPersonalityPopup] = useState(true);

  useEffect(() => {
    async function loadResults() {
      const savedTheme = localStorage.getItem(
        "What2WatchTheme"
      ) as ThemeKey | null;

      if (savedTheme && THEMES[savedTheme]) setThemeKey(savedTheme);

      const storedPersonality = JSON.parse(
        localStorage.getItem("moviePersonality") || "null"
      );

      setPersonality(
        storedPersonality || {
          title: "The Cinematic Explorer",
          emoji: "🎬",
          description:
            "You enjoy discovering stories across genres, moods, languages, and cinematic experiences.",
        }
      );

      const stored = JSON.parse(localStorage.getItem("quizResults") || "[]");

      if (stored.length > 0) {
        setMovies(stored);
        setLoading(false);
        return;
      }

      const answers = JSON.parse(
        localStorage.getItem("What2WatchAnswers") || "{}"
      );

      if (!answers || Object.keys(answers).length === 0) {
        setMovies([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answers),
        });

        const data = await res.json();
        const freshMovies = data.movies || data.results || [];

        localStorage.setItem("quizResults", JSON.stringify(freshMovies));

        if (data.personality) {
          localStorage.setItem(
            "moviePersonality",
            JSON.stringify(data.personality)
          );
          setPersonality(data.personality);
        }

        setMovies(freshMovies);
      } catch (err) {
        console.error("RESULTS ERROR:", err);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, []);

  const theme = THEMES[themeKey];

  function saveMovie(movie: Movie) {
    const saved = JSON.parse(localStorage.getItem("savedMovies") || "[]");

    if (saved.find((m: Movie) => m.id === movie.id)) {
      alert("Already saved!");
      return;
    }

    localStorage.setItem("savedMovies", JSON.stringify([...saved, movie]));
    alert("Saved!");
  }

  function markSeen(movie: Movie) {
    const seen = JSON.parse(localStorage.getItem("seenMovies") || "[]");

    if (!seen.find((m: Movie) => m.id === movie.id)) {
      localStorage.setItem("seenMovies", JSON.stringify([...seen, movie]));
    }

    alert("Marked as seen!");
  }

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center text-white"
        style={{ background: theme.bg }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-zinc-700"
            style={{ borderTopColor: theme.accent }}
          />
          <h1 className="text-3xl font-black">Loading your matches...</h1>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden px-6 py-8 text-white md:px-12"
      style={{ background: theme.bg }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${theme.glow}, transparent 55%)`,
        }}
      />

      {personality && (
        <>
          {!showPersonalityPopup && (
            <button
              onClick={() => setShowPersonalityPopup(true)}
              className="fixed right-6 top-6 z-40 rounded-full border border-zinc-700 bg-[#151515]/90 px-4 py-3 text-sm font-black shadow-xl backdrop-blur transition hover:scale-105"
              style={{ color: theme.accent }}
            >
              {personality.emoji} Personality
            </button>
          )}

          {showPersonalityPopup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl">
              <div className="relative w-full max-w-lg rounded-[2rem] border border-zinc-800 bg-[#151515] p-8 text-center shadow-2xl">
                <button
                  onClick={() => setShowPersonalityPopup(false)}
                  className="absolute right-5 top-5 h-10 w-10 rounded-full bg-black/60 text-xl hover:bg-red-600"
                >
                  ×
                </button>

                <div className="text-7xl">{personality.emoji}</div>

                <p
                  className="mt-5 text-xs font-black tracking-[0.35em]"
                  style={{ color: theme.accent }}
                >
                  YOUR MOVIE PERSONALITY
                </p>

                <h2 className="mt-4 text-4xl font-black">
                  {personality.title}
                </h2>

                <p className="mt-5 text-sm leading-relaxed text-zinc-400">
                  {personality.description}
                </p>

                <button
                  onClick={() => setShowPersonalityPopup(false)}
                  className="mt-8 rounded-full px-8 py-4 font-black"
                  style={{
                    background: theme.accent,
                    color: theme.text,
                  }}
                >
                  Show My Matches
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <section className="relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p
              className="text-xs font-black tracking-[0.35em]"
              style={{ color: theme.accent }}
            >
              YOUR CINEMATIC MATCHES
            </p>

            <h1 className="mt-2 text-5xl font-black md:text-4.5xl">
              Quiz <span style={{ color: theme.accent }}>Results</span>
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-500">
              AI-picked movies based on your vibe, mood, genre, emotional tone,
              and cinematic personality.
            </p>
          </div>
        </div>

        {movies.length === 0 ? (
          <div className="mt-20 text-center">
            <h2 className="text-4xl font-black">No results yet</h2>
            <p className="mt-4 text-zinc-500">
              Complete the quiz first to see your matches.
            </p>

            <button
              onClick={() => router.push("/quiz")}
              className="mt-8 rounded-full px-10 py-4 font-black"
              style={{ background: theme.accent, color: theme.text }}
            >
              Go to Quiz
            </button>
          </div>
        ) : (
          <div className="mt-10 flex gap-6 overflow-x-auto pb-8">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => setSelectedMovie(movie)}
                className="min-w-[270px] max-w-[290px] cursor-pointer overflow-hidden rounded-3xl border border-zinc-800 bg-[#151515] shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="relative h-[350px] bg-zinc-900">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-500">
                      No Poster
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div
                    className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-black"
                    style={{ background: theme.accent, color: theme.text }}
                  >
                    {movie.match}% Match
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 rounded-full bg-black/70 px-3 py-2 text-center text-xs font-bold text-zinc-200 backdrop-blur">
                    Click to see full summary
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-black leading-tight">
                    {movie.title}
                  </h3>

                  <div className="mt-2 flex gap-3 text-sm text-zinc-500">
                    <span>{movie.year}</span>
                    {movie.rating && (
                      <span className="font-bold text-yellow-400">
                        ⭐ {movie.rating.toFixed(1)} TMDB
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(movie.platforms || ["Not listed"]).map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-[10px] uppercase text-zinc-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-zinc-400">
                    {movie.overview}
                  </p>

                  <p
                    className="mb-2 mt-5 text-[10px] font-bold tracking-[0.2em]"
                    style={{ color: theme.accent }}
                  >
                    WHY AI CHOSE THIS
                  </p>

                  <p className="line-clamp-3 text-xs leading-relaxed text-zinc-500">
                    {movie.reason}
                  </p>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveMovie(movie);
                      }}
                      className="flex-1 rounded-full border border-zinc-700 py-3 text-sm hover:text-white"
                    >
                      ⭐ Save
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markSeen(movie);
                      }}
                      className="flex-1 rounded-full py-3 text-sm font-bold"
                      style={{ background: theme.accent, color: theme.text }}
                    >
                      Seen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedMovie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-zinc-800 bg-[#151515]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute right-5 top-5 z-20 h-11 w-11 rounded-full bg-black/60 text-xl hover:bg-red-600"
            >
              ×
            </button>

            <div className="grid md:grid-cols-[360px_1fr]">
              <div className="relative min-h-[560px] bg-zinc-900">
                {selectedMovie.poster && (
                  <img
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              <div className="p-8 md:p-10">
                <div
                  className="mb-5 inline-flex rounded-full px-4 py-1 text-xs font-black"
                  style={{ background: theme.accent, color: theme.text }}
                >
                  {selectedMovie.match}% Match
                </div>

                <h2 className="text-5xl font-black leading-tight">
                  {selectedMovie.title}
                </h2>

                <div className="mt-3 flex flex-wrap gap-4 text-zinc-400">
                  <span>{selectedMovie.year}</span>
                  {selectedMovie.rating && (
                    <span className="font-bold text-yellow-400">
                      ⭐ {selectedMovie.rating.toFixed(1)} TMDB
                    </span>
                  )}
                </div>

                <div className="mt-8">
                  <p
                    className="mb-3 text-xs font-black tracking-[0.3em]"
                    style={{ color: theme.accent }}
                  >
                    FULL SUMMARY
                  </p>
                  <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-300">
                    {selectedMovie.overview}
                  </p>
                </div>

                <div className="mt-8 rounded-3xl border border-zinc-800 bg-black/30 p-6">
                  <p
                    className="mb-3 text-xs font-black tracking-[0.3em]"
                    style={{ color: theme.accent }}
                  >
                    WHY AI CHOSE THIS
                  </p>
                  <p className="leading-relaxed text-zinc-400">
                    {selectedMovie.reason}
                  </p>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => saveMovie(selectedMovie)}
                    className="flex-1 rounded-full border border-zinc-700 py-4 font-bold"
                  >
                    ⭐ Save
                  </button>

                  <button
                    onClick={() => markSeen(selectedMovie)}
                    className="flex-1 rounded-full py-4 font-bold"
                    style={{ background: theme.accent, color: theme.text }}
                  >
                    Seen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}