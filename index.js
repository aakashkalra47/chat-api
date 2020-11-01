const express = require("express");
const mongoose = require("mongoose");
const messages = require("./models/Message");
const chats = require("./models/chats");
const users = require("./models/users");
const { create } = require("./models/Message");
const sendNotification=require('./services/notifications');
mongoose.connect("mongodb://localhost/chat", { useNewUrlParser: true });

app = express();
app.use(express.json());

let socket = null;

const io = require("socket.io")(3000);

// io.on("connect", (s) => {
//   // console.log("connect",s);
//   socket = s;
// });
const activeUsers = {};
io.on("connection", (s) => {
  console.log("query", s.handshake.query);
  activeUsers[s.handshake.query.UserID] = s.id;
  
});

// Base
app.get("/", async (req, res) => {
  // console.log("Request");
  res.status(200).json([{ message: "Hello world" }]);
});

app.post("/login", async (req, res) => {
  console.log("login request");
  var user = await users.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (user) res.status(200).send(user._id);
  else res.status(404).json();
});
app.post("/signIn", async (req, res) => {
  console.log("sign in request");
  var user = await users.create(req.body);
  if (user) res.status(200).send(user._id);
  else res.status(404).json();
});
app.post("/createUser", async (req, res) => {
  const user = await users.create(req.body);
  res.status(200).json(user);
});

app.post("/createChat", async (req, res) => {
  const chat = await chats.create(req.body);
  res.status(200).json(chat);
});

app.get("/deleteMessage/:messageId", async (req, res) => {
  const message = await messages.deleteOne({ _id: req.params.messageId });
  res.status(200).json(message);
});

app.get("/chats/:userId", async (req, res) => {
  console.log("user", req.params.userId);
  try {
    var chat = await chats.find({ participants: req.params.userId });
    chat = await Promise.all(
      chat.map(async (c) => {
        const other = c.participants.filter((p) => {
          return p != req.params.userId;
        });
        console.log("3. other = ", other);
        const user = await users.findOne({ _id: other[0] });
        console.log("2. user = ", user);
        return { _id: c._id, friend: user.email };
      })
    );
    return res.status(200).json(chat);
  } catch (error) {
    console.log("3. ", error);
    return res.status(500).json(error.message);
  }
});

app.get("/getMessages/:chatId", async (req, res) => {
  console.log("1. req.params.chatId = ", req.params.chatId);
  var msgs = await messages.find({ chatId: req.params.chatId }, { chatId: 0 });
  return res.status(200).json(msgs);
});

app.get("/deleteChat/:chatId/:userId", async (req, res) => {
  console.log(req.params.chatId);
  var chat = await chats.findOneAndUpdate(
    { _id: req.params.chatId },
    { $pull: { participants: req.params.userId } },
    { new: true }
  );
  console.log("1. chat = ", chat);
  if (!chat.participants.length)
    await chats.deleteOne({ _id: req.params.chatId });
  res.status(200).json(chat);
});

app.post("/sendMessage", async (req, res) => {
  console.log("1. req.body.chatId = ", req.body.chatId);
  var chat;
  if (!req.body.chatId) {
    chat = await chats.create({
      participants: [req.body.receiverId, req.body.sender],
    });
    console.log("2. chat = ", chat);
    req.body.chatId = chat._id;
    delete req.body.receiverId;
  }
  const result = await messages.create(req.body);
  if (!chat) {
    chat = await chats.findOne({ _id: req.body.chatId });
  }
  console.log("1.2 result=", result);
  res.status(200).json(result);
  chat.participants.forEach((element) => {
    if (element != req.body.sender) {
      const paricipantId = String(element);
      console.log("activeUsers = ", activeUsers);
      console.log("participant id = ", typeof element, paricipantId);
      const socketId = activeUsers[paricipantId];
      console.log("socket it  = ", socketId);
      if(socketId)
        io.to(socketId).emit("message", result);
      else{
        sendNotification(users.findOne({_id:element}).token);
      }
    }
  });
});

const server = app.listen(5000, () => {
  console.log("server started at ", server.address().port);
});
