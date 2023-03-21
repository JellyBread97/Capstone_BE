import mongoose from "mongoose";

const { Schema, model } = mongoose;

const recipeSchema = new Schema(
  {
    name: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    img: {
      type: String,
      default:
        "https://i.etsystatic.com/20596634/r/il/983960/3922251642/il_fullxfull.3922251642_hqgn.jpg",
    },
    desc: { type: String },
    ingredients: [
      {
        ingredient: { type: Schema.Types.ObjectId, ref: "Ingredient" },
        amount: { type: Number },
        unit: { type: String, enum: ["g", "ml", "cl", "pc", "drop", "dash"] },
      },
    ],

    method: {
      type: String,
    },
  },
  { timestamps: true }
);

recipeSchema.methods.toJSON = function () {
  const recipeDoc = this;
  const recipe = recipeDoc.toObject();
  delete recipe.createdAt;
  delete recipe.updatedAt;
  delete recipe.__v;
  return recipe;
};

export default model("Recipes", recipeSchema);
