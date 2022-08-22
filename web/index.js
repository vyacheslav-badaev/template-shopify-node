// @ts-check
import 'dotenv/config';
import express from "express";
import cookieParser from "cookie-parser";
import {Shopify, ApiVersion} from "@shopify/shopify-api";
import verifyRequest from "./server/middleware/verify-request.js";
import {
    TOP_LEVEL_OAUTH_COOKIE,
    PORT,
    isTest,
    DB_PATH, BILLING_SETTINGS, PROD_INDEX_PATH
} from './server/config/constants.js'
import {setupAppWebHooks} from "./server/webhooks/init.js";
import {handleFrontend} from "./server/controlles/frontend.js";
import {getCurrentVersionApp} from "./server/helpers/utils.js";
import {iframeCSP} from "./server/middleware/iframeCSP.js";
import {applyServeStaticFiles} from "./server/middleware/serveStaticFiles.js";
import {handleProcessWebhooks} from "./server/controlles/webhooks.js";
import routerApi from "./server/controlles/api/router.js";
import applyAuthRoutes from "./server/controlles/auth/routes.js";

const versionFilePath = "./version.txt";

Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
    SCOPES: process.env.SCOPES.split(","),
    HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""),
    HOST_SCHEME: process.env.HOST.split("://")[0],
    API_VERSION: ApiVersion.April22,
    IS_EMBEDDED_APP: true,
    SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
    USER_AGENT_PREFIX: `App Version/${getCurrentVersionApp(versionFilePath)}`,
});

setupAppWebHooks("/api/webhooks");

export async function createServer(
    root = process.cwd(),
    isProd = process.env.NODE_ENV === "production",
    billingSettings = BILLING_SETTINGS
) {
    const app = express();
    app.set("top-level-oauth-cookie", TOP_LEVEL_OAUTH_COOKIE);
    app.use(cookieParser(Shopify.Context.API_SECRET_KEY));
    applyAuthRoutes(app);

    app.post("/api/webhooks", handleProcessWebhooks);

    // All endpoints after this point will require an active session
    app.use(
        "/api",
        verifyRequest(app, {
            billing: billingSettings,
        }),
        routerApi
    );

    app.use(express.json());
    app.use(iframeCSP);
    if (isProd) {
        await applyServeStaticFiles(app);
    }
    app.use("/*", handleFrontend);

    return {app};
}

if (!isTest) {
    createServer().then(({app}) => {
        app.listen(PORT, () => console.log(`Server API running on http://localhost:${PORT}`))
    });
}
