export default interface Flashcard {
  term: string;
  definition: string;
  tags: string[];
}

export interface FlashcardProgress {
  interval: number;
  ease: number;
  repetitions: number;
}

export interface FlashcardSpecial {
  boosted: boolean;
}
