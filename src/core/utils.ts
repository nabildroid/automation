export const setTodayUTCHour = (hour: number) => {
	const today = new Date();
	today.setUTCHours(hour);
	return today;
};
