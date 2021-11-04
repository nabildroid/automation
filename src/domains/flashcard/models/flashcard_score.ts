import { FlashcardProgress } from "./flashcard";

export default interface FlashcardScore {
  cards: {
    id: string;
    progress: FlashcardProgress;
    time: Date;
    state: number;
  }[];
  startTime: Date;
  endTime: Date;
}

export type FlashcardStatistics = {
  states: { [key: number]: number };
  date: Date;
};
