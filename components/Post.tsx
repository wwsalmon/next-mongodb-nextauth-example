import { HydratedDocument } from "mongoose";
import { PostObj } from "../models/post";
import { UserObj } from "../models/user";
import { CommentObj } from "../models/comment";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import axios from "axios";
import Comment from "./Comment";
import Likes from "./Likes";

export default function Post({post, thisUser, setIterAbove}: {post: HydratedDocument<PostObj & {user: HydratedDocument<UserObj>}>, thisUser: HydratedDocument<UserObj>, setIterAbove: Dispatch<SetStateAction<number>>}) {
    const [comments, setComments] = useState<HydratedDocument<CommentObj & {user: HydratedDocument<UserObj>, subComments?: (HydratedDocument<CommentObj> & {user: HydratedDocument<UserObj>})[]}>[]>([]);
    const [body, setBody] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [commentsIter, setCommentsIter] = useState<number>(0);

    useEffect(() => {
        setIsLoading(true);

        axios.get(`/api/comment?postId=${post._id.toString()}`).then(res => {
            setComments(res.data);
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [commentsIter]);

    function onDelete() {
        axios.delete(`/api/post?id=${post._id}`).then(() => {
            setIterAbove(prev => prev + 1);
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            setIsLoading(false)
        });
    }

    function onComment() {
        setIsLoading(true);

        axios.post("/api/comment", {
            body: body,
            nodeId: post._id,
        }).then(() => {
            setCommentsIter(prev => prev + 1);
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            setIsLoading(false)
        });
    }

    return (
        <div className="p-4 border my-8">
            <p>{post.body}</p>
            <div className="flex items-center mt-2">
                <img src={post.user.image} className="w-6 h-6 rounded-full" />
                <p className="text-sm opacity-50 ml-2">{post.user.name}</p>
                {post.user._id.toString() == thisUser._id.toString() && (
                    <button className="ml-auto text-red-500 uppercase font-bold text-sm hover:opacity-50" onClick={onDelete}>Delete</button>
                )}
            </div>
            <hr className="my-4" />
            <Likes id={post._id.toString()} thisUser={thisUser}/>
            <hr className="my-4" />
            <p className="uppercase text-sm font-bold">Comments</p>
            <input type="text" value={body} onChange={e => setBody(e.target.value)} className="w-full border p-1 my-4" placeholder="Comment"/>
            <button disabled={isLoading} className="disabled:opacity-50 bg-black text-white p-1" onClick={onComment}>add comment</button>
            {comments.map(comment => (
                <Comment post={post} key={comment._id.toString()} comment={comment} thisUser={thisUser} setIterAbove={setCommentsIter}/>
            ))}
        </div>
    )
}