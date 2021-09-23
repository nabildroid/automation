import notion_inbox from "../entities/notion_inbox";
import notion_journal from "../entities/notion_journal";
import INotion from "./contracts/iNotion";

export default class Notion  implements INotion{
    constructor(auth:string){

    }
    getInbox(): Promise<notion_inbox[]> {
        throw new Error("Method not implemented.");
    }
    getTodayJournal(): Promise<notion_journal> {
        throw new Error("Method not implemented.");
    }
    createJournal(): Promise<notion_journal> {
        throw new Error("Method not implemented.");
    }
    addJournalData(journal: notion_journal, data: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}