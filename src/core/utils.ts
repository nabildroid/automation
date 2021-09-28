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

export function dateFormat(date: Date) {
	const year = date.getFullYear();
	const month = toDigit(date.getMonth() + 1);
	const day = toDigit(date.getDate());

	const hour = toDigit(date.getHours());
	const min = toDigit(date.getMinutes());
	const second = toDigit(date.getSeconds());

	return `${year}-${month}-${day} ${hour}:${min}:${second}`;
}

export function toDigit(str: string | number) {
	if (str.toString().length == 1) return `0${str}`;
	else return str.toString();
}

export function today() {
	const now = new Date();
	now.setHours(0, 0, 0);
	return now;
}

export function yesterday() {
	const now = new Date();
	now.setDate(now.getDate() - 1);
	now.setHours(0, 0, 0);
	return now;
}
