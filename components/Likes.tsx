import { HydratedDocument } from "mongoose";
import { useEffect, useState } from "react";
import { LikeObj } from "../models/like";
import { UserObj } from "../models/user";
import axios from "axios";
import { FiHeart } from "react-icons/fi";
import classNames from "classnames";

export default function Likes({id, thisUser, className}: {id: string, thisUser: HydratedDocument<UserObj>, className?: string}) {
    const [likes, setLikes] = useState<HydratedDocument<LikeObj & {user: HydratedDocument<UserObj>}>[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [likesIter, setLikesIter] = useState<number>(0);

    useEffect(() => {
        setIsLoading(true);

        axios.get(`/api/like?id=${id}`).then(res => {
            setLikes(res.data);
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [likesIter]);

    function onLike() {
        setIsLoading(true);

        axios.post("/api/like", {
            id: id,
        }).then(() => {
            setLikesIter(prev => prev + 1);
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            setIsLoading(false)
        });
    }
    
    return (
        <div className={classNames("flex items-center", className)}>
            <button className="hover:opacity-50 disabled:opacity-50" disabled={isLoading} onClick={onLike}>
                <span className={classNames(likes.some(d => d.user._id.toString() === thisUser._id.toString()) && "text-red-500")}>
                    <FiHeart/>
                </span>
            </button>
            {likes.map(like => (
                <img src={like.user.image} className="block mx-2 w-4 h-4 rounded-full"/>
            ))}
        </div>
    )
}