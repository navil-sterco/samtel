import type { Metadata } from "next";
import { Funnel_Sans } from "next/font/google";
import Header from "@/components/header/Header";
import WipeOnScroll from "@/components/common/WipeOnScroll";
import RouteBodyClass from "@/components/common/RouteBodyClass";
import PageTransitionLoader from "@/components/common/PageTransitionLoader";
import ImageAltEnhancer from "@/components/common/ImageAltEnhancer";

import "bootstrap/dist/css/bootstrap.min.css";
import "aos/dist/aos.css";
import Footer from "@/components/footer/Footer";
import Script from "next/script";
import ScrollToTop from "@/components/common/ScrollToTop";
import "@/styles/globals.css";
import Providers from "@/lib/Providers";
import AosProvider from "@/components/AosProvider";
import { environmentRobots } from "@/lib/seo";
import { headers } from "next/headers";

const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  variable: "--font-funnel",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.samtelavionics.com"),
  robots: environmentRobots,

  title: {
    default: "Samtel Avionics | Defence Electronics Company in India",
    template: "%s | Samtel Avionics",
  },

  description:
    "Samtel Avionics (SA) is a key Indian player in high-technology avionics, defence and railway electronic products and systems.",

  verification: {
    google: "5F1J4u7wctCD5Kzl3AJ0dOVJ12mfZUPxZL7EBvdfz3c",
  },

  openGraph: {
    siteName: "Samtel Avionics",
    type: "website",
    title: "Defence Electronics Company in India",
    description:
      "Samtel Avionics (SA) is a key Indian player in high-technology avionics, defence and railway electronic products and systems.",
    url: "/",
    images: [
      {
        url: "/assets/images/main-logo.webp",
        alt: "Samtel Avionics",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Defence Electronics Company in India",
    description:
      "Samtel Avionics (SA) is a key Indian player in high-technology avionics, defence and railway electronic products and systems.",
    images: ["/assets/images/main-logo.webp"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Samtel Avionics",
  url: "https://www.samtelavionics.com/",
  logo: "https://www.samtelavionics.com/assets/images/main-logo.webp",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+911244682000",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: "en",
  },
  sameAs: [
    "https://www.facebook.com/Samtel.Avionics/",
    "https://x.com/SamtelAvionics",
    "https://www.instagram.com/samtelavionics/",
    "https://www.youtube.com/channel/UCvv5NSvZf0mUKAcSVqtrtaw",
    "https://www.linkedin.com/company/samtel/home/",
  ],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Samtel Avionics",
  image: "https://www.samtelavionics.com/assets/images/main-logo.webp",
  "@id": "https://www.samtelavionics.com/#localbusiness",
  url: "https://www.samtelavionics.com/",
  telephone: "+91 124 4682000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2nd Floor, Plot No. 288-A, Udyog Vihar Phase-IV",
    addressLocality: "Gurugram",
    postalCode: "122015",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 28.4976584,
    longitude: 77.07959389999999,
  },
  sameAs: [
    "https://www.facebook.com/Samtel.Avionics/",
    "https://x.com/SamtelAvionics",
    "https://www.instagram.com/samtelavionics/",
    "https://www.youtube.com/channel/UCvv5NSvZf0mUKAcSVqtrtaw",
    "https://www.linkedin.com/company/samtel/home/",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${funnelSans.variable} h-full antialiased`}
      // data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="dns-prefetch" href="https://www.samtelavionics.com" />
        <link rel="preload" as="video" href="https://backoffice.samtelavionics.com/assets/img/home-page/homepage_1793882162_6aec78326d2ff.mp4" type="video/mp4" />
        <link
          rel="preconnect"
          href="https://backoffice.samtelavionics.com"
          crossOrigin="anonymous"
        />

        {/* DNS lookup */}
        <link
          rel="dns-prefetch"
          href="//backoffice.samtelavionics.com"
        />
        
         <link
            rel="dns-prefetch"
            href="//static.cloudflareinsights.com"
        />
        <link rel="dns-prefetch" href="//scripts.clarity.ms" />

        <meta
          name="google-site-verification"
          content="5F1J4u7wctCD5Kzl3AJ0dOVJ12mfZUPxZL7EBvdfz3c"
        />

        <Script
          src="/js/google-tags.js"
          strategy="afterInteractive"
          nonce={nonce}
        />

        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script
          src="/js/reset-scroll-position.js"
          strategy="beforeInteractive"
          nonce={nonce}
        />

        <PageTransitionLoader />
        <ScrollToTop />
        <RouteBodyClass />
        <ImageAltEnhancer />
        <WipeOnScroll />
        <Providers>
          <AosProvider />
          <Header />
          {children}
          <Footer />
          <Script src="/js/smoothscroll.min.js" strategy="lazyOnload" />
        </Providers>
      </body>
    </html>
  );
}