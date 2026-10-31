// app/(frontend)/services/imports/page.tsx – Imports main page (shared layout: components/Import/ServicePages.tsx)
import { listingRoute } from "@/components/Import/ServicePages";
import { SERVICES } from "@/lib/imports";

const route = listingRoute(SERVICES.imports);

export const revalidate = 60;
export const generateMetadata = route.generateMetadata;
export default route.Page;
