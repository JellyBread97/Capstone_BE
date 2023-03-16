import mongoose from "mongoose";
import express from "express";
import listEndpoints from "express-list-endpoints";
import qtm from "query-to-mongo";
import RecipesModel from "./model.js";
import createHttpError from "http-errors";

const recipesRouter = express.Router();

recipesRouter.get("/", async (req, res, next) => {
  try {
    const recipe = await RecipesModel.find();
    if (recipe) {
      res.send(recipe);
    } else {
      next(createHttpError(404, "recipe not found"));
    }
  } catch (error) {
    next(error);
  }
});

recipesRouter.post("/", async (req, res, next) => {
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

recipesRouter.get("/:recipeId", async (req, res, next) => {
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

recipesRouter.delete("/:recipeId", async (req, res, next) => {
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
});

recipesRouter.put("/:recipeId", async (req, res, next) => {
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
