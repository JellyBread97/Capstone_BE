import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      required: false,
      default:
        "https://hips.hearstapps.com/hmg-prod/images/drinks-to-avoid-1621959532.jpg?crop=1.00xw:1.00xh;0,0&resize=1200:*",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const usersMongoDoc = this;
  const user = usersMongoDoc.toObject();
  delete user.password;
  delete user.__v;
  delete user.updatedAt;
  return user;
};

userSchema.pre("save", async function (next) {
  const currentUser = this;
  if (currentUser.isModified("password")) {
    const plainPW = currentUser.password;
    const hash = await bcrypt.hash(plainPW, 10);
    currentUser.password = hash;
  }
  next();
});

userSchema.static("checkCredentials", async function (email, plainPassword) {
  const user = await this.findOne({ email });

  if (user) {
    const isMatch = await bcrypt.compare(plainPassword, user.password);

    if (isMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("User", userSchema);
