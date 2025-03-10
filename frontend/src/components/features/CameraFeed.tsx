import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  playOn: string;
}

const CameraFeed: React.FC<Props> = ({ playOn }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [feedOn, setFeedOn] = useState<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length === 0) {
        console.error("No video devices found.");
        return;
      }

      console.log(videoDevices)
      // Select the external webcam (e.g., second camera if available)
      const selectedDeviceId =
        videoDevices.length > 2
          ? videoDevices[2].deviceId
          : videoDevices[0].deviceId;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start sending frames at intervals
      intervalRef.current = setInterval(sendFrame, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProcessedImage(null);
  };

  const sendFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append("file", blob);
            formData.append("scanOn", "video");
            
            fetch(
              `http://localhost:5000/${
                playOn === "bgRemover" ? "process-video-bgRemover" : "scanner"
              }`,
              {
                method: "POST",
                body: formData,
              }
            )
              .then((res) => res.blob())
              .then((blob) => {
                setProcessedImage(URL.createObjectURL(blob));
              })
              .catch((err) => console.error("Error processing image:", err));
          }
        }, "image/jpeg");
      }
    }
  };

  useEffect(() => {
    if (feedOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera(); // Cleanup when unmounting
  }, [feedOn]);

  return (
    <div className="flex flex-col gap-4">
      {feedOn && (
        <div>
          <video
            ref={videoRef}
            autoPlay
            width="640"
            height="480"
            className="hidden"
          />
          <canvas ref={canvasRef} width="640" height="480" hidden />
          {processedImage && <img src={processedImage} alt="Processed Frame" />}
        </div>
      )}

      <Button onClick={() => setFeedOn((prev) => !prev)}>
        {feedOn ? "Stop Feed" : "Start Feed"}
      </Button>
    </div>
  );
};

export default CameraFeed;
