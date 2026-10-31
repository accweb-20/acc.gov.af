// app/(frontend)/layout.tsx
// Server layout: header and footer content is loaded here, on the server, so the
// menu and footer appear immediately instead of loading in the browser afterwards.

import Footer, { type FooterDocument } from "@/components/Footer";
import Header, { type HeaderDoc } from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Rubik } from "next/font/google";
import { sanityClient } from "@/sanity/lib/client";
import { Providers } from "./providers";
import "../../styles/index.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Queries live here (server file): values exported from "use client" files can't be used on the server.
const HEADER_QUERY = `*[_type == "header"][0]{
  title,
  logo{asset->{_id, url}},
  logoAlt,
  logoLink,
  navItems[]{
    order,
    title,
    showSubmenu,
    link{ linkType, internalRef-> { _id, _type, title, "slug": select(_type == "aboutPage" => "about-us/" + slug.current, slug.current) }, externalUrl, openInNewTab },
    submenu{ introText, items[]{ label, link{ linkType, internalRef->{ _id, _type, title, "slug": select(_type == "aboutPage" => "about-us/" + slug.current, slug.current) }, externalUrl, openInNewTab } } }
  }
}`;

const FOOTER_QUERY = `*[_type == "footer"][0]{
  "columns": columns[] {
    order,
    title,
    "titleLink": titleLink->{_id, _type, "slug": select(_type == "aboutPage" => "about-us/" + slug.current, slug.current), title},
    "items": items[] {
      order,
      label,
      "link": link { linkType, externalUrl, openInNewTab, "internalRef": internalRef->{_id,_type,"slug": select(_type == "aboutPage" => "about-us/" + slug.current, slug.current),title} }
    }
  },
  copyrightText,
  aboutText,
  address,
  email,
  phones,
  showProducts,
  // categories that have live products (Imports, Exports, Sales); same title shown once
  "productCategories": *[_type in ["importCategory", "exportCategory", "salesCategory"] && count(*[references(^._id) && !(status in ["draft", "archived"])]) > 0]
    | order(coalesce(order, 9999) asc, title asc){
      title,
      "href": select(_type == "importCategory" => "/services/imports/", _type == "exportCategory" => "/services/exports/", "/services/sales/") + slug.current
    },
  "socialLinks": socialLinks[] { order, label, url, "iconUrl": icon.asset->url, external }
}`;

async function getSiteChrome() {
  try {
    const [header, footer] = await Promise.all([
      sanityClient.fetch(HEADER_QUERY) as Promise<HeaderDoc | null>,
      sanityClient.fetch(FOOTER_QUERY) as Promise<FooterDocument | null>,
    ]);
    return { header, footer };
  } catch (err) {
    console.error("Failed to load header/footer:", err);
    return { header: null, footer: null };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { header, footer } = await getSiteChrome();

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {/* Dark mode only when the visitor chose it with the header button; light is the default */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
        {/* Images come from the Sanity CDN: open the connection early */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        {/* Decorative GETRONDE font (big background words); text stays visible while it loads */}
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/getronde" />
      </head>
      {/* rubik.className makes the whole site use Rubik (self-hosted by Next.js, no extra request) */}
      <body className={`bg-paper text-ink text-[18px] ${rubik.className}`}>
        <style>{`
          /* Rubik Dirt via jsDelivr (fontsource) – downloaded only where it is used */
          @font-face {
            font-family: "RubikDirt";
            src: url("https://cdn.jsdelivr.net/npm/@fontsource/rubik-dirt@5.2.7/files/rubik-dirt-latin-400-normal.woff2") format("woff2");
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
          .font-getronde {
            font-family: "GETRONDE", "RubikDirt", "Rubik", system-ui, -apple-system, "Segoe UI", Roboto, Arial !important;
          }
          .font-rubik-dirt {
            font-family: "RubikDirt", "Rubik", system-ui, -apple-system, "Segoe UI", Roboto, Arial !important;
          }
          .font-rubik {
            font-family: ${rubik.style.fontFamily}, system-ui, -apple-system, "Segoe UI", Roboto, Arial !important;
          }
          /* ensure no radius inside our page card area */
          .no-radius * {
            border-radius: 0 !important;
          }
        `}</style>
        <Providers>
          <div className="isolate">
            <Header data={header} contact={footer} />
            {children}
            <Footer doc={footer} logo={header?.logo?.asset?.url} name={header?.logoAlt} />
          </div>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
