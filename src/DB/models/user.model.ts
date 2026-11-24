import mongoose, { HydratedDocument } from "mongoose";
import { GenderEnum, RoleEnum } from "../../common/Enum/user.enum";
import { hashSync } from "bcrypt";
import sendEmail from "../../common/service/sendEmail";

export interface Iuser {
  fName: string;
  lName: string;
  email: string;
  password: string;
  cPassword: string;
  gender?: GenderEnum;
  role?: RoleEnum;
  phone?: string;
  provider?: string;
  isConfirmed?: boolean;
  profileImage?: string;
}
const UserSchema = new mongoose.Schema<Iuser>(
  {
    fName: {
      type: String,
      trim: true,
      minLength: 4,
      maxLength: 20,
      required: true,
    },
    lName: {
      type: String,
      trim: true,
      minLength: 4,
      maxLength: 20,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    gender: {
      type: String,
      enum: [GenderEnum.male, GenderEnum.female],
      default: GenderEnum.male,
    },
    role: {
      type: String,
      enum: [RoleEnum.user, RoleEnum.admin],
      default: RoleEnum.user,
    },

    phone: String,
    profileImage: String,
    isConfirmed: Boolean,
  },
  {
    timestamps: true,
    strictQuery: true,
  },
);
// UserSchema.pre(
//   "save",
//   function (this: HydratedDocument<Iuser & { is_new: boolean }>) {
//     console.log("============pre save hook===============");
//     console.log(this.isNew);
//     this.is_new = this.isNew;
//     if (this.isModified("password")) {
//       this.password = hashSync(this.password, 12);
//     }
//   },
// );
// UserSchema.post("save", async function () {
//   console.log("============post save hook===============");
//   const that = this as HydratedDocument<Iuser & { is_new: boolean }>;
//   console.log(that.is_new);
//   console.log("is_new =", that.is_new, "| isNew =", that.isNew);
//   if (that.is_new) {
//     await sendEmail({
//       to: this.email,
//       subject: "confirm your email",
//     });
//   }
// });
// UserSchema.pre("validate", function () {
//   console.log("============pre validate hook===============");
//   console.log(this);
// });
// UserSchema.post("validate", function () {
//   console.log("============post validate hook===============");
//   console.log(this);
// });
// UserSchema.pre("findOne", function () {
//   console.log("============pre findOne hook===============");
//   console.log(this.getQuery());
//   const query = this.getQuery();
//   const { paranoid, ...rest } = query;
//   if (paranoid) {
//     this.setQuery({ ...rest });
//     console.log(this.getQuery());
//   } else {
//     this.setQuery({ ...rest, isDeleted: { $exists: false } });
//     console.log(this.getQuery());
//   }
// });
// UserSchema.post("findOne", function () {
//   console.log("============post findOne hook===============");
//   console.log(this);
// });

const userModel =
  mongoose.models.User || mongoose.model<Iuser>("User", UserSchema);
export default userModel;
