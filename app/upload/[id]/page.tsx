"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMenubar } from "@/contexts/MenubarContext";
import { MOCK_FORMS_LIST } from "../mockData";
import type { FormData } from "../types";
import { ArrowRight, Check, Search, TriangleAlert, X } from "lucide-react";
// @ts-expect-error - jsfeat doesn't have TypeScript types
import * as jsfeat from "jsfeat";

interface UploadFormDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Custom hook for camera management
function useCamera() {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError(
        error instanceof Error
          ? error.message
          : "Failed to access camera. Please check permissions."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, []);

  return { cameraError, videoRef, startCamera, stopCamera, captureImage, setCameraError };
}

// Function to check image quality using jsfeat Sobel derivatives (alternative method)
function checkImageQuality(imageDataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(0);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Validate dimensions
      const width = canvas.width;
      const height = canvas.height;
      if (!width || !height || width <= 0 || height <= 0 || !isFinite(width) || !isFinite(height)) {
        resolve(0);
        return;
      }
      
      // Check for potential buffer overflow (max safe integer for 32-bit)
      const totalPixels = width * height;
      if (totalPixels <= 0 || !isFinite(totalPixels) || totalPixels > 268435456) { // ~16k x 16k max
        resolve(0);
        return;
      }

      try {
        // Use jsfeat for grayscale conversion
        // jsfeat uses combined constants like U8C1_t instead of combining with bitwise OR
        // Note: Constructor already allocates, so no need to call allocate() again
        const gray = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
        jsfeat.imgproc.grayscale(imageData.data, width, height, gray);

        // Use jsfeat Sobel derivatives for edge detection
        // jsfeat uses S32C1_t for signed 32-bit values (no S16 available)
        const sobelX = new jsfeat.matrix_t(width, height, jsfeat.S32C1_t);
        const sobelY = new jsfeat.matrix_t(width, height, jsfeat.S32C1_t);
        
        jsfeat.imgproc.sobel_derivatives(gray, sobelX, sobelY);

        // Calculate gradient magnitude (edge strength)
        let sumMagnitude = 0;
        let count = 0;
        const dx = sobelX.data;
        const dy = sobelY.data;

        for (let i = 0; i < width * height; i++) {
          const magnitude = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]);
          sumMagnitude += magnitude;
          count++;
        }

        const meanMagnitude = sumMagnitude / count;

        // Normalize to 0-100 quality score
        // Sharp images typically have mean magnitude > 30, blurred < 15
        // Adjust these thresholds based on your testing
        const quality = Math.min(100, Math.max(0, (meanMagnitude / 50) * 100));

        console.log("Image quality score:", quality, "| Mean magnitude:", meanMagnitude);
        resolve(quality);
      } catch (error) {
        console.error("Error processing image quality:", error);
        resolve(0);
      }
    };
    img.onerror = () => resolve(0);
    img.src = imageDataUrl;
  });
}

export default function UploadFormDetailsPage({ params }: UploadFormDetailsPageProps) {
  const router = useRouter();
  const { setTitle, hideMenubar } = useMenubar();
  const [form, setForm] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [imageQuality, setImageQuality] = useState<number | null>(null);

  const { cameraError, videoRef, startCamera, stopCamera, captureImage, setCameraError } =
    useCamera();

  // Set page title and hide menubar
  useEffect(() => {
    setTitle("Upload Form");
    hideMenubar();
  }, [setTitle, hideMenubar]);

  // Load form data
  useEffect(() => {
    params.then((resolvedParams) => {
      const id = parseInt(resolvedParams.id);
      const foundForm = MOCK_FORMS_LIST.find((f) => f.id === id);
      setForm(foundForm || null);
      setIsLoading(false);
    });
  }, [params]);

  // Initialize camera when form is loaded
  useEffect(() => {
    if (!form || capturedImage) return;

    startCamera();

    return () => {
      stopCamera();
    };
  }, [form, capturedImage, startCamera, stopCamera]);

  const handleCapture = useCallback(async () => {
    const imageDataUrl = captureImage();
    if (imageDataUrl) {
      setCapturedImage(imageDataUrl);
      stopCamera();
      setIsCheckingQuality(true);
      setImageQuality(null);

      // Check image quality
      const quality = await checkImageQuality(imageDataUrl);
      setImageQuality(quality);

      setTimeout(() => {
        setIsCheckingQuality(false);
      }, 2000);
    }
  }, [captureImage, stopCamera]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setCameraError(null);
    setIsCheckingQuality(false);
    setImageQuality(null);
  }, [setCameraError]);

  const handleSave = useCallback(() => {
    if (!capturedImage) return;

    // Convert data URL to Blob for FormData
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const formData = new FormData();
        const file = new File([blob], `form-${form?.id || "image"}-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        formData.append("image", file);

        // TODO: Implement actual upload logic
        console.log("FormData ready for upload:", formData);
      })
      .catch((error) => {
        console.error("Error preparing image for upload:", error);
      });
  }, [capturedImage, form?.id]);

  const handleRetryCamera = useCallback(() => {
    setCameraError(null);
    startCamera();
  }, [startCamera, setCameraError]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading form details...
        </p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Form not found</p>
          <button
            onClick={() => router.push("/upload")}
            className="mt-4 text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
          >
            Back to forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col gap-6 overflow-y-auto p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Go back"
          >
            <X size={24} />
          </button>
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-ellipsis overflow-hidden whitespace-nowrap">
            {form.name.length > 20 ? `${form.name.slice(0, 20)}...` : form.name}
          </h1>
        </div>
      </div>

      {/* Camera/Image Preview */}
      <div className="flex-1 relative overflow-hidden bg-gray-900 dark:bg-black">
        {cameraError ? (
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <p className="text-sm text-red-500 dark:text-red-400 mb-4">{cameraError}</p>
              <button
                onClick={handleRetryCamera}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured form"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bottom Controls */}
      <div>
        {/* Quality checking bar - show while checking */}
        {isCheckingQuality && (
          <div className="p-4 flex items-center gap-2 checking-animation">
            <div className="relative z-10 flex items-center gap-2">
              <Search size={18} strokeWidth={2.5} />
              <p className="text-white text-sm font-semibold">
                Checking image quality...
              </p>
            </div>
          </div>
        )}

        {/* Quality warning bar - show if quality < 60 */}
        {!isCheckingQuality && imageQuality !== null && imageQuality < 60 && (
          <div className="bg-yellow-500 p-4 flex items-center gap-4">
            <TriangleAlert size={36} strokeWidth={2.5} />
            <div>
              <p className="text-yellow-900 text-base font-semibold">Blurred image</p>
              <p className="text-yellow-900 text-sm">Please retake photo</p>
            </div>
          </div>
        )}

        {!capturedImage ? (
          <div className="px-4 py-6 flex items-center justify-between bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="w-12" /> {/* Spacer */}
            <button
              onClick={handleCapture}
              disabled={!!cameraError}
              className="w-16 h-16 bg-teal-600 rounded-full border-4 border-white dark:border-gray-900 shadow-lg hover:bg-teal-700 dark:hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Capture image"
            />
            <button
              disabled
              className="bg-gray-300 dark:bg-gray-700 p-2 rounded-full cursor-not-allowed opacity-50"
              aria-label="Next"
            >
              <ArrowRight
                size={24}
                strokeWidth={2.5}
                className="text-gray-500 dark:text-gray-400"
              />
            </button>
          </div>
        ) : (
          <div className="px-4 py-6 flex items-center justify-between bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 px-4 py-2 text-lg font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              aria-label="Retake photo"
            >
              <X size={20} />
              Retake
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-lg font-medium text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100 transition-colors"
              aria-label="Save image"
            >
              <Check size={20} />
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
