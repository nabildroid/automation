import IFirestore from "../../repositories/contracts/iFirestore";
import INotion from "../../repositories/contracts/iNotion";
import ITicktick from "../../repositories/contracts/iTicktick";
import IStorage from "../../repositories/contracts/IStorage";
import PocketClient from "../../services/pocket";

export default interface IApp {
	notion: INotion;
	ticktick: ITicktick;
	pocket:PocketClient; // todo convert this to an interface
	db: IFirestore;
	storage: IStorage;
}
