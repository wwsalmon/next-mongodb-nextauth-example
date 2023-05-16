import { HydratedDocument } from "mongoose";
import { CommentObj } from "../models/comment";
import { UserObj } from "../models/user";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import Likes from "./Likes";
import { PostObj } from "../models/post";
import { format } from "date-fns";

export default function Comment({comment, post, thisUser, setIterAbove, parentId}: {
    comment: HydratedDocument<CommentObj & {user: HydratedDocument<UserObj>, subComments?: (HydratedDocument<CommentObj> & {user: HydratedDocument<UserObj>})[]}>,
    post: HydratedDocument<PostObj>,
    thisUser: HydratedDocument<UserObj>,
    setIterAbove: Dispatch<SetStateAction<number>>,
    parentId?: string,
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [replyOpen, setReplyOpen] = useState<boolean>(false);
    const [body, setBody] = useState<string>("");
    
    function onDelete() {
        axios.delete(`/api/comment?id=${comment._id}`).then(() => {
            setIterAbove(prev => prev + 1);
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            setIsLoading(false)
        });
    }

    function onPost() {
        axios.post("/api/comment", {
            body: body,
            nodeId: post._id,
            parentId: parentId || comment._id,
        }).then(() => {
            setIterAbove(prev => prev + 1);
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            setIsLoading(false)
        });
    }

    console.log(comment.subComments);

    return (
        <div className="flex my-4">
            <img src={comment.user.image} className="w-8 h-8 rounded-full" />
            <div className="w-full ml-4 -mt-1">
                <p>
                    <span className="font-bold">{comment.user.name}</span>
                    <span className="opacity-25"> {format(new Date(comment.createdAt), "M/d/yyyy 'at' h:mm a")}</span>
                </p>
                <p>{comment.body}</p>
                <div className="flex items-center mt-4 mb-4">
                    <button className="mr-4 uppercase font-bold text-sm hover:opacity-50 disabled:opacity-50" disabled={replyOpen} onClick={() => setReplyOpen(prev => !prev)}>
                        {replyOpen ? "Replying" : "Reply"}
                    </button>
                    {comment.user._id.toString() == thisUser._id.toString() && (
                        <button className="mr-4 text-red-500 uppercase font-bold text-sm hover:opacity-50" onClick={onDelete}>Delete</button>
                    )}
                    <Likes id={comment._id.toString()} thisUser={thisUser}/>
                </div>
                {replyOpen && (
                    <>
                        <input type="text" className="p-1 border block w-full mt-4" placeholder="Reply to this comment" value={body} onChange={e => setBody(e.target.value)}/>  
                        <div className="flex items-center mt-4 mb-6">
                            <button className="uppercase font-bold text-sm hover:opacity-50 p-2 bg-black text-white mr-2" onClick={onPost}>Post</button>
                            <button className="uppercase font-bold text-sm hover:opacity-50 p-2" onClick={() => setReplyOpen(prev => !prev)}>Cancel</button>
                        </div>
                    </>
                )}
                {comment.subComments && (
                    <div className="mt-8">
                        {comment.subComments.map(d => (
                            <Comment post={post} comment={d} parentId={comment._id.toString()} thisUser={thisUser} setIterAbove={setIterAbove}/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}