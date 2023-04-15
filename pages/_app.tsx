import "../styles/globals.css";
import {SessionProvider} from "next-auth/react";
import ReactModal from "react-modal";
import Navbar from "../components/Navbar";
import NProgress from "nprogress";
import "../styles/nprogress.css";
import Router from "next/router";
import { useEffect } from "react";

Router.events.on("routeChangeStart", (url, {shallow}) => {
    if (!shallow) NProgress.start();
});
Router.events.on("routeChangeComplete", (url, {shallow}) => {
    if (!shallow) NProgress.done();
});
Router.events.on("routeChangeError", () => NProgress.done());

export default function App({Component, pageProps}) {
    useEffect(() => {
        ReactModal.setAppElement("#app-root");
    }, []);
    
    return (
        <SessionProvider session={pageProps.session}>
            <Navbar/>
            <div id="app-root">
                <Component {...pageProps} />
            </div>
        </SessionProvider>
    );
}