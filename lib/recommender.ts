import { movies } from "./movies";

type Answers = Record<string, string[]>;

function hasAny(arr?: string[]) {
  return arr?.some((x) => x.includes("Any"));
}

function countMatches(a: string[] = [], b: string[] = []) {
  if (hasAny(b)) return 1;
  return a.filter((item) => b.includes(item)).length;
}

export function getPersonality(answers: Answers) {
  if (answers.genre?.includes("Romance")) return {
    title: "The Romantic",
    emoji: "💫",
    desc: "You’re drawn to stories of love, connection, and human emotion.",
  };

  if (answers.vibe?.includes("Mind-Bending")) return {
    title: "The Thinker",
    emoji: "🧠",
    desc: "You enjoy layered stories, big ideas, and clever twists.",
  };

  if (answers.genre?.includes("Action") || answers.mood?.includes("Thrilling")) return {
    title: "The Thrill Seeker",
    emoji: "⚡",
    desc: "You like high-energy stories that keep you on the edge.",
  };

  return {
    title: "The Explorer",
    emoji: "🌍",
    desc: "You enjoy discovering different worlds, emotions, and stories.",
  };
}

export function getRecommendations(answers: Answers) {
  const seen = JSON.parse(localStorage.getItem("seenMovies") || "[]");

  return movies
    .filter((movie) => !seen.includes(movie.id))
    .map((movie) => {
      let score = 0;

      score += countMatches(movie.moods, answers.mood) * 4;
      score += countMatches(movie.genres, answers.genre) * 5;
      score += countMatches(movie.subGenres, answers.subGenre) * 7;
      score += countMatches(movie.vibes, answers.vibe) * 4;

      if (hasAny(answers.language) || answers.language?.includes(movie.language)) score += 3;
      if (hasAny(answers.release) || answers.release?.includes(movie.release)) score += 2;
      if (hasAny(answers.platform) || movie.platforms.some((p) => answers.platform?.includes(p))) score += 4;

      const match = Math.min(99, Math.max(32, score * 4));

      const reasons = [
        countMatches(movie.moods, answers.mood) > 0 && "matches your mood",
        countMatches(movie.genres, answers.genre) > 0 && "fits your genre taste",
        countMatches(movie.subGenres, answers.subGenre) > 0 && "matches your sub-genre preference",
        countMatches(movie.vibes, answers.vibe) > 0 && "fits your viewing vibe",
      ].filter(Boolean);

      return {
        ...movie,
        score,
        match,
        reason: reasons.length
          ? reasons.join(" · ")
          : "Recommended because it has strong overall appeal based on your choices.",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}