require("dotenv").config;
const express = require("express");
const router = express.Router();

// custom functions requirements

// Models
const RecipeModel = require("../models/RecipeModels");
const AccountModel = require("../models/AccountModels");

// routes
router.get("/", (req, res) => {
  return res.status(200).json({
    code: 1,
    success: true,
    message: "Recipe default branch!",
  });
});

router.get("/all", async (req, res) => {
  try {
    let recipeList = await RecipeModel.find();
    if (recipeList.length == 0) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Recipe documents are empty!",
      });
    }
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Recipe list success!",
      data: recipeList,
    });
  } catch (error) {
    return res.status(500).json({
      code: 0,
      success: false,
      message: error.message,
    });
  }
});

router.get("/")

router.post("/create", async (req, res) => {
  const { recipeName, ingredientsList, recipeAuthor } = req.body;
  try {
    let accountExist = await AccountModel.findById(recipeAuthor);
    if (!accountExist) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Account does not exist!",
      });
    }
    let newRecipe = await RecipeModel({
      recipeName: recipeName,
      ingredientsList: ingredientsList,
      recipeAuthor: recipeAuthor,
    });
    let result = await newRecipe.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: "New Recipe added",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      code: 0,
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
