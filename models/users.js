const mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
  //username: String,
  password: { type: String, required: true },
  email: { type: String, required: true },
  token:{type:String,required:true}
});
module.exports = mongoose.model("User", userSchema);
