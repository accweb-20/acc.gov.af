// app/(frontend)/services/imports/[category]/[product]/page.tsx – one imports product
import { productRoute } from "@/components/Import/ServicePages";
import { SERVICES } from "@/lib/imports";

const route = productRoute(SERVICES.imports);

export const revalidate = 60;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
