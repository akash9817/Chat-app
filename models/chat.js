const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  messages: [
    {
      text: String,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      createdAt: Date,
      chatId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
