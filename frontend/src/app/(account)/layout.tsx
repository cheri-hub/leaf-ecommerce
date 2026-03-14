import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const dynamic = "force-dynamic";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
