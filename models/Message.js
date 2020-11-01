const mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
  content: String,
  date: Date,
  sender:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
});
module.exports=mongoose.model("Message", messageSchema);