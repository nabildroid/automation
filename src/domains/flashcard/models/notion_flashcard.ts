import Flashcard from "./flashcard";

export default interface NotionFlashcard extends Flashcard {
  id: string;
  created: Date;
  edited: Date;
  published: boolean;
}
