import mongoose from "mongoose";
import { DB_URL } from "../config/config.service";

const ConnectionDB = async () => {
  await mongoose
    .connect(DB_URL)
    .then(() => {
      console.log("DB connected successfully...😍😍");
    })
    .catch((err: any) => {
      console.log(err, "DB connected faild...😢😢");
    });
};
export default ConnectionDB;