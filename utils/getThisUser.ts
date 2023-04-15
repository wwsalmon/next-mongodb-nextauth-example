import {getSession} from "next-auth/react";
import {UserModel} from "../models/user";
import {GetServerSidePropsContext} from "next";
import dbConnect from "./dbConnect";
import { Session } from "next-auth";

export default async function getThisUser(context: GetServerSidePropsContext, session?: Session) {
    const thisSession = session || await getSession(context);

    if (thisSession) {
        await dbConnect();

        return UserModel.findOne({email: session.user.email});
    }

    return null;
}