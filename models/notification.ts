import mongoose, {Model} from "mongoose";

export interface NotificationObj {
    userId: string, // ID of user receiving notification
    authorId: string, // ID of user whose action caused notification
    nodeId: string, // ID of update, comment, etc.
    objectId: string, // ID of object that created notification (like, comment)
    fromType: string, // type of object that created notif, i.e. like on comment => like
    toType: string, // type of subNode that object is on, i.e. like on comment => comment
    read: boolean,
}

const NotificationSchema = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    authorId: mongoose.Types.ObjectId,
    nodeId: mongoose.Types.ObjectId,
    subNodeId: mongoose.Types.ObjectId,
    objectId: mongoose.Types.ObjectId,
    read: { required: true, type: Boolean },
}, {
    timestamps: true,
});

export const NotificationModel = (!!mongoose.models && mongoose.models.notification as Model<NotificationObj>) || mongoose.model<NotificationObj>("notification", NotificationSchema);