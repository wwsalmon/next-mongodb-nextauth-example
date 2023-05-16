import mongoose, {Model} from "mongoose";

export interface PostObj {
    userId: string, // ID of user who made post
    body: string, // example field -- change to what you need
}

const PostSchema = new mongoose.Schema({
    userId: mongoose.Types.ObjectId,
    body: { required: true, type: String },
}, {
    timestamps: true,
});

export const PostModel = (!!mongoose.models && mongoose.models.post as Model<PostObj> || mongoose.model<PostObj>("post", PostSchema));