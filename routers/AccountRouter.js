require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const { sendMail } = require("sud-libs");
const randomstring = require("randomstring");

// custom functions
const {
  validateNames,
  validateEmail,
  validatePhone,
  validatePassword,
} = require("../middlewares/validators");
const {
  accountExistEmail,
  comparePassword,
  mailForm,
} = require("../middlewares/utils");
const jwtSecretKey = process.env.JWT_SECRET_KEY || "family";
const emailHostServer = {
  user: process.env.HOST_EMAIL,
  pass: process.env.HOST_PASSWORD,
};

// Models
const AccountModel = require("../models/AccountModels");

// routes
router.get("/", (req, res) => {
  return res.status(200).json({
    code: 1,
    success: true,
    message: "Default accounts branch",
  });
});
// create -> jwt verify -> login -> otp

router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      password1,
      password2,
    } = req.body;
    let emailValidation = await validateEmail(emailAddress);
    if (emailValidation.success == false) {
      return res.status(300).json({
        code: 0,
        success: false,
        message: emailValidation.message,
      });
    }
    let phoneValidation = await validatePhone(phoneNumber);
    if (phoneValidation.success == false) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: phoneValidation.message,
      });
    }
    let nameValidations = validateNames(firstName, lastName);
    if (nameValidations.success == false) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: nameValidations.message,
      });
    }
    let passwordValidation = validatePassword(password1, password2);
    if (passwordValidation.success == false) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: passwordValidation.message,
      });
    }
    // using bycrypt to hash password when saving to database
    let hashedPassword = "";
    await bcrypt.hash(password1, saltRounds).then((hash) => {
      hashedPassword = hash;
    });
    let newAccount = new AccountModel({
      firstName: firstName,
      lastName: lastName,
      emailAddress: emailAddress,
      phoneNumber: phoneNumber,
      accountPassword: hashedPassword,
    });
    let result = await newAccount.save();
    // create jwt token for the _id or id
    const jwtToken = jwt.sign({ id: newAccount._id }, jwtSecretKey);
    // console.log(`> http://localhost:8080/accounts/verify?token=${jwtToken}`);
    // send email
    const options = {
      from: emailHostServer.user,
      to: emailAddress,
      subject: "Account Validation!",
      text: `Hello ${firstName} ${lastName}`,
      attachDataUrls: true,
      html: mailForm({
        caption: `Validate your Account!`,
        content: `
              <a href="http://localhost:8080/accounts/verify?token=${jwtToken}" target="_blank">Click here to verify!</a>
          `,
      }),
    };
    sendMail(emailHostServer, options, (err) => {
      if (err) {
        console.log(err);
      }
    });
    return res.status(200).json({
      code: 1,
      success: true,
      message: "New Account added",
    });
  } catch (error) {
    return res.status(500).json({
      code: 0,
      success: false,
      message: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  // let {id, accountEmail, accountPassword}
  try {
    const { emailAddress, accountPassword } = req.body;
    let emailFound = await accountExistEmail(emailAddress);
    if (!emailFound.success) {
      return res.status(300).json({
        code: emailFound.code,
        success: false,
        message: emailFound.message,
      });
    }
    // check validation true or not
    let accountObject = emailFound.emailObject;
    if (!accountObject.isValidated) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Account has not been validated!",
      });
    }
    // reset the failed login timer and value of failed login counter
    let timeDifferenceInMinutes = "";
    if (accountObject.failedLoginTimer != "") {
      let failedTime = new Date(accountObject.failedLoginTimer);
      let currentTime = new Date();
      let timeDifferenceInMilliseconds = currentTime - failedTime;
      timeDifferenceInMinutes = timeDifferenceInMilliseconds / 60000;
      // console.log(timeDifferenceInMinutes);
      if (timeDifferenceInMinutes >= 5) {
        accountObject.failedLoginCounter = 0;
        accountObject.failedLoginTimer = "";
        let result = await accountObject.save();
      }
    }
    // check if account reached limit of failed login, its 5
    if (accountObject.failedLoginCounter == 3) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: `You are now on hold from login! Please wait ${(
          5 - timeDifferenceInMinutes
        ).toFixed(2)} minutes!`,
      });
    }
    // check password
    let accountPasswordMatch = await comparePassword(
      accountPassword,
      emailFound.emailObject.accountPassword
    );
    if (!accountPasswordMatch.success) {
      // increase the login failed counter
      accountObject.failedLoginCounter = accountObject.failedLoginCounter + 1;
      let result = await accountObject.save();
      // assign time to when user login failed the 3rd time
      if (accountObject.failedLoginCounter == 3) {
        accountObject.failedLoginTimer = new Date();
        let result = await accountObject.save();
      }
      return res.status(300).json({
        code: 1,
        success: false,
        message: accountPasswordMatch.message,
      });
    }
    accountObject.failedLoginCounter = 0;
    await accountObject.save();
    // create otp for 2-oauth which will be checked later down
    let otp = randomstring.generate(12);
    let hashedOtp = "";
    await bcrypt.hash(otp, saltRounds).then((hash) => {
      hashedOtp = hash;
    });
    accountObject.otpValidated = hashedOtp;
    let result = await accountObject.save();
    // send otp through email
    const options = {
      from: emailHostServer.user,
      to: emailAddress,
      subject: "OTP CODE!",
      text: `Hello user!`,
      attachDataUrls: true,
      html: mailForm({
        caption: `Here is your OTP CODE!`,
        content: `
              <p>${otp}</p>
          `,
      }),
    };
    sendMail(emailHostServer, options, (err) => {
      if (err) {
        console.log(err);
      }
    });
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Login layer 1 correct!",
    });
  } catch (error) {
    return res.status(500).json({
      code: 0,
      success: false,
      message: error.message,
    });
  }
});

router.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    // verify jwt
    let decodedResult = "";
    jwt.verify(token, jwtSecretKey, function (err, decoded) {
      if (err) {
        return res.status(500).json({
          code: 0,
          success: false,
          message: err,
          message_2: "JWT error!",
        });
      }
      decodedResult = decoded;
    });
    // check if account existed
    let accountFound = await AccountModel.findById(decodedResult.id);
    if (!accountFound) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Account does not exist!",
      });
    }
    // update account validation
    accountFound.isValidated = true;
    let result = await accountFound.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: "JWT for Account is validated!",
    });
  } catch (error) {
    return res.status(500).json({
      code: 0,
      success: false,
      message: error.message,
    });
  }
});

router.post("/otp", async (req, res) => {
  // const { accountID, accountEmail, otpCode } = req.body;
  const { accountEmail, otpCode } = req.body;
  try {
    let emailFound = await accountExistEmail(accountEmail);
    if (!emailFound.success) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Account does not exist!",
      });
    }
    let accountObject = emailFound.emailObject;
    let otpMatch = await comparePassword(otpCode, accountObject.otpValidated);
    if (!otpMatch.success) {
      return res.status(300).json({
        code: 1,
        success: false,
        message: "Incorrect OTP value!",
      });
    }
    accountObject.otpValidated = "";
    let result = await accountObject.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Login layer 2 correct! Welcome!",
    });
  } catch (error) {
    return res.status(500).json({
      code: 0,
      success: false,
      message: error.message,
    });
  }
});

router.get("/demo", async (req, res) => {
  // const email = "phugiale2912@gmail.com";
  // let accountObject = await AccountModel.findOne({ emailAddress: email });
  // let start = accountObject.updatedAt.getTime();
  // let currentDate = new Date();
  // let end = currentDate.getTime();

  // let between = (end - start) / 1000;
  // console.log("seconds: " + between);

  const date1 = new Date("2023-11-04T17:05:42.978+00:00");
  const date2 = new Date("2023-11-04T18:30:15.123+00:00");

  // Calculate the time difference in minutes
  const timeDifferenceInMilliseconds = date2 - date1;
  const timeDifferenceInMinutes = timeDifferenceInMilliseconds / 60000;

  console.log(`Time difference in minutes: ${timeDifferenceInMinutes}`);
  console.log(new Date());
  console.log(date1);

  let otp = randomstring.generate(12);
  return res.status(200).json({
    otp: otp,
  });
});

module.exports = router;
