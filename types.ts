export enum ActivityType {
  CONNECT_THE_DOTS = 'Ligue os Pontos',
  CROSSWORD = 'Cruzadinha',
  WORD_SEARCH = 'Caça-palavras',
  QUIZ = 'Provinha',
}

export interface UserInputs {
  theme: string;
  language: string;
  age: string;
  activityType: ActivityType;
  className: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface ConnectTheDotsData {
  type: ActivityType.CONNECT_THE_DOTS;
  title: string;
  points: Point[];
}

export interface CrosswordClue {
  num: number;
  clue: string;
  answer: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
}

export interface CrosswordData {
  type: ActivityType.CROSSWORD;
  title: string;
  gridSize: number;
  clues: CrosswordClue[];
}

export interface WordSearchData {
  type: ActivityType.WORD_SEARCH;
  title: string;
  gridSize: number;
  grid: string[][];
  words: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface QuizData {
  type: ActivityType.QUIZ;
  title: string;
  questions: QuizQuestion[];
}

export type GeneratedActivity = ConnectTheDotsData | CrosswordData | WordSearchData | QuizData;

export interface CoverPageData {
  type: 'COVER';
  className: string;
  theme: string;
}

export type PrintablePageData = GeneratedActivity | CoverPageData;

export interface GenerationResult {
    activities: GeneratedActivity[];
}