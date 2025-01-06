const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    profileImage: { type: String, default: "" },
    eventsAttended: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] },
    ],
    eventsCreated: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] },
    ],
    eventsAttending: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: [] },
    ],
});

module.exports = mongoose.model("User", UserSchema);
