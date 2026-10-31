// app/(frontend)/services/exports/[category]/[product]/page.tsx – one exports product
import { productRoute } from "@/components/Import/ServicePages";
import { SERVICES } from "@/lib/imports";

const route = productRoute(SERVICES.exports);

export const revalidate = 60;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
