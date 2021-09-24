import IFirestore from "../../repositories/contracts/iFirestore";
import INotion from "../../repositories/contracts/iNotion";
import ITicktick from "../../repositories/contracts/iTicktick";

export default interface IApp {
	notion: INotion;
	ticktick: ITicktick;
	db: IFirestore;
}
