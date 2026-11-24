import { Router } from "express";
import AS from "./auth.service.js";
import { Validation } from "../../common/middleWare/validation.js";
import { signInSchema, signUpSchema } from "./auth.validation.js";
import multerCloud from "../../common/middleWare/multer.cloud.js";
import { StoreEnum } from "../../common/Enum/multer.enum.js";
import { authentication } from "../../common/middleWare/authentication.js";

const authRouter = Router();
authRouter.post("/signup", Validation(signUpSchema), AS.signUp);
authRouter.post("/signin", Validation(signInSchema), AS.signIn);
authRouter.get("/getProfile", authentication, AS.getProfile);
// authRouter.post("/test", multerCloud({store_type:StoreEnum.disk}).single("attachment"), AS.test);




export default authRouter;
