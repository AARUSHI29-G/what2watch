# 🎬 What2Watch

**What2Watch** is an AI-powered movie discovery platform that helps users find movies based on their mood, genre preferences, language, OTT platform, era, and cinematic personality.

Instead of endlessly scrolling through streaming platforms, users can take a guided quiz or use AI-powered recommendations to discover films that match their exact vibe.

🌐 **Live Demo:** https://what2watch-beryl.vercel.app
📂 **GitHub Repository:** https://github.com/AARUSHI29-G/what2watch

---

## ✨ Features

* 🤖 **AI Movie Matchmaker**
  Generates personalized movie recommendations using user preferences.

* 🎭 **Movie Personality Detection**
  Assigns users a cinematic personality based on their quiz choices.

* 🎬 **Reference-Based Recommendations**
  Users can mention a movie they like and get similar recommendations.

* 🌍 **Multi-Language Support**
  Supports Hindi, English, Korean, Japanese, Tamil, Telugu, Malayalam, and more.

* 📺 **OTT Platform Filtering**
  Helps users discover movies available on preferred streaming platforms.

* ⭐ **Save Movies**
  Users can save movies they want to watch later.

* 👀 **Seen Movies Tracking**
  Allows users to mark already-watched movies.

* 🎨 **Dynamic UI Themes**
  Provides a stylish, cinematic, Netflix-inspired interface.

* 🚀 **Live Deployment**
  Deployed on Vercel with GitHub integration.

---

## 🖼 Preview

### Home Page

![What2Watch Home Page](./public/home.png)

### Quiz & Recommendations

![What2Watch Quiz](./public/quiz.png)
![What2Watch Quiz](./public/quiz2.png)

### Movie Personality Popup

![What2Watch Results](./public/results.png)

### AI Recommendations

![What2Watch Quiz](./public/ai.png)

---

## 🛠 Tech Stack

| Technology       | Purpose                         |
| ---------------- | ------------------------------- |
| **Next.js**      | Frontend framework and routing  |
| **TypeScript**   | Type-safe development           |
| **Tailwind CSS** | Styling and responsive UI       |
| **Gemini AI**    | AI-powered recommendation logic |
| **TMDB API**     | Movie metadata and posters      |
| **LocalStorage** | Saved and seen movie tracking   |
| **Vercel**       | Deployment and hosting          |

---

## 📁 Project Structure

```bash
what2watch/
├── app/
│   ├── api/
│   ├── quiz/
│   ├── results/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── data/
├── lib/
│   ├── aiIntentParser.ts
│   ├── data.ts
│   ├── geminiIntent.ts
│   ├── genreProfiles.ts
│   ├── movies.ts
│   ├── recommender.ts
│   ├── semanticMatcher.ts
│   └── themes.ts
├── public/
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AARUSHI29-G/what2watch.git
```

### 2. Move into the project folder

```bash
cd what2watch
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create environment file

Create a `.env.local` file in the root folder:

```env
GEMINI_API_KEY=your_gemini_api_key
TMDB_API_KEY=your_tmdb_api_key
```

### 5. Run the development server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## 🌐 Deployment

The project is deployed using **Vercel**.

Every push to the `main` branch automatically triggers a new production deployment.

Live URL:

```bash
https://what2watch-beryl.vercel.app
```

---

## 🎯 Future Improvements

* User authentication
* Personalized watch history
* Advanced AI chat assistant
* Better OTT availability accuracy
* More refined movie personality engine
* Recommendation explanation scoring
* Mobile app version

---

## 👩‍💻 Author

**Aarushi Gullia**

* GitHub: https://github.com/AARUSHI29-G
* Project: What2Watch
* Live Demo: https://what2watch-beryl.vercel.app

---

## ⭐ Support

If you like this project, consider starring the repository.
