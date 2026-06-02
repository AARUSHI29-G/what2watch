import movies from "@/data/movies.json";

function normalize(text: string) {
  return text.toLowerCase();
}

export function findMatches(userText: string) {
  const query = normalize(userText);

  const scored = movies.map((movie: any) => {
    let score = 0;

    const fields = [
      ...(movie.genres || []),
      ...(movie.subGenres || []),
      ...(movie.moods || []),
      ...(movie.vibes || []),
      ...(movie.themes || []),
      ...(movie.keywords || []),
      ...(movie.similarTo || []),
      ...(movie.audience || []),
    ];

    fields.forEach((field: string) => {
      const value = normalize(field);

      if (query.includes(value)) {
        score += 15;
      }

      value.split(" ").forEach((word) => {
        if (query.includes(word)) {
          score += 3;
        }
      });
    });

    return {
      ...movie,
      score,
    };
  });

  return scored
    .filter((m: any) => m.score > 5)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 12);
}