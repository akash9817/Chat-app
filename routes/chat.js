const Chat = require("../models/chat");
const Room = require("../models/room");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const chat = (io) => {
  io.on("connection", (socket) => {
    console.log("New Websocket connection");

    socket.on("sendMessage", (message, callback) => {
      console.log("message ", message);
      var messageData = {
        text: message.text,
        user: message.userId,
        createdAt: new Date(message.createdAt),
        chatId: message.chatId,
      };
      var query = Chat.findOne({ "messages.chatId": message.chatId });
      query.exec().then((data) => {
        if (data == null) {
          //console.log('oajdiajsidjaidjaisdj')
          const msg = new Chat();
          //console.log(msg)
          msg.messages.push(messageData);
          msg
            .save()
            .then((result) => {
              result
                .populate("messages.user")
                .execPopulate()
                .then((r) => {
                  //console.log('11111111111111 ',r)
                  io.to(r.messages[0].chatId).emit("message", r.messages);
                });
            })
            .catch((e) => {
              console.log(e);
            });
        } else {
          console.log("data, ", data);
          var update = Chat.findOneAndUpdate(
            { "messages.chatId": message.chatId },
            //{$set : {messages : data.messages.concat(messageData)}},
            { $push: { messages: { $each: [messageData], $position: 0 } } },
            { upsert: true, new: true }
          );
          update
            .populate("messages.user")
            .exec()
            .then((result) => {
              io.to(result.messages[0].chatId).emit(
                "message",
                result.messages[0]
              );
            });
        }
      });
      callback();
    });

    socket.on("userJoined", (roomId) => {
      socket.join(roomId);
      Chat.aggregate([
        { $match: { "messages.chatId": new mongoose.Types.ObjectId(roomId) } },
        { $unwind: "$messages" },
        {
          $lookup: {
            from: "users",
            localField: "messages.user",
            foreignField: "_id",
            as: "messages.user",
          },
        },
        { $unwind: "$messages.user" },
        { $sort: { "messages._id": -1 } },
        { $group: { _id: "$_id", updates: { $push: "$messages" } } },
        { $project: { messages: { $slice: ["$updates", 0, 8] } } },
      ]).then((r) => {
        console.log("my data ", r[0]);
        if (r[0] == undefined) {
          socket.emit("getMessage", []);
        } else {
          socket.emit("getMessage", r[0].messages.reverse());
        }
      });
    });

    socket.on("loadMessages", ({ msg, add, roomId }, cb) => {
      Chat.aggregate([
        { $match: { "messages.chatId": new mongoose.Types.ObjectId(roomId) } },
        { $unwind: "$messages" },
        {
          $lookup: {
            from: "users",
            localField: "messages.user",
            foreignField: "_id",
            as: "messages.user",
          },
        },
        { $unwind: "$messages.user" },
        { $sort: { "messages._id": -1 } },
        { $group: { _id: "$_id", updates: { $push: "$messages" } } },
        { $project: { messages: { $slice: ["$updates", 8 * msg + add, 8] } } },
      ]).then((r) => {
        //console.log(r[0].messages)
        socket.emit("getMessage", r[0].messages.reverse());
      });

      cb();
    });

    socket.on("onUserRemoved", async ({ roomId, userId }, cb) => {
      try {
        const room = await Room.findOne({ _id: roomId });
        const index = room.user_id.findIndex((item) => item._id == userId);
        room.user_id.splice(index, 1);
        //console.log("room " , room)
        await room.save();
        room
          .populate("user_id")
          .execPopulate()
          .then((data) => {
            cb(data);
          });
        io.to(roomId).emit("onUserRemoved", userId);
        //cb(room)
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("disconnect", function () {
      console.log("i ransndnajsdnjsj********8");
    });
  });

  router.get("/messages", async (req, res) => {
    try {
      res.send("cool");
    } catch (e) {
      res.status(401).send(e);
    }
  });
};

module.exports = chat;
