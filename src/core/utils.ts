import * as stream from "stream";
import { firestore } from "firebase-admin";
import { promisify } from "util";
import Axios from "axios";
const finished = promisify(stream.finished);
import fs from "fs";
import { FlashcardStatistics } from "../domains/flashcard/models/flashcard_score";

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

export function mergeFlashcardStatistics(
  old: FlashcardStatistics,
  n: FlashcardStatistics
) {
  const merged: FlashcardStatistics = {
    date: n.date,
    states: {},
  };

  [...Object.entries(old.states), ...Object.entries(n.states)].forEach(
    ([key, value]) => {
      merged.states[parseInt(key)] =
        (merged.states[parseInt(key)] || 0) + value;
    }
  );

  return merged;
}

function recursiveConversion(
  data: { [key: string]: any },
  check: (value: any) => boolean,
  convert: (value: any) => any
) {
  const result: any = {};

  if (typeof data != "object") return data;

  const keys = Object.keys(data);

  for (const key of keys) {
    const value = data[key];

    if (check(value)) {
      result[key] = convert(value);
    } else if (!(value instanceof Array) && typeof value == "object") {
      result[key] = recursiveConversion(value, check, convert);
    } else if (value instanceof Array) {
      result[key] = value.map((v) => recursiveConversion(v, check, convert));
    } else {
      result[key] = value;
    }
  }

  return result;
}

// todo use this function in firestore.ts
// convert any dates within the @data to firestore timestamp
export function anyDateToFirestore(data: { [key: string]: any }) {
  return recursiveConversion(
    data,
    (x) => x instanceof Date,
    (x) => firestore.Timestamp.fromDate(x)
  );
}

// todo use this function in firestore.ts
// convert any dates within the @data to firestore timestamp
export function anyFirestoreToDate(data: { [key: string]: any }) {
  return recursiveConversion(
    data,
    (x) => x instanceof firestore.Timestamp,
    (x) => x.toDate()
  );
}

export function arrayEquals(a: any[], b: any[]) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}
