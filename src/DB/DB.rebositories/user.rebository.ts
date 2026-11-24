import { Model } from "mongoose";
import userModel, { Iuser } from "../models/user.model.js";
import { DBRebository } from "./db.rebository.js";

 class UserRebository extends DBRebository<Iuser> {
  constructor(public readonly model: Model<Iuser> = userModel) {
    super(model);
  }
  createUser = async (data: Partial<Iuser>) => {
    return await this.model.create([data]);
  };
}
export default new UserRebository();