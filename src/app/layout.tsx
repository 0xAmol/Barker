export const metadata = {
  title: "Barker — AI Salesman",
  description: "Paste your Google Business URL. Get leads by text.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}