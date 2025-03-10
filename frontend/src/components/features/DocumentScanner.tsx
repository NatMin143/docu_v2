"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, Upload } from "lucide-react";
import ExportPDF from "./ExportPDF";
import { X } from "lucide-react";
import CameraFeed from "./CameraFeed";
import { LoadingModal } from "../LoadingModal";

export function DocumentScanner() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [zoom, setZoom] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const addImage = (newImage: string) => {
    setScannedImages((prevList) => [...prevList, newImage]);
  };

  const deleteImage = (indexToDelete: number) => {
    setScannedImages((prevList) => prevList.filter((_, index) => index !== indexToDelete));
  };
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.item(0);
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image file");
    }

    const formData = new FormData();
    formData.append("file", file as Blob);
    formData.append("scanOn", "image")
    // console.log(formData.get("scanOn"))

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/scanner",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "image/png" }); // Adjust MIME type
      const url = URL.createObjectURL(blob);
      addImage(url);
      setIsLoading(false)
    } catch (error) {
      console.error("Error Scanning the Image", error);
    }
  };

  

  const scannedImagesEl = scannedImages.map((image, index) => {
    return (
      <div key={index} className="mt-4 relative">
        <div className="absolute right-2 top-2 rounded-full p-1 bg-red-400 cursor-pointer"
        onClick={() => deleteImage(index)}>
          <X className="w-4 h-4" />
        </div>

        <img
          src={image}
          alt="Scanned Document"
          className={`${zoom ? "w-[400px]" : "w-30"} h-auto rounded-lg shadow`}
          onClick={() => setZoom((prev) => !prev)}
        />
      </div>
    );
  });

  return (
    <div className="container mx-auto py-6 px-10">
      <Card>
        <CardHeader>
          <CardTitle>Document Scanner</CardTitle>
          <CardDescription>
            Scan documents using your camera or upload existing files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="realtime" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="realtime" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span>Realtime</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-6 w-6" />
                <span>Upload</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="realtime" className="mt-4">
              <div className="flex items-center justify-center w-auto h-auto p-4 border-2 border-dashed rounded-lg">
                <CameraFeed playOn={"scanner"}/>
              </div>
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <div
                className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg gap-2 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleChange}
                />
                <Upload className="h-10 w-10" color="#707070" />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-gray-500">{file.name}</span>
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleUpload();
                        setIsLoading(true)
                      }}
                    >
                      Scan Image
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500">Upload Image</span>
                )}
              </div>

              {scannedImages?.length > 0 ? (
                <div className="flex flex-col justify-center items-center mt-4 gap-4">
                  <div className="flex gap-2">{scannedImagesEl}</div>

                  <ExportPDF imagePaths={scannedImages} />
                </div>
              ) : (
                <p className="mt-4">Scan images first to export PDF</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <LoadingModal isOpen={isLoading} message="Scanning document"/>
    </div>
  );
}
