import {Shopify} from "@shopify/shopify-api";

export const handleProcessWebhooks = async (req, res) => {
    try {
        await Shopify.Webhooks.Registry.process(req, res);
        console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
        console.log(`Failed to process webhook: ${error}`);
        if (!res.headersSent) {
            res.status(500).send(error.message);
        }
    }
}