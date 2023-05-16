import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import Link from "next/link";

export default function Navbar() {
    const {data: session} = useSession();
    const router = useRouter();

    return (
        <div className="w-full sticky top-0">
            <p>YourApp</p>
            <div className="ml-auto">
                {(session && router.route !== "/") ? (
                    <img
                        src={session.user.image}
                        alt={`Profile picture of ${session.user.name}`}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <Link href="/auth/signin">Sign in</Link>
                )}
            </div>
        </div>
    );
}