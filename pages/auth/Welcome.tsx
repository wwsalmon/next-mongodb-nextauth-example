import {GetServerSideProps} from "next";
import {getSession} from "next-auth/client";
import SEO from "../../components/SEO";
import SignInButton from "../../components/SignInButton";

export default function Welcome({}: {  }) {
    return (
        <>
            <SEO title="Sign up"/>
            <h1>Welcome to YourApp</h1>
            <hr/>
            <p>Click the button below to sign in to or sign up for Postulate with your Google account.</p>
            <SignInButton/>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (session) {
        context.res.setHeader("location", session.userId ? "/app" : "/auth/NewAccount");
        context.res.statusCode = 302;
        context.res.end();
    }

    return {props: {}};
};