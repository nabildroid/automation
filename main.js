const fs = require("fs");

const data = JSON.parse(fs.readFileSync("./ticktick_ranking.json"));

const items = [["date","ranking","score","completed"]];
for (let i = 1; i < data.length; i++) {
  items.push([
    data[i].dayCount,
    data[i].ranking - data[i - 1].ranking,
    data[i].score - data[i - 1].score,
    data[i].completedCount - data[i - 1].completedCount,
  ]);
}


fs.writeFileSync("output.csv", items.map(e=>e.join(",")).join("\n"));
