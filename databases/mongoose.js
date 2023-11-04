const mongoDb = process.env.MONGO_DB;
const mongoose = require("mongoose");

async function connect() {
  let result = {};
  await mongoose
    .connect(mongoDb, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // keepAlive: true,
    })
    .then(() => {
      result = {
        code: 1,
        success: true,
        mongoose_connection_code: mongoose.connection.readyState,
        message: "MongoDB server SUCCESS",
      };
    })
    .catch((err) => {
      console.log(err);
      result = {
        code: 0,
        success: false,
        mongoose_connection_code: mongoose.connection.readyState,
        message: "MongoDB server FAILED",
      };
    });
  return result;
}

module.exports = { connect };
