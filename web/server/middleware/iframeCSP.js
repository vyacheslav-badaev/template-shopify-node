import {Shopify} from "@shopify/shopify-api";

export const iframeCSP = async (req, res, next) => {
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
}