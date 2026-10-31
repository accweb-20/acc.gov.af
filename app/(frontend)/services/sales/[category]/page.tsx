// app/(frontend)/services/sales/[category]/page.tsx – one sales category with its products
import { categoryRoute } from "@/components/Import/ServicePages";
import { SERVICES } from "@/lib/imports";

const route = categoryRoute(SERVICES.sales);

export const revalidate = 60;
export const generateMetadata = route.generateMetadata;
export default route.Page;
