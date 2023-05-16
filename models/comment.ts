import mongoose, {Model} from "mongoose";

export interface CommentObj {
    userId: string, // ID of making comment
    nodeId: string, // ID of update, comment, etc.
    body: string,
    createdAt: string,
    updatedAt: string,
}

const CommentSchema = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    nodeId: mongoose.Types.ObjectId,
    parentId: { required: false, type: mongoose.Types.ObjectId },
    body: { required: true, type: String },
}, {
    timestamps: true,
});

export const CommentModel = (!!mongoose.models && mongoose.models.comment as Model<CommentObj>) || mongoose.model<CommentObj>("comment", CommentSchema);