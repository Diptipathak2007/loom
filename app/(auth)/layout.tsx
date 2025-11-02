import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../globals.css";

export const metadata = {
  title: "Loom",
  description: "A next.js based threads application",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
            <Topbar/>
            <main>
                <LeftSidebar/>
                <section className="main-container ">
                   <div className="w-full max-w-4xl">
                        {children}
                   </div>
                </section>
                <RightSidebar/>
            </main>
            <BottomBar/>
        </ClerkProvider>
      </body>
    </html>
  );
}
