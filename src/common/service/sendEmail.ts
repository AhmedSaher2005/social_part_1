import nodemailer, { SendMailOptions } from "nodemailer";
import { randomInt } from "node:crypto";
import { EMAIL, PASSWORD } from "../../config/config.service";
const sendEmail = async ( options:SendMailOptions ) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: `"Ahmed" <${EMAIL}>`,
    to:options.to,
    subject:options.subject,
    html: options.html || "",
    attachments: options.attachments || [],
  });
  return info.accepted.length>0?true:false
};
export const generate_otp=async () => {
    return randomInt(100000,1000000).toString()
}
export default sendEmail;
