const mongoose = require('mongoose');

const notificaitonSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            required: true
        },
        title: String,
        message: String,
        entityType: String,
        entityId: mongoose.Schema.Types.ObjectId,
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model("Notification", notificaitonSchema);
