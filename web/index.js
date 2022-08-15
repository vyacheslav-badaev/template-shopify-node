// @ts-check
import 'dotenv/config';
import {join} from "path";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import {Shopify, ApiVersion} from "@shopify/shopify-api";
import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import {setupGDPRWebHooks} from "./gdpr.js";
import {
    USE_ONLINE_TOKENS,
    TOP_LEVEL_OAUTH_COOKIE,
    PORT,
    isTest,
    DEV_INDEX_PATH,
    DB_PATH, BILLING_SETTINGS, PROD_INDEX_PATH
} from './config/constants.js'
import prisma from "./config/db-client.js";

const versionFilePath = "./version.txt";
let templateVersion = "unknown";
if (fs.existsSync(versionFilePath)) {
    templateVersion = fs.readFileSync(versionFilePath, "utf8").trim();
}


Shopify.Context.initialize({
    API_KEY: process.env.SHOPIFY_API_KEY,
    API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
    SCOPES: process.env.SCOPES.split(","),
    HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""),
    HOST_SCHEME: process.env.HOST.split("://")[0],
    API_VERSION: ApiVersion.April22,
    IS_EMBEDDED_APP: true,
    // This should be replaced with your preferred storage strategy
    SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
    USER_AGENT_PREFIX: `Node App Template/${templateVersion}`,
});


// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

// export for test use only
export async function createServer(
    root = process.cwd(),
    isProd = process.env.NODE_ENV === "production",
    billingSettings = BILLING_SETTINGS
) {
    const app = express();
    app.set("top-level-oauth-cookie", TOP_LEVEL_OAUTH_COOKIE);
    app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

    applyAuthMiddleware(app, {
        billing: billingSettings,
    });

    app.post("/api/webhooks", async (req, res) => {
        try {
            await Shopify.Webhooks.Registry.process(req, res);
            console.log(`Webhook processed, returned status code 200`);
        } catch (error) {
            console.log(`Failed to process webhook: ${error}`);
            if (!res.headersSent) {
                res.status(500).send(error.message);
            }
        }
    });

    // All endpoints after this point will require an active session
    app.use(
        "/api/*",
        verifyRequest(app, {
            billing: billingSettings,
        })
    );

    app.get("/api/products-count", async (req, res) => {
        const session = await Shopify.Utils.loadCurrentSession(req, res, true);
        const {Product} = await import(
            `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
            );

        const countData = await Product.count({session});
        res.status(200).send(countData);
    });

    app.post("/api/graphql", async (req, res) => {
        try {
            const response = await Shopify.Utils.graphqlProxy(req, res);
            res.status(200).send(response.body);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

    app.use(express.json());

    app.use((req, res, next) => {
        const shop = req.query.shop;
        if (Shopify.Context.IS_EMBEDDED_APP && shop) {
            res.setHeader(
                "Content-Security-Policy",
                `frame-ancestors https://${shop} https://admin.shopify.com;`
            );
        } else {
            res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
        }
        next();
    });

    if (isProd) {
        const compression = await import("compression").then(
            ({default: fn}) => fn
        );
        const serveStatic = await import("serve-static").then(
            ({default: fn}) => fn
        );
        app.use(compression());
        app.use(serveStatic(PROD_INDEX_PATH, {index: false}));
    }

    app.use("/*", async (req, res, next) => {
        const shop = req.query.shop;
        // Detect whether we need to reinstall the app, any request from Shopify will
        // include a shop in the query parameters.
        const activeShop =
            await prisma.shop.findFirst({
                where: {
                    myshopifyDomain: shop,
                    active: true
                }
            })
        if (!activeShop) {
            res.redirect(`/api/install?shop=${shop}`);
        } else {
            // res.set('X-Shopify-App-Nothing-To-See-Here', '1');
            const fs = await import("fs");
            const fallbackFile = join(
                isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
                "index.html"
            );
            res
                .status(200)
                .set("Content-Type", "text/html")
                .send(fs.readFileSync(fallbackFile));
        }
    });

    return {app};
}

if (!isTest) {
    createServer().then(({app}) => app.listen(PORT, () => console.log(`Server API running on http://localhost:${PORT}`)));
}
