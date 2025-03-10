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
import CameraFeed from "./CameraFeed"

import { LoadingModal } from "../LoadingModal";

const BGRemover = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string>("");
  const [remImg, setRemImg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.item(0);
    if (selectedFile) {
      setRemImg("");
      setFile(selectedFile);
      console.log(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image file");
    }

    const formData = new FormData();
    formData.append("file", file as Blob);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/bg-remover",
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
      setRemImg(url);
      
      setIsLoading(false)
      console.log("Generated URL:", url);
      console.log("State after update:", remImg);
    } catch (error) {
      console.error("Error Scanning the Image", error);
    }
  };
  return (
    <div className="container mx-auto py-6 px-10">
      <Card>
        <CardHeader>
          <CardTitle>Background Remover</CardTitle>
          <CardDescription>
            Remove Backgrounds from Realtime or Images
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
                <CameraFeed playOn="bgRemover"/>
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
                <Upload className="h-10 w-10" color="#707070"/>
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-gray-500">{file.name}</span>
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleUpload();
                        setIsLoading(true);
                      }}
                    >
                      Remove Background
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500">Upload Image</span>
                )}
              </div>

              {remImg && (
                <Card className="flex mt-4">
                  <CardHeader>
                    <CardTitle>Result</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-4">
                    <div className="w-full">
                      <span>Original Image</span>
                      <img
                        src={image}
                        alt="Original Image"
                        className="max-w-full h-auto rounded-lg shadow"
                      />
                    </div>
                    <div className="w-full">
                      <span>Removed Background Image</span>
                      <img
                        src={remImg}
                        alt="Removed BG Image"
                        className="max-w-full h-auto rounded-lg shadow"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <LoadingModal isOpen={isLoading} message="Removing background"/>
    </div>
  );
};

export default BGRemover;
