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

const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  variable: "--font-funnel",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://samtelavionics.com"),

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
  url: "https://samtelavionics.com/",
  logo: "https://samtelavionics.com/assets/images/main-logo.webp",
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
  image: "https://samtelavionics.com/assets/images/main-logo.webp",
  "@id": "https://samtelavionics.com/#localbusiness",
  url: "https://samtelavionics.com/",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${funnelSans.variable} h-full antialiased`}
      // data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <meta
          name="google-site-verification"
          content="5F1J4u7wctCD5Kzl3AJ0dOVJ12mfZUPxZL7EBvdfz3c"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P5DJ66QV');`,
          }}
        />

        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-RSVP17KFKM"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-RSVP17KFKM');`,
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P5DJ66QV"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Script id="reset-scroll-position" strategy="beforeInteractive">
          {`if ("scrollRestoration" in window.history) {
              window.history.scrollRestoration = "manual";
            }
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });`}
        </Script>

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
