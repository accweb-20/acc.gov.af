// app/(frontend)/services/exports/page.tsx – Exports main page (shared layout: components/Import/ServicePages.tsx)
import { listingRoute } from "@/components/Import/ServicePages";
import { SERVICES } from "@/lib/imports";

const route = listingRoute(SERVICES.exports);

export const revalidate = 60;
export const generateMetadata = route.generateMetadata;
export default route.Page;
