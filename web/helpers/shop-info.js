import {Shopify} from "@shopify/shopify-api";

const FETCH_SHOP_INFO = `
  query fetchShopInfo {
  shop {
    name
    myshopifyDomain
    email
    plan{
      displayName
    }
    primaryDomain {
      host
    }
  }
}
`;

export const fetchShopInfo = async ({shop, accessToken}) => {
    const client = new Shopify.Clients.Graphql(shop, accessToken);
    return await client.query({
        data: {
            query: FETCH_SHOP_INFO,
            variables: {},
        },
    });
}