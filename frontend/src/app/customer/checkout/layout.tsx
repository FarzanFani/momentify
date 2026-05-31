import PublicLayout from "@/app/(public)/layout";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout children={children} />;
}
