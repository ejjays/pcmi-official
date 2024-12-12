import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import MenuBar from "./MenuBar";
import Navbar from "./Navbar";
import SessionProvider from "./SessionProvider";
import MobileMenuBar from "./MobileMenuBar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex w-full grow gap-5 md:mx-auto md:max-w-7xl">
          <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
          {children}
        </div>
        <MobileMenuBar className="sticky bottom-0 w-full border-t bg-card p-3 sm:hidden">
  <div className="flex flex-row justify-around w-full">
    <MenuBar />
  </div>
</MobileMenuBar>
      </div>
    </SessionProvider>
  );
}