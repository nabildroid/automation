import { Router } from "express";
import Firestore from "./repositories/firestore";
import Service from "../../core/service";
import TicktickClient from "../../services/ticktick";
import Ticktick from "./repositories/ticktick";
import GeneralStatistics from "./routes/general_statistics";
import Wallpaper from "./routes/wallpaper";
import SaveRanking from "./routes/save_ranking";

type ServiceConfig = {
  firestore: FirebaseFirestore.Firestore;
  ticktick: TicktickClient;
};

export default class TicktickService extends Service {
  static route = Router();
  db: Firestore;
  ticktick: Ticktick;

  constructor(config: ServiceConfig) {
    super();

    this.db = new Firestore(config.firestore);
    this.ticktick = new Ticktick(config.ticktick);

    this.initRoutes();
  }

  initRoutes() {
    const { route } = TicktickService;
    this.configRoutes(
      [
        ["get", "/statistics/general", new GeneralStatistics(this.ticktick)],
        [
          "post",
          "/statistics/ranking",
          new SaveRanking(this.ticktick, this.db),
        ],
        ["get", "/wallpaper", new Wallpaper(this.ticktick,this.db)],
      ],
      route
    );
  }
}
