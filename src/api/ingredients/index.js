import express from "express";
import IngredientsModel from "./modal.js";
import createHttpError from "http-errors";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";

const ingredientsRouter = express.Router();

ingredientsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const ingredients = await IngredientsModel.find();
    if (ingredients) {
      res.send(ingredients);
    } else {
      next(createHttpError(404, "ingredients not found"));
    }
  } catch (error) {
    next(error);
  }
});

ingredientsRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const newIngredient = new IngredientsModel(req.body);
    const ing = await newIngredient.save();
    res.status(201).send(ing);
  } catch (error) {
    next(error);
  }
});

ingredientsRouter.get(
  "/:ingredientId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const ingredient = await IngredientsModel.findById(
        req.params.ingredientId
      );
      if (ingredient) {
        res.send(ingredient);
      } else {
        next(createHttpError(404, "ingredient not found"));
      }
    } catch (error) {
      next(error);
    }
  }
);

ingredientsRouter.delete(
  "/:ingredientId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const deletedingredient = await IngredientsModel.findByIdAndDelete(
        req.params.ingredientId
      );
      if (deletedingredient) {
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `ingredient with ${req.params.ingredientId} not found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

ingredientsRouter.put(
  "/:ingredientId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const updatedingredient = await IngredientsModel.findByIdAndUpdate(
        req.params.ingredientId,
        req.body,
        { new: true, runValidators: true }
      );
      if (updatedingredient) {
        res.send(updatedingredient);
      } else {
        next(
          createHttpError(
            `404, ingredient with id ${req.params.ingredientId} not found`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default ingredientsRouter;
