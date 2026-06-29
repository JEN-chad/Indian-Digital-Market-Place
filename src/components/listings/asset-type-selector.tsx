import React from "react";
import { motion } from "framer-motion";
import { Cloud, ShoppingCart, Smartphone, BookOpen, Globe, FileText, Briefcase, CheckCircle2 } from "lucide-react";

export type AssetType = "saas" | "ecommerce" | "app" | "blog" | "domain" | "content_site" | "service";

interface AssetOption {
  id: AssetType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const assetOptions: AssetOption[] = [
  {
    id: "saas",
    title: "SaaS",
    description: "Software-as-a-Service businesses, subscription apps, and micro-SaaS",
    icon: Cloud,
  },
  {
    id: "ecommerce",
    title: "eCommerce",
    description: "Shopify stores, Amazon FBA, WooCommerce, and direct-to-consumer brands",
    icon: ShoppingCart,
  },
  {
    id: "app",
    title: "Mobile App",
    description: "iOS and Android applications with in-app purchases or subscription revenue",
    icon: Smartphone,
  },
  {
    id: "blog",
    title: "Blog",
    description: "Content sites, online journals, and niche review blogs monetized with ads/affiliates",
    icon: BookOpen,
  },
  {
    id: "domain",
    title: "Domain",
    description: "Premium domain names, digital brands, and registered trademarks",
    icon: Globe,
  },
  {
    id: "content_site",
    title: "Content Site",
    description: "News portals, directories, resource centers, and digital magazines",
    icon: FileText,
  },
  {
    id: "service",
    title: "Service",
    description: "Productized agencies, consulting services, development shops, and design studios",
    icon: Briefcase,
  },
];

interface AssetTypeSelectorProps {
  selectedType: AssetType | "";
  onSelect: (type: AssetType) => void;
}

export default function AssetTypeSelector({ selectedType, onSelect }: AssetTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assetOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedType === option.id;

        return (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onSelect(option.id)}
            className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              isSelected
                ? "border-amber-500 bg-amber-50/20 shadow-sm ring-1 ring-amber-500"
                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
            }`}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 text-amber-600">
                <CheckCircle2 className="w-5 h-5 fill-amber-50" />
              </div>
            )}

            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-xl ${
                  isSelected
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-800 text-base">{option.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed pr-4">
                  {option.description}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
