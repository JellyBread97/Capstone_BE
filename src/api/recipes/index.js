import mongoose from "mongoose";
import express from "express";
import listEndpoints from "express-list-endpoints";
import qtm from "query-to-mongo";
import RecipesModel from "./model.js";
import createHttpError from "http-errors";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";

const recipesRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      format: "jpeg",
      folder: "recipes",
    },
  }),
}).single("cocktail");

recipesRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const recipes = await RecipesModel.find()
      .populate("creator")
      .populate({ path: "ingredients", populate: { path: "ingredient" } });

    if (recipes) {
      res.send(recipes);
    } else {
      next(createHttpError(404, "recipes not found"));
    }
  } catch (error) {
    next(error);
  }
});

recipesRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body;
    const existingRecipe = await RecipesModel.findOne({ name });
    if (existingRecipe) {
      const existingField = existingRecipe.name === name;
      return res
        .status(400)
        .send({ message: `Recipe with ${existingField} already exists` });
    }
    const newRecipe = new RecipesModel(req.body);
    const { _id } = await newRecipe.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

recipesRouter.post(
  "/:recipeId/image",
  JWTAuthMiddleware,
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const url = req.file.path;
      const updatedRecipe = await RecipesModel.findByIdAndUpdate(
        req.params.recipeId,
        { image: url },
        { new: true, runValidators: true }
      );
      if (updatedRecipe) {
        res.status(204).send(updatedRecipe);
      } else {
        createHttpError(
          404,
          `Recipe with id ${req.params.recipeId} is not Found`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

recipesRouter.get("/:recipeId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const recipe = await RecipesModel.findById(req.params.recipeId);
    if (recipe) {
      res.send(recipe);
    } else {
      next(createHttpError(404, "Recipe not found"));
    }
  } catch (error) {
    next(error);
  }
});

recipesRouter.delete(
  "/:recipeId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const deletedRecipe = await RecipesModel.findByIdAndDelete(
        req.params.recipeId
      );
      if (deletedRecipe) {
        res.status(204).send();
      } else {
        next(
          createHttpError(404, `Recipe with ${req.params.recipeId} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

recipesRouter.put("/:recipeId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedRecipe = await RecipesModel.findByIdAndUpdate(
      req.params.recipeId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedRecipe) {
      res.send(updatedRecipe);
    } else {
      next(
        createHttpError(`404, Recipe with id ${req.params.recipeId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default recipesRouter;
