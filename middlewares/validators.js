const AccountModel = require("../models/AccountModels");

module.exports.validateNames = (firstName, lastName) => {
  if (firstName.length == 0) {
    return {
      code: 1,
      success: false,
      message: "First name is empty!",
    };
  }
  if (lastName.length == 0) {
    return {
      code: 1,
      success: false,
      message: "Last name is empty!",
    };
  }
  return {
    code: 1,
    success: true,
    message: "First name and Last name are valid!",
  };
};

module.exports.validateEmail = async (emailAddress) => {
  // empty email address
  if (emailAddress.length == 0) {
    return {
      code: 1,
      success: false,
      message: "Email address is empty!",
    };
  }
  // check email suffix
  let emailSuffix = emailAddress.substring(
    emailAddress.indexOf("@"),
    emailAddress.length
  );
  if (emailSuffix != "@gmail.com") {
    return {
      code: 1,
      success: false,
      message: "Email is not supported!",
    };
  }
  // email existed
  let emailFound = await AccountModel.findOne({
    emailAddress: emailAddress,
  });
  if (emailFound) {
    return {
      code: 1,
      success: false,
      message: "Email existed!",
    };
  }
  return {
    code: 1,
    success: true,
    message: "Email is valid!",
  };
};

module.exports.validatePhone = async (phoneNumber) => {
  if (phoneNumber.length != 10) {
    return {
      code: 1,
      success: true,
      message: "Phone number must be 10 digits long!",
    };
  }
  let phoneFound = await AccountModel.findOne({ phoneNumber: phoneNumber });
  if (phoneFound) {
    return {
      code: 1,
      success: false,
      message: "Phone number existed!",
    };
  }
  return {
    code: 1,
    success: true,
    message: "Phone number is valid!",
  };
};

module.exports.validatePassword = (password1, password2) => {
  if (password1.length < 8) {
    return {
      code: 1,
      success: false,
      message: "Password is less than 8 characters long!",
    };
  }
  let isnum = /^\d+$/.test(password1);
  if (isnum) {
    return {
      code: 1,
      success: false,
      message: "Password must content letters!",
    };
  }
  if (password1 != password2) {
    return {
      code: 1,
      success: false,
      message: "Passwords do not match!",
    };
  }
  return {
    code: 1,
    success: true,
    message: "Password is valid!",
  };
};
