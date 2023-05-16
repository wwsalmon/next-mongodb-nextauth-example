import {GetServerSideProps} from "next";
import getThisUser from "../utils/getThisUser";
import {ssrRedirect} from "next-response-helpers";
import cleanForJSON from "../utils/cleanForJSON";
import { getSession } from "next-auth/react";
import mongoose, { HydratedDocument } from "mongoose";
import { UserModel, UserObj } from "../models/user";
import short from "short-uuid";
import { PostModel, PostObj } from "../models/post";
import getLookup from "../utils/getLookup";
import { useEffect, useState } from "react";
import axios from "axios";
import Post from "../components/Post";

export default function App({thisUser}: {thisUser: HydratedDocument<UserObj>}) {
    const [feed, setFeed] = useState<HydratedDocument<PostObj & {user: HydratedDocument<UserObj>}>[]>([]);
    const [iter, setIter] = useState<number>(0);
    const [body, setBody] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        axios.get("/api/post").then(res => {
            setFeed(res.data);
        }).catch(e => {
            console.log(e);
        });
    }, [iter]);

    function onPost() {
        setIsLoading(true);
        axios.post("/api/post", {
            body: body,
        }).then(res => {
            setIter(prev => prev + 1);
        }).catch(e => {
            console.log(e);
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <p>signed in</p>
            <div className="p-4 border my-8">
                <p className="uppercase font-bold text-sm">New post</p>
                <input type="text" className="w-full p-2 border my-4" onChange={e => setBody(e.target.value)} value={body}/>
                <button disabled={isLoading} className="disabled:opacity-50 bg-black text-white p-1" onClick={onPost}>add post</button>
            </div>
            {feed && feed.map(post => (
                <Post key={post._id.toString()} post={post} thisUser={thisUser} setIterAbove={setIter}/>
            ))}
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) return { redirect: { permanent: false, destination: "/signin" } };

    try {
        await mongoose.connect(process.env.MONGODB_URL as string);

        let thisUser = await UserModel.findOne({email: session.user.email});

        if (!thisUser) thisUser = await UserModel.create({
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
            username: session.user.name.split(" ").join("-") + "-" + short.generate(),
        });

        return { props: cleanForJSON({thisUser})};
    } catch (e) {
        console.log(e);
        return { notFound: true };
    }
};