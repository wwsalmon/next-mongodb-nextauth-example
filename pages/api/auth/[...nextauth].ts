import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import {UserModel} from "../../../models/User";
import dbConnect from "../../../utils/dbConnect";

export default NextAuth({
    providers: [
        Providers.Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
    ],
    callbacks: {
        async session(session, user) {
            await dbConnect();

            const foundUser: any = await UserModel.findOne({ email: user.email }).exec();

            let newSession = {
                ...session,
                userId: "",
                username: "",
            }

            if (foundUser) {
                newSession.userId = foundUser._id.toString();
                newSession.username = foundUser.username;
            }

            return newSession;
        },
    }
});