# 🎓 Smart Learning Path Generator

An AI-powered EdTech application that creates **dynamic, personalized learning roadmaps** based on your current skills, career goals, and available time. No more generic syllabi – get a structured path that tells you exactly what to study and *why*.

![Smart Learning Path Generator](https://via.placeholder.com/800x400?text=Smart+Learning+Path+Generator)

## ✨ What Makes This Different?

Unlike traditional course platforms that give you a fixed curriculum, this app acts like a **personal academic counselor**:

- 🎯 **Understands your goals** - "I want to build a SaaS app" or "I want to land a frontend job"
- ⏰ **Respects your time** - Works with your schedule, whether it's 2 hours or 20 hours per week
- 🧠 **Explains the reasoning** - Every topic includes "Why this first?" so you stay motivated
- 🔍 **Smart resource finder** - Specific search strings instead of generic links

## 🚀 Features

### Core Features
- **Personalized Onboarding** - Input your skills, goals, and deadline
- **AI-Generated Roadmaps** - LLM creates structured, time-bound learning paths
- **Visual Timeline** - Clean Kanban/timeline view of your learning journey
- **Prerequisite Reasoning** - Understand why each topic is placed where it is
- **Smart Resource Finder** - Get specific YouTube/Google search strings for each topic

### Optional Features
- **Quiz Generation** - Test yourself with AI-generated MCQs for each week
- **Progress Tracking** - Mark topics as complete and see your progress
- **Export Roadmap** - Download your learning path as PDF or JSON

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Chakra UI |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL with Prisma ORM |
| AI | OpenAI GPT-4 API |
| Styling | Chakra UI + Custom theming |

## 📁 Project Structure

```
Smart-learning-path-generator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API calls
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── prisma/         # Database schema
│   │   └── utils/          # Helper functions
│   └── package.json
├── LEARNING.md             # Development learnings log
└── package.json            # Root monorepo config
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DharunKumar-G/Smart-learning-path-generator.git
   cd Smart-learning-path-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # In server/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/learning_path"
   OPENAI_API_KEY="your-openai-api-key"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Initialize the database**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📖 How It Works

1. **Onboarding** - Tell us about yourself:
   - Current skills ("I know basic HTML/CSS")
   - Target goal ("Build a SaaS application")
   - Available time ("6 hours/week for 1 month")

2. **AI Generation** - Our LLM:
   - Analyzes your inputs
   - Creates a structured JSON roadmap
   - Includes reasoning for each topic placement
   - Suggests specific learning resources

3. **Visualization** - View your roadmap:
   - Week-by-week breakdown
   - Click any topic for details
   - See prerequisite explanations
   - Get resource search strings

4. **Learn & Quiz** - Test your knowledge:
   - Generate MCQ quizzes per week
   - Track your progress
   - Adjust roadmap as needed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by [DharunKumar-G](https://github.com/DharunKumar-G)
- Powered by OpenAI's GPT models
- UI components from Chakra UI

---

**Happy Learning! 🎉**
