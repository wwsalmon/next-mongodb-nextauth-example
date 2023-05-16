import {NextApiHandler} from "next";
import nextApiEndpoint from "../../utils/nextApiEndpoint";
import {NotificationModel} from "../../models/notification";
import getLookup from "../../utils/getLookup";
import {res200, res403} from "next-response-helpers";
import mongoose from "mongoose";
import {subDays} from "date-fns";

const handler: NextApiHandler = nextApiEndpoint({
    async getFunction(req, res, session, thisUser) {
        // check logged in
        if (!thisUser) return res403(res);

        // delete read notifications more than 14 days old
        await NotificationModel.deleteMany({read: true, createdAt: {$lt: subDays(new Date(), 14)}});

        // get current notifs
        const notifications = await NotificationModel.aggregate([
            {$match: {userId: new mongoose.Types.ObjectId(thisUser._id)}},
            // get node for each notif
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
            {$unwind: "$node"},
            // get subNode for each notif
            getLookup("comments", "_id", "subNodeId", "subNode"),
            {$unwind: {
                path: "$subNode",
                preserveNullAndEmptyArrays: true,
            }},
            // get author of notif
            getLookup("users", "_id", "authorId", "author"),
            {$unwind: "$author"},
            // get object of notif -- like or comment (one or the other)
            getLookup("likes", "_id", "objectId", "like"),
            {$unwind: {
                path: "$like",
                preserveNullAndEmptyArrays: true,
            }},
            getLookup("comments", "_id", "objectId", "comment"),
            {$unwind: {
                path: "$comment",
                preserveNullAndEmptyArrays: true,
            }},
            {$sort: {createdAt: -1}},
        ]);

        return res200(res, notifications);
    },
});

export default handler;