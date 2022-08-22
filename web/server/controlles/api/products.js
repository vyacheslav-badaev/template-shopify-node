import {Shopify} from "@shopify/shopify-api";

export const getCountProducts = async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);
    const {Product} = await import(
        `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
        );

    const countData = await Product.count({session});
    res.status(200).send(countData);
}