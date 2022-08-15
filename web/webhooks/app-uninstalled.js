export const appUninstallHandler = async (topic, shop, body) => {
    //TODO switch active flag to false and remove access token
    console.log('appUninstallHandler', appUninstallHandler);
    console.log('topic', topic)
    console.log('shop', shop)
    console.log('body', body)
    await prisma.user.update({
        where: {
            myshopifyDomain: shop,
        },
        data: {
            active: false,
        },
    })
}
