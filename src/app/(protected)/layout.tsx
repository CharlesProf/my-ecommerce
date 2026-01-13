import { Navbar } from "@/components/nav-bar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="container mx-auto py-6">{children}</main>
    </>
  );
}
