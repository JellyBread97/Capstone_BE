import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("Ingredient", ingredientSchema);
