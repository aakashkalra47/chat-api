const mongoose = require("mongoose");

var chatSchema = mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Chat", chatSchema);
