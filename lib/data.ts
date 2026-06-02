export const questions = [
  {
    id: "mood",
    question: "What's your mood?",
    subtitle: "Pick the vibes you're feeling right now",
    limit: 5,
    options: [
      "Happy", "Feel-good", "Emotional", "Sad", "Heartwarming",
      "Dark", "Intense", "Thrilling", "Suspenseful", "Relaxed",
      "Inspirational", "Nostalgic", "Adventurous", "Romantic",
      "Mysterious", "Empowering", "Melancholic", "Hopeful",
      "Quirky", "Reflective"
    ],
  },
  {
    id: "genre",
    question: "Pick your genres",
    subtitle: "Select genres you're in the mood for",
    limit: 5,
    options: [
      "Any ✨", "Action", "Romance", "Comedy", "Horror", "Thriller",
      "Mystery", "Sci-Fi", "Drama", "Fantasy", "Crime", "Adventure",
      "Animation", "Documentary", "Musical", "War", "Western", "Biography"
    ],
  },
  {
    id: "subGenre",
    question: "Get specific",
    subtitle: "Narrow it down with sub-genres",
    limit: 4,
    dynamic: true,
    options: [],
  },
  {
    id: "vibe",
    question: "What kind of experience?",
    subtitle: "How should the movie feel?",
    limit: 3,
    options: [
      "Light & Fun", "Deep & Meaningful", "Fast-Paced", "Mind-Bending",
      "Thought-Provoking", "Feel-Good", "Dark & Gritty",
      "Visually Stunning", "Emotionally Heavy", "Edge-of-Seat",
      "Cozy & Warm", "Epic & Grand"
    ],
  },
  {
    id: "language",
    question: "Language preference",
    subtitle: "Pick your preferred languages",
    limit: 3,
    options: [
      "Any ✨", "English", "Hindi", "Korean", "Tamil", "Telugu",
      "Japanese", "Spanish", "French", "German", "Italian", "Mandarin"
    ],
  },
  {
    id: "release",
    question: "New or classic?",
    subtitle: "When was it made?",
    limit: 1,
    options: ["Latest (2020+)", "Modern Classic (2000–2019)", "Classic (Before 2000)", "Any"],
  },
  {
    id: "platform",
    question: "Where do you watch?",
    subtitle: "Select your streaming platforms",
    limit: 3,
    options: [
      "Any ✨", "Netflix", "Prime Video", "Disney+", "HBO Max",
      "Apple TV+", "Hulu", "Paramount+", "Peacock", "Crunchyroll"
    ],
  },
];

export const subGenreMap: Record<string, string[]> = {
  Action: ["Superhero", "War", "Martial Arts", "Heist", "Fast-Paced Action"],
  Romance: ["Friends-to-Lovers", "Enemies-to-Lovers", "Rom-Com", "Tragic Love", "Slow Burn", "Second Chance", "Forbidden Love"],
  Comedy: ["Dark Comedy", "Slapstick", "Satire", "Parody", "Buddy Comedy", "Improv"],
  Horror: ["Psychological Horror", "Supernatural", "Slasher", "Horror-Comedy", "Found Footage"],
  Thriller: ["Psychological Thriller", "Crime Thriller", "Survival Thriller", "Mystery Thriller"],
  Mystery: ["Murder Mystery", "Detective", "Whodunit", "Plot Twist Heavy"],
  "Sci-Fi": ["Time Travel", "AI & Robots", "Cyberpunk", "Dystopian", "Space"],
  Drama: ["Family Drama", "Coming-of-Age", "Biographical", "Courtroom"],
  Fantasy: ["Epic Fantasy", "Urban Fantasy", "Dark Fantasy", "Fairy Tale", "Mythological"],
  Crime: ["Mob/Mafia", "True Crime", "Heist", "Drug Trade"],
  Adventure: ["Treasure Hunt", "Survival", "Exploration"],
  Animation: ["Anime", "Family Animation", "Pixar-style"],
  Musical: ["Broadway Adaptation", "Jukebox Musical", "Original Score"],
  War: ["World War", "Modern War", "Military Drama"],
  Western: ["Classic Western", "Neo-Western", "Outlaw"],
  Biography: ["Biopic", "Historical Figure", "Artist Story"],
};