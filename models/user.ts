import mongoose, {Model} from "mongoose";

export interface UserObj {
    email: string,
    username: string,
    name: string,
    image: string,
}

const UserSchema = new mongoose.Schema({
    email: { required: true, type: String },
    name: { required: true, type: String },
    image: { required: true, type: String },
    username: { required: true, type: String },
}, {
    timestamps: true,
});

export const UserModel = (!!mongoose.models && mongoose.models.user as Model<UserObj>) || mongoose.model<UserObj>("user", UserSchema);