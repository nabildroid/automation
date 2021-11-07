import  { TaskReference } from "./task";

export interface NotionRow extends TaskReference {
	source: "notion";
}
