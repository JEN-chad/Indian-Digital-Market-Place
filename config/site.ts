export const siteConfig = {
  name: "FMI",
  logoText: "FMI",
  tagline: "Indian Digital Business Marketplace",
  description: "The trusted marketplace to buy and sell digital businesses, SaaS products, eCommerce stores, and websites in India.",
  url: process.env.VITE_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/fmi_india",
    github: "https://github.com/fmi-india",
  },
  contact: {
    email: "support@fmi.in",
    phone: "+91 80 1234 5678",
  },
};

export type SiteConfig = typeof siteConfig;
