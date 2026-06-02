"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, ThemeKey, saveTheme } from "@/lib/themes";

type Movie = {
  id: string;
  title: string;
  year: string;
  poster: string | null;
  overview: string;
  match?: number;
  platforms?: string[];
  reason?: string;
  rating?: number;
};

const posters = [
  ["The Dark Knight", "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"],
  ["Interstellar", "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"],
  ["Spider-Verse", "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg"],
  ["Inception", "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"],
  ["Your Name", "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg"],
  ["Joker", "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"],
  ["The Godfather", "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg"],
  ["Fight Club", "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"],
  ["Deadpool", "https://image.tmdb.org/t/p/w500/fSRb7vyIP8rQpL0I47P3qUsEKX3.jpg"],
  ["La La Land", "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg"],
  ["Avengers", "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg"],
  ["Spirited Away", "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg"],
  ["PK", "https://image.tmdb.org/t/p/w500/z2x2Y4tncefsIU7h82gmUM5vnBJ.jpg"],
  ["Doctor Strange", "https://image.tmdb.org/t/p/w500/uGBVj3bEbCoZbDjjl9wTxcygko1.jpg"],
  ["Whiplash", "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg"],
  ["Oldboy", "https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg"],
  ["Wall-E", "https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg"],
  ["Demon Slayer", "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg"],
  ["Shawshank", "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"],
  ["3 Idiots", "https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg"],
  ["Baahubali", "https://image.tmdb.org/t/p/w500/21sC2assImQIYCEDA84Qh9d1RsK.jpg"],
  ["Tumbbad", "https://image.tmdb.org/t/p/w500/5Q3Iz5YaGZmbhSRWhtzN2eq4iUC.jpg"],
  ["The Lion King", "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg"],
  ["Gravity", "https://image.tmdb.org/t/p/w500/kZ2nZw8D681aphje8NJi8EfbL1U.jpg"],
];

export default function HomePage() {
  const router = useRouter();

  const [themeKey, setThemeKey] = useState<ThemeKey>("What2Watch");
  const [open, setOpen] = useState(false);
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);
  const [seenMovies, setSeenMovies] = useState<Movie[]>([]);
  const [libraryOpen, setLibraryOpen] = useState<"saved" | "seen" | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("What2WatchTheme") as ThemeKey | null;
    if (savedTheme && THEMES[savedTheme]) setThemeKey(savedTheme);

    setSavedMovies(JSON.parse(localStorage.getItem("savedMovies") || "[]"));
    setSeenMovies(JSON.parse(localStorage.getItem("seenMovies") || "[]"));
  }, []);

  const theme = THEMES[themeKey];

  function changeTheme(key: ThemeKey) {
    setThemeKey(key);
    saveTheme(key);
    setOpen(false);
  }

  function goToQuiz() {
    saveTheme(themeKey);
    router.push("/quiz");
  }

  function goToAI() {
    saveTheme(themeKey);
    router.push("/ai");
  }

  function updateSaved(list: Movie[]) {
    setSavedMovies(list);
    localStorage.setItem("savedMovies", JSON.stringify(list));
  }

  function updateSeen(list: Movie[]) {
    setSeenMovies(list);
    localStorage.setItem("seenMovies", JSON.stringify(list));
  }

  function removeSaved(movieId: string) {
    updateSaved(savedMovies.filter((m) => m.id !== movieId));
  }

  function removeSeen(movieId: string) {
    updateSeen(seenMovies.filter((m) => m.id !== movieId));
  }

  function moveSavedToSeen(movie: Movie) {
    removeSaved(movie.id);

    if (!seenMovies.find((m) => m.id === movie.id)) {
      updateSeen([...seenMovies, movie]);
    }
  }

  function moveSeenToSaved(movie: Movie) {
    removeSeen(movie.id);

    if (!savedMovies.find((m) => m.id === movie.id)) {
      updateSaved([...savedMovies, movie]);
    }
  }

  const libraryMovies = libraryOpen === "saved" ? savedMovies : seenMovies;

  return (
    <main className="relative min-h-screen overflow-hidden text-white" style={{ background: theme.bg }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 18% 22%, ${theme.glow}, transparent 35%),
          radial-gradient(circle at 78% 68%, ${theme.glow}, transparent 38%)`,
        }}
      />

      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/70 px-10 py-4 backdrop-blur-2xl">
        <div className="text-3xl font-black">
          W<span style={{ color: theme.accent }}>2W</span>
        </div>

        <div className="hidden items-center gap-10 text-sm font-bold text-zinc-400 md:flex">
          <a href="#how" className="hover:text-white">How it works</a>
          <a href="#library" className="hover:text-white">My Library</a>
          <button onClick={goToAI} className="hover:text-white">AI Chat</button>
          <button onClick={goToQuiz} className="hover:text-white">Quiz</button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold"
            >
              {theme.name} ▾
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#111]/95 p-3 backdrop-blur-xl">
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => changeTheme(key as ThemeKey)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white/10"
                  >
                    <span className="h-5 w-5 rounded-full" style={{ background: t.accent }} />
                    <span className="text-sm font-bold">{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-[1300px] grid-cols-1 items-center gap-8 px-8 py-3 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <div>
          <div
            className="mb-5 inline-flex rounded-full border px-4 py-2 text-[11px] font-black tracking-[0.28em]"
            style={{
              borderColor: theme.accent,
              color: theme.accent,
              background: `${theme.accent}18`,
            }}
          >
            AI MOVIE MATCHMAKER
          </div>

          <h1 className="max-w-[600px] text-4xl font-black leading-[0.9] tracking-[-0.05em] md:text-6xl xl:text-6.5xl">
            Find the film your{" "}
            <span className="italic" style={{ color: theme.accent }}>
              mood
            </span>{" "}
            is trying to describe.
          </h1>

          <p className="mt-4 max-w-xl text-l leading-relaxed text-zinc-400">
            Not sure what to watch?
            Use our smart quiz or AI movie assistant to get personalized recommendations based on mood, genres, language, era, and cinematic taste.
          </p>

          <div className="mt-4 flex flex-wrap gap-4">
            <button
              onClick={goToQuiz}
              className="rounded-full px-6 py-3 text-base font-black transition hover:scale-105"
              style={{
                background: theme.accent,
                color: theme.text,
                boxShadow: `0 0 35px ${theme.glow}`,
              }}
            >Start Guided Quiz
            </button>

            <button
              onClick={goToAI}
              className="rounded-full bg-white px-6 py-3 text-base font-black text-black transition hover:scale-105"
            >
              Ask What2Watch AI
            </button>
          </div>

          <div id="features" className="mt-10 flex flex-wrap gap-3">
            {["Semantic Search", "Mood Matching", "TMDB Powered", "OTT Aware", "Curated Dataset"].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-400">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[560px] justify-end pr-6">
          <div className="absolute inset-0 rounded-[3rem] bg-black/20 blur-2xl" />

          <div className="relative grid w-[600px] grid-cols-6 gap-2 rotate-[-1.5deg]">
            {posters.map(([title, img], index) => (
              <div
                key={`${title}-${index}`}
                className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl transition duration-300 hover:z-20 hover:scale-110"
              >
                <img
                  src={img}
                  alt={title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop";
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80" />

                <p className="absolute bottom-2 left-2 right-2 text-[10px] font-black uppercase leading-tight tracking-wide">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="library" className="relative z-10 mx-auto max-w-[1500px] px-10 pb-16">
        <div className="mb-8">
          <h2 className="text-5xl font-black">
            Your <span style={{ color: theme.accent }}>Library</span>
          </h2>
          <p className="mt-3 text-zinc-500">
            Saved and seen movies are stored locally on this browser.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={() => setLibraryOpen("saved")}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-left backdrop-blur-xl transition hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black">⭐ Saved Movies</h3>
              <span
                className="rounded-full px-4 py-2 text-sm font-black"
                style={{ background: theme.accent, color: theme.text }}
              >
                {savedMovies.length}
              </span>
            </div>

            <p className="mt-4 text-zinc-400">
              Movies you want to watch later.
            </p>

            <div className="mt-6 flex -space-x-3">
              {savedMovies.slice(0, 6).map((movie) =>
                movie.poster ? (
                  <img
                    key={movie.id}
                    src={movie.poster}
                    alt={movie.title}
                    className="h-20 w-14 rounded-xl border border-black object-cover"
                  />
                ) : null
              )}
            </div>
          </button>

          <button
            onClick={() => setLibraryOpen("seen")}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-left backdrop-blur-xl transition hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black">👁 Seen Movies</h3>
              <span
                className="rounded-full px-4 py-2 text-sm font-black"
                style={{ background: theme.accent, color: theme.text }}
              >
                {seenMovies.length}
              </span>
            </div>

            <p className="mt-4 text-zinc-400">
              Movies you have already watched.
            </p>

            <div className="mt-6 flex -space-x-3">
              {seenMovies.slice(0, 6).map((movie) =>
                movie.poster ? (
                  <img
                    key={movie.id}
                    src={movie.poster}
                    alt={movie.title}
                    className="h-20 w-14 rounded-xl border border-black object-cover"
                  />
                ) : null
              )}
            </div>
          </button>
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-[1300px] px-10 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <p className="text-sm font-black tracking-[0.3em]" style={{ color: theme.accent }}>
            HOW IT WORKS
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["1", "Tell us your mood", "Use the guided quiz or describe your perfect watch in your own words."],
              ["2", "AI understands the vibe", "What2Watch extracts mood, genre, language, themes, similar films, and OTT preference."],
              ["3", "Get smart picks", "You get movie cards with match score, reason, poster, year, overview, and platform info."],
            ].map(([num, title, desc]) => (
              <div key={num} className="rounded-3xl border border-white/10 bg-black/40 p-6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black"
                  style={{ background: theme.accent, color: theme.text }}
                >
                  {num}
                </div>

                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {libraryOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl"
          onClick={() => setLibraryOpen(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-zinc-800 bg-[#151515] p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLibraryOpen(null)}
              className="absolute right-5 top-5 h-11 w-11 rounded-full bg-black/60 text-xl hover:bg-red-600"
            >
              ×
            </button>

            <h2 className="text-5xl font-black">
              {libraryOpen === "saved" ? "⭐ Saved Movies" : "👁 Seen Movies"}
            </h2>

            {libraryMovies.length === 0 ? (
              <p className="mt-8 text-zinc-500">Nothing here yet.</p>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {libraryMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="relative flex gap-4 rounded-3xl border border-zinc-800 bg-black/30 p-4"
                  >
                    <button
                      onClick={() =>
                        libraryOpen === "saved"
                          ? removeSaved(movie.id)
                          : removeSeen(movie.id)
                      }
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600"
                      title="Remove movie"
                    >
                      ×
                    </button>

                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="h-36 w-24 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-36 w-24 items-center justify-center rounded-2xl bg-zinc-900 text-xs text-zinc-500">
                        No Poster
                      </div>
                    )}

                    <div className="pr-8">
                      <h3 className="text-2xl font-black">{movie.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{movie.year}</p>

                      {movie.rating && (
                        <p className="mt-2 text-sm font-bold text-yellow-400">
                          ⭐ {movie.rating.toFixed(1)} TMDB
                        </p>
                      )}

                      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-zinc-400">
                        {movie.overview}
                      </p>

                      <div className="mt-4 flex gap-3">
                        {libraryOpen === "saved" ? (
                          <button
                            onClick={() => moveSavedToSeen(movie)}
                            className="rounded-full px-4 py-2 text-sm font-bold"
                            style={{ background: theme.accent, color: theme.text }}
                          >
                            Mark Seen
                          </button>
                        ) : (
                          <button
                            onClick={() => moveSeenToSaved(movie)}
                            className="rounded-full px-4 py-2 text-sm font-bold"
                            style={{ background: theme.accent, color: theme.text }}
                          >
                            Save Again
                          </button>
                        )}

                        <button
                          onClick={() =>
                            libraryOpen === "saved"
                              ? removeSaved(movie.id)
                              : removeSeen(movie.id)
                          }
                          className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-bold hover:border-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}