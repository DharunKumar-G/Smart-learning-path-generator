// Motivational quotes for empty states and encouragement

export const learningQuotes = [
  {
    quote: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  },
  {
    quote: "Learning is not attained by chance, it must be sought for with ardor and diligence.",
    author: "Abigail Adams"
  },
  {
    quote: "The beautiful thing about learning is that nobody can take it away from you.",
    author: "B.B. King"
  },
  {
    quote: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    author: "Malcolm X"
  },
  {
    quote: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Dr. Seuss"
  },
  {
    quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi"
  },
  {
    quote: "Anyone who stops learning is old, whether at twenty or eighty.",
    author: "Henry Ford"
  },
  {
    quote: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
    author: "Brian Herbert"
  },
  {
    quote: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
    author: "Benjamin Franklin"
  },
  {
    quote: "The only person who is educated is the one who has learned how to learn and change.",
    author: "Carl Rogers"
  }
];

export const progressQuotes = [
  "Keep going! Every expert was once a beginner. 🚀",
  "You're doing amazing! Small steps lead to big results. 💪",
  "Progress, not perfection. You've got this! ⭐",
  "Every topic completed is a step towards mastery! 🎯",
  "Your dedication is inspiring. Keep learning! 📚",
  "The journey of a thousand miles begins with a single step. 🌟",
  "You're building something amazing - your future self! 🔥",
  "Consistency beats intensity. Keep showing up! 💎",
];

export const completionQuotes = [
  "🎉 Congratulations! You've completed this learning path!",
  "🏆 Amazing work! You've mastered this topic!",
  "🌟 Outstanding! Your dedication has paid off!",
  "🚀 You did it! Ready for your next adventure?",
  "💪 Incredible achievement! You should be proud!",
];

export const getRandomQuote = (quotes: typeof learningQuotes) => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const getRandomProgressQuote = () => {
  return progressQuotes[Math.floor(Math.random() * progressQuotes.length)];
};

export const getRandomCompletionQuote = () => {
  return completionQuotes[Math.floor(Math.random() * completionQuotes.length)];
};
