export default interface TicktickGeneralStats {
	score: number;
	level: number;
	yesterdayCompleted: number;
	todayCompleted: number;
	totalCompleted: number;
	scoreByDay: { [dayTimestemp: string]: number };
	taskByDay: {
		[dayTimestemp: string]: {
			completeCount: number;
			notCompleteCount: number;
		};
	};
}
