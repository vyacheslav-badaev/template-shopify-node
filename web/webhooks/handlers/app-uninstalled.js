import Shopify from "@shopify/shopify-api";

export const appUninstallHandler = async (topic, shop, body) => {
    console.log(`New Webhook`, topic, shop);
    console.log(`New Webhook body`, body);
    await prisma.shop.update({
        where: {
            myshopifyDomain: shop,
        },
        data: {
            active: false,
            token: ''
        },
    })
}
