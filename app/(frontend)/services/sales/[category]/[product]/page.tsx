// app/(frontend)/services/sales/[category]/[product]/page.tsx – one sales product
import { productRoute } from "@/components/Import/ServicePages";
import { SERVICES } from "@/lib/imports";

const route = productRoute(SERVICES.sales);

export const revalidate = 60;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
