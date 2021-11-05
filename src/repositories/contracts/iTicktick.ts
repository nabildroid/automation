import TicktickGeneralStats from "../../entities/ticktick_general_stats";

export default interface ITicktick {
	getGeneralStatistis(): Promise<TicktickGeneralStats>;
}
