"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, ThemeKey } from "@/lib/themes";

type Answers = {
  mood: string[];
  genre: string[];
  subGenre: string[];
  vibe: string[];
  language: string[];
  release: string[];
  platform: string[];
};

const moodOptions = [
  "Happy",
  "Feel-good",
  "Emotional",
  "Sad",
  "Heartwarming",
  "Dark",
  "Intense",
  "Thrilling",
  "Suspenseful",
  "Relaxed",
  "Inspirational",
  "Nostalgic",
  "Adventurous",
  "Romantic",
  "Mysterious",
  "Empowering",
  "Melancholic",
  "Hopeful",
  "Quirky",
  "Reflective",
];

const genreOptions = [
  "Any ✨",
  "Action",
  "Romance",
  "Comedy",
  "Horror",
  "Thriller",
  "Mystery",
  "Sci-Fi",
  "Drama",
  "Fantasy",
  "Crime",
  "Adventure",
  "Animation",
  "Documentary",
  "Musical",
  "War",
  "Western",
  "Biography",
];

const subGenreMap: Record<string, string[]> = {
  Action: [
    "Spy Action",
    "Revenge",
    "Gangster",
    "Military Action",
    "Survival Action",
    "Mass Hero",
    "High-Stakes Mission",
  ],
  Romance: [
    "Friends-to-Lovers",
    "Enemies-to-Lovers",
    "Rom-Com",
    "Tragic Love",
    "Slow Burn",
    "Second Chance",
    "Forbidden Love",
  ],
  Comedy: [
    "Rom-Com",
    "Satire",
    "Family Comedy",
    "College Comedy",
    "Dark Comedy",
    "Feel-Good Comedy",
  ],
  Horror: [
    "Supernatural",
    "Haunted House",
    "Psychological Horror",
    "Slasher",
    "Creature Horror",
    "Folk Horror",
  ],
  Thriller: [
    "Psychological Thriller",
    "Crime Thriller",
    "Survival Thriller",
    "Mystery Thriller",
    "Slow Burn",
    "Mind Games",
  ],
  Mystery: [
    "Detective",
    "Murder Mystery",
    "Investigation",
    "Whodunit",
    "Missing Person",
    "Conspiracy",
  ],
  Crime: [
    "Mob/Mafia",
    "True Crime",
    "Heist",
    "Drug Trade",
    "Detective",
    "Murder Mystery",
    "Crime Thriller",
  ],
  Drama: [
    "Family Drama",
    "Coming of Age",
    "Social Drama",
    "Inspirational",
    "Emotional Journey",
    "Relationship Drama",
  ],
  "Sci-Fi": [
    "Time Travel",
    "Space Survival",
    "Dystopian",
    "AI/Robot",
    "Mind-Bending",
    "Alien Contact",
  ],
  Fantasy: [
    "Magical World",
    "Mythology",
    "Epic Quest",
    "Dark Fantasy",
    "Supernatural Fantasy",
  ],
  Adventure: [
    "Treasure Hunt",
    "Exploration",
    "Survival",
    "Epic Journey",
    "Jungle Adventure",
  ],
  War: [
    "World War",
    "Modern War",
    "Military Drama",
    "Naval/Submarine",
    "Patriotic War",
  ],
  Animation: [
    "Anime",
    "Feel-Good Animation",
    "Fantasy Animation",
    "Emotional Animation",
    "Adventure Animation",
  ],
  Documentary: [
    "True Crime",
    "Sports Documentary",
    "Music Documentary",
    "Political Documentary",
    "Nature Documentary",
  ],
  Musical: [
    "Romantic Musical",
    "Feel-Good Musical",
    "Classic Musical",
    "Dance Drama",
  ],
  Western: [
    "Classic Western",
    "Neo-Western",
    "Revenge Western",
    "Outlaw Story",
  ],
  Biography: [
    "Sports Biopic",
    "Political Biopic",
    "Music Biopic",
    "Inspirational Biopic",
  ],
};

const defaultSubGenres = [
  "Psychological Thriller",
  "Crime Thriller",
  "Mystery Thriller",
  "Survival Thriller",
  "Friends-to-Lovers",
  "Enemies-to-Lovers",
  "Rom-Com",
  "Coming of Age",
  "Family Drama",
  "Spy Action",
  "Revenge",
  "Gangster",
  "Time Travel",
  "Space Survival",
  "Naval/Submarine",
];

const vibeOptions = [
  "Light & Fun",
  "Deep & Meaningful",
  "Fast-Paced",
  "Mind-Bending",
  "Thought-Provoking",
  "Feel-Good",
  "Dark & Gritty",
  "Visually Stunning",
  "Emotionally Heavy",
  "Edge-of-Seat",
  "Cozy & Warm",
  "Epic & Grand",
];

const languageOptions = [
  "Any ✨",
  "Hindi",
  "English",
  "Korean",
  "Japanese",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Anime",
];

const releaseOptions = ["Any ✨", "Classic", "90s", "2000s", "Modern", "Latest"];

const platformOptions = [
  "Any ✨",
  "Netflix",
  "Prime Video",
  "JioHotstar",
  "Disney+ Hotstar",
  "Sony LIV",
  "Zee5",
  "Apple TV+",
];

const steps = [
  {
    key: "mood",
    title: "What's your mood?",
    subtitle: "Pick the vibes you're feeling right now",
    max: 5,
  },
  {
    key: "genre",
    title: "Pick your genres",
    subtitle: "Select genres you're in the mood for",
    max: 5,
  },
  {
    key: "subGenre",
    title: "Get specific",
    subtitle: "Narrow it down based on your selected genres",
    max: 4,
  },
  {
    key: "vibe",
    title: "What kind of experience?",
    subtitle: "How should the movie feel?",
    max: 3,
  },
  {
    key: "language",
    title: "Pick languages",
    subtitle: "Choose what you'd like to watch",
    max: 3,
  },
  {
    key: "release",
    title: "Release era",
    subtitle: "Choose the time period you prefer",
    max: 2,
  },
  {
    key: "platform",
    title: "Preferred OTT platform",
    subtitle: "Where do you usually watch?",
    max: 3,
  },
];

export default function QuizPage() {
  const router = useRouter();

  const [themeKey, setThemeKey] = useState<ThemeKey>("What2Watch");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [answers, setAnswers] = useState<Answers>({
    mood: [],
    genre: [],
    subGenre: [],
    vibe: [],
    language: [],
    release: [],
    platform: [],
  });

  useEffect(() => {
    const saved = localStorage.getItem("What2WatchTheme") as ThemeKey | null;

    if (saved && THEMES[saved]) {
      setThemeKey(saved);
    }
  }, []);

  const theme = THEMES[themeKey];
  const current = steps[step];
  const currentAnswers = answers[current.key as keyof Answers];

  const currentOptions = useMemo(() => {
    if (current.key === "mood") return moodOptions;
    if (current.key === "genre") return genreOptions;
    if (current.key === "vibe") return vibeOptions;
    if (current.key === "language") return languageOptions;
    if (current.key === "release") return releaseOptions;
    if (current.key === "platform") return platformOptions;

    if (current.key === "subGenre") {
      const selectedGenres = answers.genre.filter((g) => !g.includes("Any"));
      const dynamic = selectedGenres.flatMap((g) => subGenreMap[g] || []);

      return [...new Set(dynamic.length ? dynamic : defaultSubGenres)];
    }

    return [];
  }, [current.key, answers.genre]);

  function toggleOption(option: string) {
    const key = current.key as keyof Answers;
    const existing = answers[key];

    if (option.includes("Any")) {
      setAnswers({
        ...answers,
        [key]: existing.includes(option) ? [] : [option],
      });
      return;
    }

    const withoutAny = existing.filter((x) => !x.includes("Any"));

    if (withoutAny.includes(option)) {
      setAnswers({
        ...answers,
        [key]: withoutAny.filter((x) => x !== option),
      });
      return;
    }

    if (withoutAny.length >= current.max) return;

    setAnswers({
      ...answers,
      [key]: [...withoutAny, option],
    });
  }

  async function finishQuiz() {
    setLoading(true);

    try {
      localStorage.setItem("What2WatchAnswers", JSON.stringify(answers));
      localStorage.removeItem("quizResults");

      const res = await fetch("/api/quiz-recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Quiz recommendation failed");
        return;
      }

      const fallbackPersonalities = [
  {
    title: "The Cinematic Explorer",
    emoji: "🎬",
    description:
      "You enjoy discovering stories across genres, moods, languages, and cinematic experiences.",
  },
  {
    title: "The Mind Bender",
    emoji: "🧠",
    description:
      "You love complex plots, psychological twists, sci-fi ideas, and movies that make you think.",
  },
  {
    title: "The Emotional Dreamer",
    emoji: "❤️",
    description:
      "You connect with emotional stories, romance, heartbreak, healing, and character-driven journeys.",
  },
  {
    title: "The Adrenaline Seeker",
    emoji: "🔥",
    description:
      "You enjoy action, thrillers, fast pacing, danger, fights, chases, and high-stakes stories.",
  },
  {
    title: "The Comfort Watcher",
    emoji: "😂",
    description:
      "You prefer funny, warm, light-hearted, feel-good movies that help you relax.",
  },
  {
    title: "The Mystery Hunter",
    emoji: "🕵️",
    description:
      "You enjoy crime, suspense, investigations, secrets, detectives, and unpredictable endings.",
  },
  {
    title: "The Fantasy Escapist",
    emoji: "🏰",
    description:
      "You love magical worlds, mythology, adventure, superheroes, fantasy, and grand imagination.",
  },
  {
    title: "The Dark Story Enthusiast",
    emoji: "😈",
    description:
      "You enjoy intense, dark, disturbing, morally grey, and emotionally heavy stories.",
  },
  {
    title: "The Character Obsessed",
    emoji: "🎭",
    description:
      "You care most about strong acting, layered characters, relationships, and emotional depth.",
  },
  {
    title: "The World Cinema Lover",
    emoji: "🌍",
    description:
      "You enjoy exploring films across languages, cultures, countries, and unique storytelling styles.",
  },
  {
    title: "The Sci-Fi Visionary",
    emoji: "🚀",
    description:
      "You love futuristic ideas, space, technology, AI, time travel, and science-driven stories.",
  },
  {
    title: "The Horror Thrill Chaser",
    emoji: "👻",
    description:
      "You enjoy fear, tension, supernatural stories, survival horror, jump scares, and eerie atmospheres.",
  },
  {
    title: "The Romantic Soul",
    emoji: "💘",
    description:
      "You enjoy love stories, chemistry, emotional bonds, heartbreak, and relationship drama.",
  },
  {
    title: "The Plot Twist Addict",
    emoji: "🤯",
    description:
      "You love shocking reveals, unpredictable endings, hidden clues, and stories that flip suddenly.",
  },
  {
    title: "The Anime Enthusiast",
    emoji: "🎌",
    description:
      "You enjoy anime films, stylized worlds, emotional arcs, fantasy, action, and Japanese storytelling.",
  },
];

const randomPersonality =
  fallbackPersonalities[
    Math.floor(Math.random() * fallbackPersonalities.length)
  ];

localStorage.setItem("quizResults", JSON.stringify(data.movies || []));

localStorage.setItem(
  "moviePersonality",
  JSON.stringify(data.personality || randomPersonality)
);

      router.push("/results");
    } catch (err) {
      console.error(err);
      alert("Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center text-white"
        style={{ background: theme.bg }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-current"
            style={{ color: theme.accent }}
          />

          <h2 className="text-4xl font-black">Finding your perfect movies...</h2>

          <p className="mt-3 text-white/60">
            Gemini + TMDB are matching your cinematic taste
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-6 py-6 text-white"
      style={{ background: theme.bg }}
    >
      <section className="mx-auto min-h-[50vh] max-w-5xl rounded-[1.5rem] border border-white/10 bg-[#111]/80 px-6 py-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>
              STEP {step + 1} OF {steps.length}
            </span>

            <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${((step + 1) / steps.length) * 100}%`,
                background: theme.accent,
              }}
            />
          </div>

          <div className="mt-10 text-center">
            <h1 className="text-3xl font-black md:text-4xl">
              {current.title}
            </h1>

            <p className="mt-5 text-lg text-zinc-400">
              {current.subtitle}{" "}
              <span style={{ color: theme.accent }}>(max {current.max})</span>
            </p>

            <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
              {currentOptions.map((option) => {
                const active = currentAnswers.includes(option);

                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(option)}
                    className="rounded-full border px-6 py-3 text-base transition-all duration-300 hover:scale-105"
                    style={{
                      background: active
                        ? theme.accent
                        : "rgba(255,255,255,0.04)",
                      borderColor: active
                        ? theme.accent
                        : "rgba(255,255,255,0.1)",
                      color: active ? theme.text : "#a1a1aa",
                      boxShadow: active ? `0 0 25px ${theme.glow}` : "none",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-5">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="rounded-full border border-zinc-700 px-10 py-4 font-bold disabled:opacity-40"
            >
              Back
            </button>

            <button
              disabled={currentAnswers.length === 0}
              onClick={() => {
                if (step === steps.length - 1) finishQuiz();
                else setStep(step + 1);
              }}
              className="rounded-full px-12 py-2 font-black disabled:opacity-40"
              style={{
                background: currentAnswers.length ? theme.accent : "#27272a",
                color: currentAnswers.length ? theme.text : "#71717a",
              }}
            >
              {step === steps.length - 1 ? "Get Results" : "Next"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}