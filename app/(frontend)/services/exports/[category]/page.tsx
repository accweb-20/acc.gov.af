// app/(frontend)/services/exports/[category]/page.tsx – one exports category with its products
import { categoryRoute } from "@/components/Import/ServicePages";
import { SERVICES } from "@/lib/imports";

const route = categoryRoute(SERVICES.exports);

export const revalidate = 60;
export const generateMetadata = route.generateMetadata;
export default route.Page;
