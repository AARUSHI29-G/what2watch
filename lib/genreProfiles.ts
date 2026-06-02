export const genreProfiles = {
  thriller: {
    triggers: ["thriller", "crime", "suspense", "mystery", "mind", "dark", "serious"],
    genreIds: [53, 80, 9648],
    keywords: ["crime", "murder", "investigation", "psychological thriller", "suspense"],
    exclude: ["romance", "wedding", "feel good", "coming of age", "family drama"],
  },

  romance: {
    triggers: ["romance", "romantic", "love", "heartwarming", "cozy", "feel-good"],
    genreIds: [10749, 35, 18],
    keywords: ["love", "relationship", "heartbreak", "romantic comedy"],
    exclude: ["murder", "violent", "war", "crime"],
  },

  action: {
    triggers: ["action", "intense", "fight", "spy", "patriotic", "adventure"],
    genreIds: [28, 12, 53],
    keywords: ["spy", "mission", "fight", "revenge", "agent"],
    exclude: ["slow romance", "family drama"],
  },

  horror: {
    triggers: ["horror", "scary", "ghost", "supernatural", "haunted"],
    genreIds: [27, 9648, 53],
    keywords: ["ghost", "haunted", "supernatural", "evil"],
    exclude: ["romantic comedy", "feel good"],
  },

  animeFantasy: {
    triggers: ["anime", "animation", "fantasy", "magical", "dreamy"],
    genreIds: [16, 14, 12],
    keywords: ["anime", "magic", "fantasy", "dream"],
    exclude: ["crime", "murder"],
  },
};

export function getActiveProfile(text: string) {
  const lower = text.toLowerCase();

  return Object.values(genreProfiles).find((profile) =>
    profile.triggers.some((trigger) => lower.includes(trigger))
  );
}