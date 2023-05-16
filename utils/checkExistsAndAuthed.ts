import mongoose, { HydratedDocument } from "mongoose";
import { NextApiResponse } from "next";
import { res403, res404 } from "next-response-helpers";
import { UserObj } from "../models/user";

export default async function checkExistsAndAuthed(id: string, res: NextApiResponse, thisUser: HydratedDocument<UserObj>, model: mongoose.Model<any>) {
    const thisObj = await model.findById(new mongoose.Types.ObjectId(id));

    if (!thisObj) return res404(res);

    if (thisObj.userId.toString() !== thisUser._id.toString()) return res403(res);

    return false;
}