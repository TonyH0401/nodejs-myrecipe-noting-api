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

// this one use the accountid from the headers
router.get("/all", async (req, res) => {
  try {
    // get the accountid from the headers, this will be send from the FE
    const { accountid } = req.headers;
    if (!accountid) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "There is no accountid in the headers",
      });
    }
    // convert this to string to prevent nosql injection
    const searchID = accountid.toString();
    // check valid ObjectId
    if (!searchID.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Invalid mongoose ObjectId!",
      });
    }
    let accountExist = await AccountModel.findById(searchID);
    if (!accountExist) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Account does not exist!",
      });
    }
    let recipeList = await RecipeModel.find({ recipeAuthor: accountExist._id });
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
      count: recipeList.length,
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

router.get("/recipe/:recipeid", async (req, res) => {
  try {
    const { recipeid } = req.params;
    const searchID = recipeid.toString();
    if (!searchID.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Invalid mongoose ObjectId for recipe!",
      });
    }
    let recipeExist = await RecipeModel.findById(searchID);
    if (!recipeExist) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "No recipe for this id!",
      });
    }
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Recipe found!",
      data: recipeExist,
    });
  } catch (error) {
    return res.status(500).json({
      code: 0,
      success: false,
      message: error.message,
    });
  }
});

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

router.delete("/delete/:recipeid", async (req, res) => {
  try {
    const { recipeid } = req.params;
    const searchID = recipeid.toString();
    if (!searchID.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Invalid mongoose ObjectId for recipe!",
      });
    }
    let recipeExist = await RecipeModel.findById(searchID);
    if (!recipeExist) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Recipe does not exist!",
      });
    }
    let result = await RecipeModel.findByIdAndDelete(searchID);
    return res.status(200).json({
      code: 1,
      success: true,
      message: `${result.recipeName} recipe deleted!`,
      data: recipeExist,
    });
  } catch (error) {
    return res.status(500).json({
      code: 0,
      success: false,
      message: error.message,
    });
  }
});

router.delete("/remove/:recipeid/:ingredientid", async (req, res) => {
  try {
    const { recipeid, ingredientid } = req.params;
    const recipeSearchID = recipeid.toString();
    if (!recipeSearchID.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Invalid mongoose ObjectId for recipe!",
      });
    }
    let recipeExist = await RecipeModel.findById(recipeSearchID);
    if (!recipeExist) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Recipe does not exist!",
      });
    }
    const ingredientSearchID = ingredientid.toString();
    if (!ingredientSearchID.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Invalid mongoose ObjectId for ingredient!",
      });
    }
    let foundObject = recipeExist.ingredientsList.find(
      (index) => index._id == ingredientSearchID
    );
    if (!foundObject) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Ingredient not found!",
      });
    }
    recipeExist.ingredientsList = recipeExist.ingredientsList.filter(
      (index) => index._id != foundObject._id
    );
    let result = await recipeExist.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Removed ingredient!",
      data: foundObject,
    });
  } catch (error) {
    return res.status(500).json({
      code: 0,
      success: false,
      message: error.message,
    });
  }
});

router.get("/demo", (req, res) => {
  try {
    const { accountid } = req.headers;
    if (!accountid) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "No accountid token!",
      });
    }
    const searchid = accountid.toString();
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Success get authorization!",
      id: accountid,
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
