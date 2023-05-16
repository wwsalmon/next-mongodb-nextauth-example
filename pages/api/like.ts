import mongoose from "mongoose";
import { NextApiHandler } from "next";
import { res200, res400, res403, res404, res405 } from "next-response-helpers";
import { CommentModel } from "../../models/comment";
import { LikeModel } from "../../models/like";
import { NotificationModel } from "../../models/notification";
import { PostModel } from "../../models/post";
import getLookup from "../../utils/getLookup";
import nextApiEndpoint from "../../utils/nextApiEndpoint";

const handler: NextApiHandler = nextApiEndpoint({
    // get all likes on a given post or comment
    async getFunction(req, res) {
        if (!req.query.id) return res400(res);

        const likes = await LikeModel.aggregate([
            {$match: {nodeId: new mongoose.Types.ObjectId(req.query.id.toString())}},
            getLookup("users", "_id", "userId", "user"),
            {$unwind: "$user"},
            {$sort: {createdAt: -1}},
        ]);

        return res200(res, likes);
    },
    async postFunction(req, res, session, thisUser) {
        if (!thisUser) return res403(res);
        if (!req.body.id) return res400(res);

        // check that post exists for postId
        const thisPostArr = await PostModel.aggregate([
            {$match: {_id: new mongoose.Types.ObjectId(req.body.id)}},
            getLookup("users", "_id", "userId", "user"),
            {$unwind: "$user"},
        ]);

        const thisPost = thisPostArr[0];

        const thisCommentArr = await CommentModel.aggregate([
            {$match: {_id: new mongoose.Types.ObjectId(req.body.id)}},
            {
                $lookup: {
                    let: {nodeId: "$nodeId"},
                    from: "posts",
                    pipeline: [
                        // get user of each node
                        {$match: {$expr: {$eq: ["$_id", "$$nodeId"]}}},
                        getLookup("users", "_id", "userId", "user"),
                        {$unwind: "$user"},
                    ],
                    as: "post"
                }
            },
            {$unwind: "$post"},
        ]);

        const thisComment = thisCommentArr[0];

        const thisObject = thisPost || thisComment;
        if (!thisObject) return res404(res);

        let thisLike = await LikeModel.findOne({
            userId: thisUser._id,
            nodeId: thisObject._id,
        });

        if (thisLike) {
            await LikeModel.deleteOne({_id: thisLike._id});
            await NotificationModel.deleteMany({objectId: thisLike._id});
        } else {
            thisLike = await LikeModel.create({
                userId: thisUser._id,
                nodeId: thisObject._id,
            });

            await NotificationModel.create({
                nodeId: thisObject.post ? thisObject.post._id : thisObject._id,
                objectId: thisLike._id,
                userId: thisObject.userId,
                authorId: thisUser._id,
                fromType: "like",
                toType: thisPost ? "post" : "comment",
                read: false,
            });
        }

        return res200(res);
    },
    async deleteFunction(req, res, session, thisUser) {
        return res405(res);
    },
    allowUnAuthed: true,
});

export default handler;