import React from "react";
import { 
  Cpu, 
  ShoppingCart, 
  Smartphone, 
  BookOpen, 
  Globe, 
  FileCode, 
  Briefcase 
} from "lucide-react";

export type AssetType = "saas" | "ecommerce" | "app" | "blog" | "domain" | "content_site" | "service";

interface AssetTypeBadgeProps {
  type: AssetType;
  size?: "sm" | "md";
}

export function AssetTypeBadge({ type, size = "md" }: AssetTypeBadgeProps) {
  const getBadgeConfig = (assetType: AssetType) => {
    switch (assetType) {
      case "saas":
        return {
          icon: Cpu,
          label: "SaaS",
          bg: "bg-purple-50 text-purple-700 border-purple-200/60",
        };
      case "ecommerce":
        return {
          icon: ShoppingCart,
          label: "eCommerce",
          bg: "bg-blue-50 text-blue-700 border-blue-200/60",
        };
      case "app":
        return {
          icon: Smartphone,
          label: "Mobile App",
          bg: "bg-green-50 text-green-700 border-green-200/60",
        };
      case "blog":
        return {
          icon: BookOpen,
          label: "Blog",
          bg: "bg-orange-50 text-orange-700 border-orange-200/60",
        };
      case "domain":
        return {
          icon: Globe,
          label: "Domain",
          bg: "bg-yellow-50 text-yellow-800 border-yellow-200/60",
        };
      case "content_site":
        return {
          icon: FileCode,
          label: "Content Site",
          bg: "bg-teal-50 text-teal-700 border-teal-200/60",
        };
      case "service":
      default:
        return {
          icon: Briefcase,
          label: "Agency / Service",
          bg: "bg-gray-50 text-gray-700 border-gray-200/60",
        };
    }
  };

  const config = getBadgeConfig(type);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-mono font-bold uppercase rounded-none tracking-wider ${config.bg} ${
        size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]"
      }`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{config.label}</span>
    </span>
  );
}
