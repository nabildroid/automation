import * as stream from "stream";
import { promisify } from "util";
import Axios from "axios";
const finished = promisify(stream.finished);
import fs from "fs";

export const setTodayUTCHour = (hour: number) => {
	const today = new Date();
	today.setUTCHours(hour);
	return today;
};

export async function downloadFile(
	fileUrl: string,
	outputLocationPath: string
): Promise<() => void> {
	const writer = fs.createWriteStream(outputLocationPath);
	return Axios({
		method: "get",
		url: fileUrl,
		responseType: "stream",
	})
		.then(async (response) => {
			response.data.pipe(writer);
			return finished(writer); //this is a Promise
		})
		.then(() => () => fs.rmSync(outputLocationPath));
}
