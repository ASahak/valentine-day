export type HintType = "icon" | "text" | "images" | "none"

export interface Question {
  id: number
  question: string
  answer: string
  options: string[] | null
  type: "select" | "input"
  hintType: HintType
  hintValue: string
  hintImages?: { label: string; src: string }[]
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "How did I call you during our very first phone conversation?",
    answer: "Ani",
    options: ["Honey", "Ani", "Nane", "Princess"],
    type: "select",
    hintType: "icon",
    hintValue: "Think about what comes before a phone call...",
  },
  {
    id: 2,
    question: "On what date did we first meet each other?",
    answer: "14/02/2018",
    options: ["14/02/2017", "14/02/2018", "14/02/2019", "01/01/2018"],
    type: "select",
    hintType: "text",
    hintValue: "It was a very special Valentine's Day...",
  },
  {
    id: 3,
    question:
      "When I asked you to help with my Russian client, what exactly did they write to me?",
    answer: "xz",
    options: ["privet", "ok", "xz", "da"],
    type: "select",
    hintType: "text",
    hintValue: "Two letters that mean 'I don't know' in Russian slang.",
  },
  {
    id: 4,
    question:
      "Which company did I want to join when I struggled during my Esterox onboarding?",
    answer: "Iguan",
    options: ["ArsSystem", "Iguan", "Evistep", "SoftConstruct"],
    type: "select",
    hintType: "text",
    hintValue: "Think of a reptile...",
  },
  {
    id: 5,
    question:
      "Where did we meet again for the first time after the COVID lockdowns?",
    answer: "Botanical Garden",
    options: ["Republic Square", "Cascade", "Botanical Garden", "Opera House"],
    type: "select",
    hintType: "text",
    hintValue: "A place full of flowers and trees.",
  },
  {
    id: 6,
    question: "Which day of the month September did I leave to go to war?",
    answer: "29",
    options: ["30", "28", "27", "29"],
    type: "select",
    hintType: "text",
    hintValue: "Almost the last day of the month...",
  },
  {
    id: 7,
    question: "What memorial/item did I leave with you before I left?",
    answer: "Hat",
    options: ["Ring", "Hat", "Watch", "Shirt"],
    type: "select",
    hintType: "text",
    hintValue: "Something I used to wear on my head.",
  },
  {
    id: 8,
    question:
      "Who was the most surprised person to find out about our relationship?",
    answer: "Armen",
    options: ["Armen", "Kspoyan", "Narek", "Lilit"],
    type: "select",
    hintType: "text",
    hintValue: "A close friend of our family.",
  },
  {
    id: 9,
    question: "What is my absolute favorite stylish car brand and model?",
    answer: "BMW E60",
    options: ["BMW E39", "Mercedes W211", "BMW E60", "Audi A6"],
    type: "select",
    hintType: "images",
    hintValue: "The Bavarian classic.",
    hintImages: [
      { label: "BMW E39", src: "/cars/bmw-e39.jpg" },
      { label: "Mercedes W211", src: "/cars/mercedes-w211.jpg" },
      { label: "BMW E60", src: "/cars/bmw-e60.jpg" },
      { label: "Audi A6", src: "/cars/audi-a6.jpg" },
    ],
  },
  {
    id: 10,
    question: "What is the one thing I love to eat the most?",
    answer: "Meat",
    options: ["Pizza", "Ajarakan", "Pasta", "Meat"],
    type: "select",
    hintType: "text",
    hintValue: "Something you grill or BBQ...",
  },
  {
    id: 11,
    question:
      "When I see a girl for the first time, what detail makes me fall in love?",
    answer: "Fingers",
    options: ["Eyes", "Smile", "Fingers", "Soul"],
    type: "select",
    hintType: "text",
    hintValue: "Look at the hands...",
  },
  {
    id: 12,
    question: "The most beautiful sentence in the world:",
    answer: "I love you",
    options: null,
    type: "input",
    hintType: "none",
    hintValue: "",
  },
]

export const TOTAL_STEPS = QUESTIONS.length
export const GATE_SPACING = 20
