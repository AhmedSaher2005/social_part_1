import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import userRebository from "../../DB/DB.rebositories/user.rebository";
import { ACCESS_TOKEN_SIGNATURE } from "../../config/config.service";

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;
  const [perfix, token] = authorization?.split(" ") as string[];
  if (!token) {
    throw new Error("token is not exist", { cause: 409 });
  }
  switch (perfix) {
    case "Basic":
      const data = Buffer.from(token, "base64").toString();
      const [email, password] = data.split(":");
      //find user
      //check pass
      //req.user=user
      //next()
      break;
    case "Bearer":
      const decoded = jwt.verify(token, ACCESS_TOKEN_SIGNATURE) as JwtPayload;
      if (!decoded?.id) {
        throw new Error("invalid token", { cause: 409 });
      }
      const user = await userRebository.findOne({
        filter: { email: decoded.email.toLowerCase() },
      });
      req.user = user;
      req.decoded = decoded;
      next();
      if (!user) {
        throw new Error("user not exist", { cause: 409 });
      }

      break;

    default:
      break;
  }
  // if (!user?.isConfirmed) {
  //   throw new Error("Email is not confirmed please confirm your email ");
  // }

  // if (user?.changeCredentialAt?.getTime() > decoded.iat * 1000) {
  //   throw new Error("must be login again");
  // }
  // if ((await ttl(`revoke_tokoen::${user._id}::${decoded.jti}`)) > 0) {
  //   throw new Error("Invalid revoked-token you must login again");
  // }
};
