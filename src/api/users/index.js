import express from "express";
import qtm from "query-to-mongo";
import UsersModel from "./model.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import { createAccessToken } from "../../lib/auth/jwtTools.js";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      format: "jpeg",
      folder: "capstoneUsers",
    },
  }),
}).single("avatar");

const usersRouter = express.Router();

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    if (users) {
      res.send(users);
    } else {
      next(createHttpError(404, "Users not found"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/", async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await UsersModel.findOne({ email });
    if (existingUser) {
      const existingField = existingUser.email === email;
      return res
        .status(400)
        .send({ message: `User with ${existingField} already exists` });
    }
    const newUser = new UsersModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedUser = await UsersModel.findByIdAndDelete(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `User with ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const emailAlreadyRegistered = await UsersModel.findOne({ email: email });
    if (emailAlreadyRegistered) {
      return next(
        createHttpError(400, `User with provided email already exists`)
      );
    }
    const newUser = new UsersModel(req.body);
    await newUser.save();
    if (
      (newUser && email && password && name) ||
      (newUser && email && password && name && avatar)
    ) {
      const payload = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      };

      const accessToken = await createAccessToken(payload);
      res.status(201).send({ user: newUser, accessToken: accessToken });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user);
    console.log(user);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with provided id not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user);
    const user = await UsersModel.findById(req.user);
    if (user) {
      if (req.body.password) {
        const plainPassword = req.body.password;
        req.body.password = await bcrypt.hash(plainPassword, 10);
      }
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.user,
        req.body,
        { new: true, runValidators: true }
      );
      res.status(204).send(updatedUser);
    } else {
      next(createHttpError(404, `User with the provided id not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post(
  "/me/avatar",
  JWTAuthMiddleware,
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const url = req.file.path;
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.user._id,
        { avatar: url },
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.status(204).send(updatedUser);
      } else {
        next(createHttpError(404, `User with id ${req.user._id} not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
      };
      const accessToken = await createAccessToken(payload);
      res.send({ user, accessToken });
    } else {
      next(createHttpError(401, "Credentials are not OK!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(`404, user with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User ${user} not found`));
    }
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
