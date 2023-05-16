import {GetServerSideProps} from "next";
import {ssrRedirect} from "next-response-helpers";
import {getSession, signIn} from "next-auth/react";
import {FaGoogle} from "react-icons/fa";

export default function SignIn({}: {}) {
    return (
        <>
            <button onClick={() => signIn("google")}>
                <div className="flex items-center">
                    <FaGoogle/><span className="ml-2">Sign in</span>
                </div>
            </button>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const session = await getSession(context);

        if (!session) return {props: {}};

        return ssrRedirect("/app");
    }
    catch (e) {
        console.log(e);
        return ssrRedirect("/");
    }
};