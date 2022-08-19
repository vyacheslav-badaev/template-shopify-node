import {
    Page,
    Layout
} from "@shopify/polaris";
import {TitleBar} from "@shopify/app-bridge-react";

import {ProductsCard} from "../components";

export default function HomePage() {
    return (
        <Page narrowWidth>
            <TitleBar title="Dashboard" primaryAction={null}/>
            <Layout>
                <Layout.Section>
                    <ProductsCard/>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
