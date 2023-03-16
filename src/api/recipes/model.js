import mongoose from "mongoose";

const { Schema, model } = mongoose;

const recipeSchema = new Schema(
  {
    name: { type: String, required: true },
    img: {
      type: String,
      required: false,
      default:
        "https://i.etsystatic.com/20596634/r/il/983960/3922251642/il_fullxfull.3922251642_hqgn.jpg",
    },
    desc: { type: String, required: false },
    ingredients: [
      {
        list: { type: String, required: true },
      },
    ],
    method: {
      type: String,
      required: false,
      default: "Shaken, not stirred, add ice, serve with lemon",
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
