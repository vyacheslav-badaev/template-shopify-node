import {Shopify} from "@shopify/shopify-api";
import {fetchShopInfo} from "../../helpers/shop-info.js";
import prisma from "../../config/db-client.js";
import {gdprTopics} from "@shopify/shopify-api/dist/webhooks/registry.js";
import ensureBilling from "../../helpers/ensure-billing.js";
import {BILLING_SETTINGS} from "../../config/constants.js";

const billing = BILLING_SETTINGS;

export const installAppHandle = async (req, res) => {
    if (!req.query.shop) {
        res.status(500);
        return res.send("No shop provided");
    }

    const redirectUrl = await Shopify.Auth.beginAuth(
        req,
        res,
        req.query.shop,
        "/api/install/callback",
        false
    );

    res.redirect(redirectUrl);
}

export const installAppCallbackHandle = async (req, res) => {
    try {
        const session = await Shopify.Auth.validateAuthCallback(
            req,
            res,
            req.query
        );

        const host = req.query.host;
        const {body: {data: {shop}}} = await fetchShopInfo(session);

        const existedShop = await prisma.shop.findFirst({
            where: {
                myshopifyDomain: shop.myshopifyDomain,
            }
        });

        const shopData = {
            name: shop.name,
            myshopifyDomain: shop.myshopifyDomain,
            email: shop.email,
            primaryDomain: shop?.primaryDomain?.host || null,
            plan: shop.plan.displayName,
            token: session.accessToken,
            active: true
        }
        if (!existedShop) {
            await prisma.shop.create({
                data: shopData
            })
        }

        if (existedShop) {
            await prisma.shop.update({
                where: {myshopifyDomain: shop.myshopifyDomain,},
                data: shopData,
            })
        }


        const responses = await Shopify.Webhooks.Registry.registerAll({
            shop: session.shop,
            accessToken: session.accessToken,
        });

        Object.entries(responses).map(([topic, response]) => {
            // The response from registerAll will include errors for the GDPR topics.  These can be safely ignored.
            // To register the GDPR topics, please set the appropriate webhook endpoint in the
            // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.
            if (!response.success && !gdprTopics.includes(topic)) {
                console.log(
                    `Failed to register ${topic} webhook: ${response.result.errors[0].message}`
                );
            }
        });

        // If billing is required, check if the store needs to be charged right away to minimize the number of redirects.
        let redirectUrl = `/api/auth?shop=${session.shop}&host=${host}`;
        if (billing.required) {
            const [hasPayment, confirmationUrl] = await ensureBilling(
                session,
                billing
            );

            if (!hasPayment) {
                redirectUrl = confirmationUrl;
            }
        }

        // Redirect to handlers with shop parameter upon auth
        res.redirect(redirectUrl);
    } catch (e) {
        console.warn(e);
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