// app/(frontend)/services/sales/page.tsx – Sales main page (shared layout: components/Import/ServicePages.tsx)
import { listingRoute } from "@/components/Import/ServicePages";
import { SERVICES } from "@/lib/imports";

const route = listingRoute(SERVICES.sales);

export const revalidate = 60;
export const generateMetadata = route.generateMetadata;
export default route.Page;
