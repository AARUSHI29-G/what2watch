"use client";

import { useEffect, useState } from "react";
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

export default function AIPage() {
  const [message, setMessage] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [themeKey, setThemeKey] = useState<ThemeKey>("What2Watch");

  useEffect(() => {
    const saved = localStorage.getItem("What2WatchTheme") as ThemeKey | null;
    if (saved && THEMES[saved]) setThemeKey(saved);
  }, []);

  const theme = THEMES[themeKey];

  async function findMovies() {
    if (!message.trim()) return;

    setLoading(true);
    setMovies([]);

    try {
      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setMovies(data.movies || []);
    } catch (err) {
      console.error(err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }

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

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
          <div className="text-center">
            <div
              className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-zinc-700"
              style={{ borderTopColor: theme.accent }}
            />
            <h2 className="text-3xl font-black">
              Searching your perfect picks...
            </h2>
            <p className="mt-3 text-zinc-400">
              Gemini + TMDB are matching your vibe
            </p>
          </div>
        </div>
      )}

      <section className="relative z-10 mx-auto max-w-5xl text-center">
        <p
          className="mb-4 text-xs font-bold tracking-[0.45em]"
          style={{ color: theme.accent }}
        >
          AI MOVIE MATCHMAKER
        </p>

        <h1 className="text-5xl font-black md:text-6xl">
          Reference a {" "}
          <span style={{ color: theme.accent }}>movie you loved.</span>
        </h1>

        <p className="mt-5 text-zinc-500">
          Mention a movie, show, mood, or genre.. The AI understands your vibe, mood, genres, emotions,
          and cinematic taste.
        </p>

        <div className="relative mt-10">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Try:  Off Campus • Dil bole hadippa • submarine movies • courtroom dramas • emotional anime • prison escapes"
            className="h-52 w-full resize-none rounded-3xl border border-zinc-800 bg-[#151515] p-6 text-white outline-none focus:border-red-500"
          />

          <button
            onClick={findMovies}
            disabled={loading}
            className="absolute bottom-5 right-5 rounded-full px-8 py-4 font-black disabled:opacity-50"
            style={{
              background: theme.accent,
              color: theme.text,
            }}
          >
            Find Movies
          </button>
        </div>
      </section>

      <section className="relative z-10 mt-16">
        <h2 className="mb-10 text-5xl font-black">
          AI <span style={{ color: theme.accent }}>Recommendations</span>
        </h2>

        {!loading && movies.length === 0 && (
          <p className="text-zinc-500">
            Try describing a mood, genre, trope, or reference movie to get
            recommendations.
          </p>
        )}

        <div className="flex gap-6 overflow-x-auto pb-8">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelected(movie)}
              className="min-w-[270px] max-w-[270px] cursor-pointer overflow-hidden rounded-3xl border border-zinc-800 bg-[#151515] transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-[400px] bg-zinc-900">
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

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                <div
                  className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold"
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
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-zinc-800 bg-[#151515]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-5 top-5 z-20 h-11 w-11 rounded-full bg-black/60 text-xl hover:bg-red-600"
            >
              ×
            </button>

            <div className="grid md:grid-cols-[360px_1fr]">
              <div className="relative min-h-[560px] bg-zinc-900">
                {selected.poster && (
                  <img
                    src={selected.poster}
                    alt={selected.title}
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
                  {selected.match}% Match
                </div>

                <h2 className="text-5xl font-black leading-tight">
                  {selected.title}
                </h2>

                <div className="mt-3 flex flex-wrap gap-4 text-zinc-400">
                  <span>{selected.year}</span>

                  {selected.rating && (
                    <span className="font-bold text-yellow-400">
                      ⭐ {selected.rating.toFixed(1)} TMDB
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {(selected.platforms || ["Not listed"]).map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs uppercase text-zinc-300"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <div className="mt-8">
                  <p
                    className="mb-3 text-xs font-black tracking-[0.3em]"
                    style={{ color: theme.accent }}
                  >
                    FULL SUMMARY
                  </p>

                  <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-300">
                    {selected.overview}
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
                    {selected.reason}
                  </p>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => saveMovie(selected)}
                    className="flex-1 rounded-full border border-zinc-700 py-4 font-bold"
                  >
                    ⭐ Save
                  </button>

                  <button
                    onClick={() => markSeen(selected)}
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