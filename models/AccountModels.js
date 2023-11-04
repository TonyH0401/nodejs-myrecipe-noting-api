const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const AccountModel = new Schema(
  {
    // don't use unique
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    emailAddress: { type: String, require: true, unique: true },
    phoneNumber: { type: String, require: true, unique: true },
    accountPassword: { type: String, require: true },
    // ==================================================================
    isValidated: { type: Boolean, default: false },
    otpValidated: { type: String },
    failedLoginCounter: { type: Number, default: 0 },
    // two_authen: { type: Boolean, default: false },
    // when create an account it is a temp password, user login with that temp password
    // they are redirected to the change password immediately, if they dont change, they are
    // redirected everytime until they change
    // temp_password_changed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AccountModel", AccountModel);
