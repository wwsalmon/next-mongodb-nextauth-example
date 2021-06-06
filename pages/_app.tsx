import "../styles/globals.css";
import {Provider} from "next-auth/client";
import ReactModal from "react-modal";

export default function App({Component, pageProps}) {
    return (
        <Provider session={pageProps.session}>
            <div id="app-root">
                <Component {...pageProps} />
            </div>
        </Provider>
    )
}

ReactModal.setAppElement("#app-root");