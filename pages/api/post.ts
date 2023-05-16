import { NextApiHandler } from "next";
import { res200, res400, res403, res404 } from "next-response-helpers";
import { NotificationModel } from "../../models/notification";
import { PostModel } from "../../models/post";
import checkExistsAndAuthed from "../../utils/checkExistsAndAuthed";
import nextApiEndpoint from "../../utils/nextApiEndpoint";
import getLookup from "../../utils/getLookup";

const handler: NextApiHandler = nextApiEndpoint({
    async getFunction(req, res) {
        const feed = await PostModel.aggregate([
            getLookup("users", "_id", "userId", "user"),
            {$unwind: "$user"},
        ]);

        return res200(res, feed);
    },
    async postFunction(req, res, session, thisUser) {
        if (!thisUser) return res403(res);
        if (!req.body.body) return res400(res);

        const thisPost = await PostModel.create({
            body: req.body.body,
            userId: thisUser._id,
        });

        return res200(res, thisPost);
    },
    async deleteFunction(req, res, session, thisUser) {
        if (!thisUser) return res403(res);
        if (!req.query.id) return res400(res);

        const checkResponse = await checkExistsAndAuthed(req.query.id.toString(), res, thisUser, PostModel);
        if (checkResponse) return checkResponse;

        // delete post
        await PostModel.deleteOne({_id: req.query.id});

        // delete notifs with post as node
        await NotificationModel.deleteMany({nodeId: req.query.id});

        // todo: delete notifs for comments, subcomments, likes...

        return res200(res);
    },
    allowUnAuthed: true,
});

export default handler;