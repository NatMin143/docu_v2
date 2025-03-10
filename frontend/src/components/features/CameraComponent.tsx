import React, { useState, useRef, FC } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import axios from "axios";
import { LoadingModal } from "../LoadingModal";

interface CameraProps {
  cameraOpen: boolean;
  setCameraOpen: (open: boolean) => void;
  setFile: (file: File) => void;
  setTextExtracted: (text: string) => void;
}

const CameraComponent: FC<CameraProps> = ({
  cameraOpen,
  setCameraOpen,
  setFile,
  setTextExtracted,
}) => {
  const webcamRef = useRef<Webcam | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const base64ToBlob = (base64: string): Blob => {
    const [metadata, data] = base64.split(",");
    if (!data) throw new Error("Invalid Base64 string");

    const byteCharacters = atob(data); // Decode Base64
    const byteNumbers = new Uint8Array(
      Array.from(byteCharacters, (char) => char.charCodeAt(0))
    );

    return new Blob([byteNumbers], {
      type: metadata.split(":")[1]?.split(";")[0] || "application/octet-stream",
    });
  };

  const capture = async () => {
    console.log("Capture function is Running");
    setCameraOpen(false)
    if (webcamRef.current) {
      const screenshot: string | null = webcamRef.current?.getScreenshot();

      const blob: Blob = base64ToBlob(screenshot!);
      const imgFile: File = new File([blob], "image.png", {
        type: "image/png",
      });

    //   setImage(imgFile);
      setFile(imgFile);

      if (!imgFile) {
        alert("Please select a pdf or an image file");
      }

      const formData = new FormData();
      formData.append("file", imgFile as Blob);
      console.log(formData.entries())

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
        if (response.data.text === ""){
            alert("No text found in the image / Please use upload for more accurate detection")
        }
      } catch (error) {
        console.error("Error Extracting the Text", error);
      }
    }
  };

  return (
    <div>
      {!cameraOpen && (
        <Button onClick={() => setCameraOpen(!cameraOpen)}>
          <Camera />
          Open Camera
        </Button>
      )}
      {cameraOpen && (
        <div className="flex flex-col items-center">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/png"
            className="rounded-lg shadow-md w-full h-full"
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={capture}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Capture
            </button>
            <button
              onClick={() => setCameraOpen(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Close Camera
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CameraComponent;
