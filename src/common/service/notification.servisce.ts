import { App, cert, initializeApp } from "firebase-admin";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getMessaging } from "firebase-admin/messaging";
import x from "../../config/social-app-4e25e-firebase-adminsdk-fbsvc-0551546f91.json"
class NotificationService {
  private client: App;
  constructor() {
this.client = initializeApp({
  credential: cert(
    JSON.parse(
      readFileSync(
        join(
          __dirname,
          "../../config/social-app-4e25e-firebase-adminsdk-fbsvc-0551546f91.json",
        ),
        "utf8",
      ),
    ),
  ),
});  }
  async sendNotification({token,data}:{token:string,data:{title:string,body:string}}){
    return await getMessaging(this.client).send({
        token,
        data,

    })
  }
}
export default new NotificationService()