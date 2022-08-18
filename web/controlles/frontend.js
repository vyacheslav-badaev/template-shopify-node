import prisma from "../config/db-client.js";
import {join} from "path";
import {DEV_INDEX_PATH, PROD_INDEX_PATH} from "../config/constants.js";

export const handleFrontend = async (req, res, next) => {
    const shop = req?.query?.shop || null;

    if (!shop) {
        return res
            .status(400)
            .send('Shop is required params')
    }

    if (!shop.trim().endsWith('.myshopify.com')) {
        return res
            .status(400)
            .send('Shop domain is not valid')
    }

    const activeShop =
        await prisma.shop.findFirst({
            where: {
                myshopifyDomain: shop,
                active: true
            }
        });

    if (!activeShop) {
        return res.redirect(`/api/install?shop=${shop}`);
    }

    const fs = await import("fs");
    const fallbackFile = join(
        process.env.NODE_ENV === "production" ? PROD_INDEX_PATH : DEV_INDEX_PATH,
        "index.html"
    );

    return res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(fallbackFile));
}