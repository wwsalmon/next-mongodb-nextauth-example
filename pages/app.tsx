import {GetServerSideProps} from "next";
import getThisUser from "../utils/getThisUser";
import {ssrRedirect} from "next-response-helpers";
import cleanForJSON from "../utils/cleanForJSON";
import { getSession } from "next-auth/react";
import mongoose from "mongoose";
import { UserModel } from "../models/user";
import short from "short-uuid";

export default function App({}: {}) {
    return (
        <>
            <p>signed in</p>
        </>
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