import {Shopify} from "@shopify/shopify-api";

export const handleProxyShopifyGraphql = async (req, res) => {
    try {
        const response = await Shopify.Utils.graphqlProxy(req, res);
        res.status(200).send(response.body);
    } catch (error) {
        res.status(500).send(error.message);
    }
}