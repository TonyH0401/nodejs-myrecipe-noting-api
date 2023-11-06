const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const RecipeModel = new Schema(
  {
    recipeName: { type: String, require: true },
    ingredientsList: [
      {
        ingredientName: { type: String, required: true },
        ingredientQuantity: { type: Number, required: true, default: 1 },
        // ingredientNote: { type: String, required: true },
      },
    ],
    recipeNote: { type: String },
    recipeAuthor: {
      type: Schema.Types.ObjectId,
      ref: "AccountModel",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RecipeModel", RecipeModel);
