const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String},
  coverPhoto: { type: String},
  type: { type: String, enum: ["public", "private", "secret"], default: "private" },
  allowMembersToPost: { type: Boolean, default: true },
  allowMembersToCreateEvents: { type: Boolean, default: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Group", groupSchema);
