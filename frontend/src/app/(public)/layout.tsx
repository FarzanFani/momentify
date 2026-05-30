import Footer from "@/components/public/layout/footer";
import NavBar from "@/components/public/layout/navBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
