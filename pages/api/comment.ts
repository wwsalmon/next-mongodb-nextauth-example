import { NextApiHandler } from "next";
import nextApiEndpoint from "../../utils/nextApiEndpoint";
import getLookup from "../../utils/getLookup";
import { res200, res400, res403, res404 } from "next-response-helpers";
import { CommentModel } from "../../models/comment";
import mongoose from "mongoose";
import { PostModel } from "../../models/post";
import { NotificationModel } from "../../models/notification";
import checkExistsAndAuthed from "../../utils/checkExistsAndAuthed";
import { LikeModel } from "../../models/like";

const handler: NextApiHandler = nextApiEndpoint({
    async getFunction(req, res) {
        if (!req.query.postId) return res400(res);

        const comments = await CommentModel.aggregate([
            {$match: {nodeId: new mongoose.Types.ObjectId(req.query.postId.toString()), parentId: null}},
            {
                $lookup: {
                    from: "comments",
                    as: "subComments",
                    let: {parentId: "$_id"},
                    pipeline: [
                        {$match: {$expr: {$eq: ["$parentId", "$$parentId"]}}},
                        getLookup("users", "_id", "userId", "user"),
                        {$unwind: "$user"},
                    ]
                }
            },
            getLookup("users", "_id", "userId", "user"),
            {$unwind: "$user"},
            {$sort: {createdAt: -1}},
        ]);

        return res200(res, comments);
    },
    async postFunction(req, res, session, thisUser) {
        if (!thisUser) return res403(res);
        if (!req.body.body || !req.body.nodeId) return res400(res);

        // check that post exists for postId
        const thisPost = await PostModel.findById(req.body.nodeId);
        if (!thisPost) return res404(res);

        // make comment object to eventually create
        let commentObj = {
            body: req.body.body,
            nodeId: req.body.nodeId,
            userId: thisUser._id,
        };

        // if parentId, get thisParentComment with subcomments for 404 and notif purposes
        let thisParentComment = null;

        if (req.body.parentId) {
            const parentCommentPipeline = await CommentModel.aggregate([
                {$match: {_id: new mongoose.Types.ObjectId(req.body.parentId)}},
                getLookup("comments", "parentId", "_id", "subComments"),
            ]);
            thisParentComment = parentCommentPipeline[0];
            if (!thisParentComment) return res404(res);
            commentObj["parentId"] = req.body.parentId;
        }

        // craete comment if everything checks out
        const thisComment = await CommentModel.create(commentObj);

        let uniqueUserIds = [];

        // get all userIds to create notifs for
        if (thisParentComment) {
            const subCommentUserIds = thisParentComment.subComments.map(d => d.userId);
            const allCommentUserIds = [thisParentComment.userId, ...subCommentUserIds];
            const filteredUserIds = allCommentUserIds.filter(d => d.toString() !== thisUser._id.toString());
            uniqueUserIds = Array.from(new Set(filteredUserIds));

            const notifications = uniqueUserIds.map(d => ({
                userId: d,
                authorId: thisUser._id,
                nodeId: req.body.nodeId,
                objectId: thisComment._id,
                fromType: "comment",
                toType: "comment",
                read: false,
            }));

            await NotificationModel.insertMany(notifications);
        }

        // notif for post author if post is not current user or made comment
        if (thisPost.userId.toString() !== thisUser._id.toString() && !uniqueUserIds.some(d => d.toString() === thisPost.userId.toString())) {
            await NotificationModel.create({
                userId: thisPost.userId,
                authorId: thisUser._id,
                nodeId: thisPost._id,
                objectId: thisComment._id,
                fromType: "comment",
                toType: "post",
                read: false,
            });
        }

        return res200(res);
    },
    async deleteFunction(req, res, session, thisUser) {
        if (!thisUser) return res403(res);
        if (!req.query.id) return res400(res);

        const checkResponse = await checkExistsAndAuthed(req.query.id.toString(), res, thisUser, CommentModel);
        if (checkResponse) return checkResponse;

        // delete comment
        await CommentModel.deleteOne({_id: req.query.id});

        // await CommentModel.deleteMany({parentId: req.body.id}); would be cool to show subcomments under "deleted" eventually
        // todo: delete notifications for subcomments
        // todo: delete likes on subcomments
        // todo: delete notifications for likes on subcomments
        // todo: delete notifications for likes

        // delete notifs with comment as main item
        await NotificationModel.deleteMany({objectId: req.query.id});

        // delete likes on comment
        await LikeModel.deleteMany({nodeId: req.query.id});

        return res200(res);
    },
    allowUnAuthed: true,
});

export default handler;