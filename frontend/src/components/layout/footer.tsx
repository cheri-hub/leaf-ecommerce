import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { FooterNewsletter } from "@/components/layout/footer-newsletter";

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4">
              {SITE_NAME}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Produtos de alta qualidade com entrega para todo o Brasil.
              Sua satisfação é nossa prioridade.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">
              Links Úteis
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  Meus Pedidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">
              Atendimento
            </h4>
            <ul className="space-y-2">
              <li className="text-white/70 text-sm">
                Segunda a Sexta, 9h às 18h
              </li>
              <li className="text-white/70 text-sm">
                contato@leafecommerce.com.br
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide mb-4">
              Newsletter
            </h4>
            <p className="text-white/70 text-sm mb-3">
              Inscreva-se para receber novidades e promoções.
            </p>
            <FooterNewsletter />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-xs">
            © {new Date().getFullYear()} {SITE_NAME}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-3 text-white/60 text-xs">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Pix</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
