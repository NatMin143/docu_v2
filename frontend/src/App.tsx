import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom";
import AppSideBar from "@/components/AppSideBar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import HomePage from "@/components/features/Homepage";
import { DocumentScanner } from "@/components/features/DocumentScanner";
import TextExtractor from "@/components/features/TextExtractor";
import BGRemover from "@/components/features/BGRemover";
import { LoadingModal } from "./components/LoadingModal";
import { useEffect, useState } from "react";
import axios from "axios";


const Layout = () => {
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/');
      } catch (error) {
        console.error("Error starting the backend", error)
      } finally {
        setLoading(false)
      }
    }

    fetch();
  }, [])

  if (loading) return <LoadingModal isOpen message="Starting the backend..." />;

  

  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1"/>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Document Processing System</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* This will change based on the route */}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

const App = () => {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="scanner" element={<DocumentScanner />} />
          <Route path="text-extractor" element={<TextExtractor />} />
          <Route path="bg-remover" element={<BGRemover />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
