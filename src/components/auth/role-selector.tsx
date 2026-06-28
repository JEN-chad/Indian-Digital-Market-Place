import React from "react";
import { ShoppingBag, Store, Repeat2, Check } from "lucide-react";
import { motion } from "framer-motion";

interface RoleSelectorProps {
  value: "buyer" | "seller" | "both" | "";
  onChange: (value: "buyer" | "seller" | "both") => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const roles = [
    {
      id: "buyer" as const,
      title: "BUYER",
      subtitle: "I want to acquire digital businesses",
      description: "Search for authoritative assets, review vetted financials, sign secure NDAs, and execute acquisitions seamlessly.",
      icon: ShoppingBag,
      color: "bg-amber-50 text-amber-800 border-amber-200/50",
    },
    {
      id: "seller" as const,
      title: "SELLER",
      subtitle: "I want to sell my digital business",
      description: "List your digital business, reach premium high-intent verified Indian buyers, manage secure negotiations, and close with escrow.",
      icon: Store,
      color: "bg-blue-50 text-blue-800 border-blue-200/50",
    },
    {
      id: "both" as const,
      title: "BOTH",
      subtitle: "I want to buy and sell",
      description: "List your digital businesses for exit, and simultaneously search the marketplace for high-yield digital asset acquisitions.",
      icon: Repeat2,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200/50",
    },
  ];

  return (
    <div className="space-y-4">
      {roles.map((role) => {
        const isSelected = value === role.id;
        const IconComponent = role.icon;

        return (
          <motion.div
            key={role.id}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onChange(role.id)}
            className={`relative p-5 rounded-lg border-2 cursor-pointer transition flex gap-4 ${
              isSelected
                ? "border-[#1D4429] bg-[#1D4429]/5 shadow-sm"
                : "border-black/10 hover:border-black/20 bg-white"
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${role.color}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#1A1A1A]/40">
                  {role.title}
                </span>
                {isSelected && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#1D4429] text-white">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mt-0.5">{role.subtitle}</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{role.description}</p>
            </div>

            {isSelected && (
              <div className="absolute top-4 right-4">
                <div className="w-5 h-5 rounded-full border-2 border-[#1D4429] bg-white flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1D4429]" />
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
export default RoleSelector;
