import { useState } from "react";
import AppSideBar from "@/components/AppSideBar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
// import { DocumentScanner } from "./features/DocumentScanner";

const Home = () => { 
  // const[activeMenu, setActiveMenu] = useState<string>("home")
  
  return (
    <SidebarProvider>
      <AppSideBar/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Document Processing System</h1>
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Home;
