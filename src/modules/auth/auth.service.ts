import { NextFunction, Request, Response } from "express";
import { Iuser } from "../../DB/models/user.model";
import { AppError } from "../../common/utils/globalErrorHandling";
import { HashSecurity } from "../../common/secuirty/hashing.js";
import { EncryptionSecurity } from "../../common/secuirty/encryption.js";
import { SuccessResponse } from "../../common/utils/success.response.js";
import { providerEnum } from "../../common/Enum/user.enum";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SIGNATURE,
  REFRESH_TOKEN_SIGNATURE,
} from "../../config/config.service";
import { OAuth2Client } from "google-auth-library";
import { S3Service } from "../../common/service/s3.service";
import userRebository from "../../DB/DB.rebositories/user.rebository.js";
import sendEmail, { generate_otp } from "../../common/service/sendEmail";
import{eventEmitter} from "../../common/utils/Events";
import RedisService from "../../DB/connectionRedis"

class AuthService {
  private readonly _userRebo = userRebository;
  private readonly _redisService = RedisService;
  private readonly _hash = new HashSecurity();
  private readonly _encryption = new EncryptionSecurity();
  private readonly S3Service = new S3Service();
  constructor() {}
  ////////////////////////////signUp/////////////////////////////////////
  signUp = SuccessResponse(
    async (req: Request, res: Response, next: NextFunction) => {
      const { fName, lName, email, password, gender, phone }: Iuser = req.body;
      const encrypt = this._encryption.Encrypt(phone as string);
      const hashedPassword = await this._hash.Hash(password);
      const emailExist = await this._userRebo.findOne({ filter: { email } });
      if (emailExist) throw new AppError("Email already exists", 409);
        const otp = await generate_otp();
  const otpHash = hashSync(otp, 12);
  await this._redisService.setValue({
    key: `otp::${email}`,
    value: otpHash,
    ttl: 60 * 20,
  });
  await  this._redisService.setValue({
    key: `otp::max:${email}`,
    value: 1,
    ttl: 60 * 5,
  });
  eventEmitter.emit("confirm_email", async () => {
    await sendEmail({
      to: email,
      subject: "Confirm Email",
      html: `<h1>otp:${otp}</h1>`,
    });
  });


      const user = await this._userRebo.create({
        fName,
        lName,
        email,
        gender,
        password: hashedPassword,
        phone: encrypt,
      } as Partial<Iuser>);

      // res.status(200).json({ message: "Done", user });
      return { statusCode: 201, message: "created", data: user };
    },
  );
  ///////////////////////////signIN/////////////////////////////////////
  signIn = SuccessResponse(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      const user = await this._userRebo.findOne({
        filter: { email: email.toLowerCase(), provider: providerEnum.system },
      });
      if (!user) {
        throw new Error("Email is not exist", { cause: 409 });
      }
      // if (user.isConfirmed !== true) {
      // throw new Error("Email is not confirmed");
      //}
      if (!compareSync(password, user.password)) {
        throw new Error("invalid password", { cause: 409 });
      }
      const access_token = jwt.sign(
        { id: user._id, email: user.email },
        ACCESS_TOKEN_SIGNATURE,
        {
          expiresIn: "1h",
        },
      );
      const refresh_token = jwt.sign(
        { id: user._id },
        REFRESH_TOKEN_SIGNATURE,
        {
          expiresIn: "1d",
        },
      );
      return { data: { access_token, refresh_token } };
    },
  );

  getProfile = SuccessResponse(
    async (req: Request, res: Response, next: NextFunction) => {
      return { user: req.user };
    },
  );
//=============================confirmEmail=========================

  confirmEmail =SuccessResponse(
     async (req:Request, res:Response, next:NextFunction) => {
  const { email, otp } = req.body;
  const otpValue = await  this._redisService.getValue(`otp::${email}`);
  if (!otpValue) {
    throw new Error("otp expire", { cause: 400 });
  }
  if (!compareSync(otp, otpValue)) {
    throw new Error("Invalid otp", { cause: 400 });
  }
  const user = await this._userRebo.findOneAndUpdate({
    filter: {
      email,
      isConfirmed: { $exists: false },
    },
    update: {
      isConfirmed: true,
    },
  });
  if (!user) {
    throw new Error("user is not exist or already confirmed", { cause: 400 });
  }
  await  this._redisService.deleteKey(`otp::${email}`);
return{data:user}
}
  )



//   ////////////////////////////test/////////////////////////////////////
//   test = async (req: Request, res: Response, next: NextFunction) => {
//     const { fileName, ContentType } = req.body;
//     const { url, Key } = await this.S3Service.createpresignedUrl({
//       ContentType,
//       fileName,
//       path: "attachment",
//       expiresIn: 60,
//     });
//     SuccessResponse({
//       res,
//       statusCode: 200,
//       message: "done",
//       data: { url, Key },
//     });
//   };
 }

 export default new AuthService();
