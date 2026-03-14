import { Truck, CreditCard, Shield, RefreshCw } from "lucide-react";
import { TRUST_ITEMS } from "@/lib/constants";

const iconMap = {
  Truck,
  CreditCard,
  Shield,
  RefreshCw,
} as const;

export function TrustBar() {
  return (
    <section className="bg-white border-y border-border">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <div key={item.title} className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-text-main">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
