import mongoose, {Model} from "mongoose";

export interface LikeObj {
    userId: string, // ID of user making like
    nodeId: string, // ID of update, comment, etc.
}

const LikeSchema = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    nodeId: mongoose.Types.ObjectId,
}, {
    timestamps: true,
});

export const LikeModel = (!!mongoose.models && mongoose.models.like as Model<LikeObj>) || mongoose.model<LikeObj>("like", LikeSchema);