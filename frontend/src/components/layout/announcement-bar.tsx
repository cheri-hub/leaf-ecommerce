import { Truck } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-white h-10 flex items-center justify-center text-[13px] tracking-wide">
      <Truck className="w-4 h-4 mr-2" />
      <span>FRETE GRÁTIS EM COMPRAS ACIMA DE R$ 400,00</span>
    </div>
  );
}
