import mongoose from "mongoose";
import express from "express";
import listEndpoints from "express-list-endpoints";
import qtm from "query-to-mongo";
import UsersModel from "./model.js";
import createHttpError from "http-errors";

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

export default usersRouter;
