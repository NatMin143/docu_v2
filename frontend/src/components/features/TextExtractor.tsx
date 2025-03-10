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
import CameraComponent from "./CameraComponent";
import { LoadingModal } from "../LoadingModal";

const TextExtractor = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [textExtracted, setTextExtracted] = useState<string>("");
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.item(0);
    if (selectedFile) {
      setFile(selectedFile);
      setTextExtracted("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a pdf or an image file");
    }

    const formData = new FormData();
    formData.append("file", file as Blob);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/extract-text",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("This is the response", response.data.text);
      setTextExtracted(response.data.text);
      setIsLoading(false)
    } catch (error) {
      console.error("Error Extracting the Text", error);
    }
  };

  return (
    <div className="container mx-auto py-6 px-10">
      <Card>
        <CardHeader>
          <CardTitle>OCR Text Extraction</CardTitle>
          <CardDescription>Extract text from images</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="camera" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="camera"
                className="flex items-center gap-2"
                onClick={() => {
                  setTextExtracted("");
                }}
              >
                <Camera className="h-4 w-4" />
                <span>Capture</span>
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="flex items-center gap-2"
                onClick={() => {
                  setTextExtracted("");
                  setFile(null);
                }}
              >
                <Upload className="h-6 w-6" />
                <span>Upload</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="mt-4">
              <div className="flex items-center justify-center border-2 border-dashed rounded-lg w-full h-full p-4">
                <CameraComponent
                  cameraOpen={cameraOpen}
                  setCameraOpen={setCameraOpen}
                  setFile={setFile}
                  setTextExtracted={setTextExtracted}
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <div
                className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg gap-2 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="application/pdf ,image/*"
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
                      Scan File
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500">Upload an image or pdf</span>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {textExtracted && (
        <Card className="flex mt-4">
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 justify-center">
            <div>
              {/* PDF Preview */}
              {file && file.type === "application/pdf" && (
                <div className="bg-white p-4 rounded shadow-lg w-full max-w-md mt-4">
                  <h2 className="font-bold text-lg mb-2">PDF Preview</h2>
                  <embed
                    src={URL.createObjectURL(file)}
                    type="application/pdf"
                    width="100%"
                    height="400px"
                    className="rounded"
                  />
                </div>
              )}

              {/* Image Preview */}
              {file && file.type.startsWith("image/") && (
                <div className="bg-white p-4 rounded shadow-lg w-full max-w-md mt-4">
                  <h2 className="font-bold text-lg mb-2">Image Preview</h2>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Uploaded"
                    className="w-full h-auto rounded"
                  />
                </div>
              )}
            </div>

            {/* Extracted Text Display */}
            <div className="flex flex-col shadow-lg p-4 gap-2">
              <h1 className="text-sm font-bold">Text Extracted</h1>
              <p className="whitespace-pre-wrap">{textExtracted}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <LoadingModal isOpen={isLoading} message="Extracting text" />
    </div>
  );
};

export default TextExtractor;
