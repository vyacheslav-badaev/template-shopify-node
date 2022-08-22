import {Shopify} from "@shopify/shopify-api";
import topLevelAuthRedirect from "../../helpers/top-level-auth-redirect.js";
import {installAppCallbackHandle, installAppHandle} from "./install.js";
import {authCallbackHandle, authHandle, topLevelPageHandle} from "./auth.js";

export default function applyAuthRoutes(
    app
) {

    app.get("/api/install", installAppHandle);

    app.get("/api/install/callback", installAppCallbackHandle);

    app.get("/api/auth", authHandle(app));

    app.get("/api/auth/toplevel", topLevelPageHandle(app));

    app.get("/api/auth/callback", authCallbackHandle);
}
