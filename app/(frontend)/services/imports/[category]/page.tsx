// app/(frontend)/services/imports/[category]/page.tsx – one imports category with its products
import { categoryRoute } from "@/components/Import/ServicePages";
import { SERVICES } from "@/lib/imports";

const route = categoryRoute(SERVICES.imports);

export const revalidate = 60;
export const generateMetadata = route.generateMetadata;
export default route.Page;
