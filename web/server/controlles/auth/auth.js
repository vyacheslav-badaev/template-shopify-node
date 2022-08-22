import {Shopify} from "@shopify/shopify-api";
import topLevelAuthRedirect from "../../helpers/top-level-auth-redirect.js";

export const authHandle = (app) => async (req, res) => {
    if (!req.query.shop) {
        res.status(500);
        return res.send("No shop provided");
    }

    if (!req.signedCookies[app.get("top-level-oauth-cookie")]) {
        return res.redirect(`/api/auth/toplevel?shop=${req.query.shop}`);
    }

    const redirectUrl = await Shopify.Auth.beginAuth(
        req,
        res,
        req.query.shop,
        "/api/auth/callback",
        true
    );

    res.redirect(redirectUrl);
}

export const topLevelPageHandle = (app) => async (req, res) => {
    res.cookie(app.get("top-level-oauth-cookie"), "1", {
        signed: true,
        httpOnly: true,
        sameSite: "strict",
    });

    res.set("Content-Type", "text/html");

    res.send(
        topLevelAuthRedirect({
            apiKey: Shopify.Context.API_KEY,
            hostName: Shopify.Context.HOST_NAME,
            shop: req.query.shop
        })
    );
}

export const authCallbackHandle = async (req, res) => {
    try {
        const session = await Shopify.Auth.validateAuthCallback(
            req,
            res,
            req.query
        );

        const host = req.query.host;
        res.redirect(`/?shop=${session.shop}&host=${host}`);
    } catch (e) {
        switch (true) {
            case e instanceof Shopify.Errors.InvalidOAuthError:
                res.status(400);
                res.send(e.message);
                break;
            case e instanceof Shopify.Errors.CookieNotFound:
            case e instanceof Shopify.Errors.SessionNotFound:
                // This is likely because the OAuth session cookie expired before the merchant approved the request
                res.redirect(`/api/auth?shop=${req.query.shop}`);
                break;
            default:
                res.status(500);
                res.send(e.message);
                break;
        }
    }
}