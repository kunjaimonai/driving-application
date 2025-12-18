"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Camera, X, Check, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
   CLOUDINARY TRANSFORMATION HELPER
============================================================ */

const getCloudinaryTransformation = (type: string, side?: "front" | "back") => {
  switch (type) {
    case "signature":
      return "c_fill,w_300,h_100,q_auto,f_auto";
    case "photo":
      return "c_fill,w_400,h_500,q_auto,f_auto,g_face";
    case "sslc":
      return "c_limit,w_1200,h_1600,q_auto:good,f_auto";
    case "license":
      return side ? `c_limit,w_1000,h_700,q_auto:good,f_auto` : "c_limit,w_1000,h_700,q_auto:good,f_auto";
    case "aadhar":
      return side ? `c_limit,w_1000,h_700,q_auto:good,f_auto` : "c_limit,w_1000,h_700,q_auto:good,f_auto";
    default:
      return "q_auto,f_auto";
  }
};

const applyCloudinaryTransformation = (url: string, type: string, side?: "front" | "back") => {
  if (!url || !url.includes("cloudinary.com")) return url;

  const transformation = getCloudinaryTransformation(type, side);
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  return `${parts[0]}/upload/${transformation}/${parts[1]}`;
};

/* ============================================================
   FILE UPLOAD
============================================================ */

interface FileUploadProps {
  type: "signature" | "photo" | "sslc" | "license" | "aadhar";
  institutionCode: string;
  onUploadComplete: (url: string, mimeType?: string) => void;
  currentFile?: string;
  className?: string;
  side?: "front" | "back";
  allowMultiple?: boolean;
}

export function FileUpload({
  type,
  institutionCode,
  onUploadComplete,
  currentFile,
  className,
  side,
  allowMultiple = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(
    currentFile || null
  );
  const [error, setError] = useState<string | null>(null);

  /* ---------------- CONFIG ---------------- */

  const getFileConfig = (fileType: string) => {
    const sideLabel = side ? ` (${side.charAt(0).toUpperCase() + side.slice(1)})` : "";

    switch (fileType) {
      case "signature":
        return {
          icon: Upload,
          label: "Signature",
          accept: "image/*",
          maxSize: 20 * 1024,
          sizeLabel: "Max 20KB • JPG, PNG",
          dimensions: "h-32",
        };
      case "photo":
        return {
          icon: Camera,
          label: "Photo",
          accept: "image/*",
          maxSize: 20 * 1024,
          sizeLabel: "Max 20KB • JPG, PNG",
          dimensions: "h-40",
        };
      case "sslc":
        return {
          icon: FileText,
          label: "SSLC / Birth Certificate",
          accept: ".pdf,image/*",
          maxSize: 500 * 1024,
          sizeLabel: "Max 500KB • PDF, JPG, PNG",
          dimensions: "h-40",
        };
        return {
          icon: FileText,
          label: `Driving License${sideLabel}`,
          accept: ".pdf,image/*",
          maxSize: 500 * 1024,
          sizeLabel: "Max 500KB (PDF) • 5MB (Image)",
          dimensions: "h-40",
        };
      case "aadhar":
        return {
          icon: FileText,
          label: `Aadhar Card${sideLabel}`,
          accept: ".pdf,image/*",
          maxSize: 500 * 1024,
          sizeLabel: "Max 500KB (PDF) • 5MB (Image)",
          dimensions: "h-40",
        };
      default:
        return {
          icon: Upload,
          label: "File",
          accept: "*/*",
          maxSize: 500 * 1024,
          sizeLabel: "Max 500KB",
          dimensions: "h-40",
        };
    }
  };

  /* ---------------- UPLOAD ---------------- */

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      console.log("=== UPLOAD START ===");
      console.log("Institution Code:", institutionCode);
      console.log("Type:", type);
      console.log("Side:", side);
      console.log("File:", file.name, file.type, file.size);

      if (!institutionCode) {
        throw new Error("Please select driving school first");
      }

      const config = getFileConfig(type);

      // Size validation
      // Relax limit for images to 5MB (let Cloudinary resize)
      // For other files (PDF), keep strict limit
      const isImage = file.type.startsWith("image/");
      const maxSize = isImage ? 5 * 1024 * 1024 : config.maxSize;

      if (file.size > maxSize) {
        throw new Error(
          `File size must be less than ${Math.round(maxSize / 1024)}KB`
        );
      }

      // Type validation
      const isValid =
        file.type.startsWith("image/") || file.type === "application/pdf";

      if (!isValid) {
        throw new Error("Invalid file type");
      }

      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log("Base64 length:", base64.length);

      const payload = {
        file: base64,
        fileName: file.name,
        mimeType: file.type,
        type: type,
        side: side || null,
        institutionCode: institutionCode,
      };

      console.log("Payload keys:", Object.keys(payload));

      const res = await fetch("/api?action=uploadFile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status);

      const responseText = await res.text();
      console.log("Response text:", responseText);

      let json;
      try {
        json = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("Failed to parse response as JSON:", parseErr);
        throw new Error("Server returned invalid JSON: " + responseText.substring(0, 100));
      }

      console.log("Response JSON:", json);

      if (json.error) {
        throw new Error(json.error);
      }

      if (!json.success && !json.url) {
        throw new Error("Upload failed: No URL returned");
      }

      let fileUrl = json.url;

      // Apply Cloudinary transformation
      if (file.type.startsWith("image/")) {
        fileUrl = applyCloudinaryTransformation(fileUrl, type, side);
        console.log("Transformed URL:", fileUrl);
      }

      setUploadedFile(fileUrl);
      onUploadComplete(fileUrl, file.type);
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- REMOVE (UI ONLY) ---------------- */

  const removeFile = () => {
    setUploadedFile(null);
    onUploadComplete("", undefined);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const config = getFileConfig(type);
  const { icon: Icon, label, accept, sizeLabel, dimensions } = config;

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
          dimensions,
          uploadedFile
            ? "border-green-300 bg-green-50"
            : "border-gray-300 hover:border-gray-400",
          uploading && "border-blue-300 bg-blue-50"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
            <p className="text-sm text-blue-600">Uploading...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-green-600 font-medium mb-2">
              {label} uploaded
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById(`${type}-${side || 'single'}-upload`)?.click()
                }
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Icon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">Upload {label}</p>
            <p className="text-xs text-gray-500 mb-3">{sizeLabel}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`${type}-${side || 'single'}-upload`)?.click()}
            >
              Choose File
            </Button>
          </div>
        )}

        <Input
          id={`${type}-${side || 'single'}-upload`}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

/* ============================================================
   DOCUMENT UPLOAD (BATCH)
============================================================ */

interface DocumentUploadProps {
  institutionCode: string;
  hasLicense: boolean;

  onSignatureUpload: (url: string) => void;
  onPhotoUpload: (url: string) => void;
  onSslcUpload: (url: string) => void;
  onLicenseUpload: (url: string, mimeType?: string) => void;
  onLicenseBackUpload?: (url: string) => void;
  onAadharUpload: (url: string, mimeType?: string) => void;
  onAadharBackUpload?: (url: string) => void;

  signatureUrl?: string;
  photoUrl?: string;
  sslcUrl?: string;
  licenseUrl?: string;
  licenseBackUrl?: string;
  aadharUrl?: string;
  aadharBackUrl?: string;

  // Track file types
  licenseFileType?: string;
  aadharFileType?: string;
}

export function DocumentUpload({
  institutionCode,
  hasLicense,

  onSignatureUpload,
  onPhotoUpload,
  onSslcUpload,
  onLicenseUpload,
  onLicenseBackUpload,
  onAadharUpload,
  onAadharBackUpload,

  signatureUrl,
  photoUrl,
  sslcUrl,
  licenseUrl,
  licenseBackUrl,
  aadharUrl,
  aadharBackUrl,

  licenseFileType,
  aadharFileType,
}: DocumentUploadProps) {
  // Show back upload if front is uploaded AND is an image
  const showLicenseBack = licenseUrl && onLicenseBackUpload && licenseFileType?.startsWith("image/");
  const showAadharBack = aadharUrl && onAadharBackUpload && aadharFileType?.startsWith("image/");

  return (
    <div className="space-y-6">
      {/* Personal Documents */}
      <div>
        <h3 className="text-lg font-medium mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            type="signature"
            institutionCode={institutionCode}
            currentFile={signatureUrl}
            onUploadComplete={onSignatureUpload}
          />
          <FileUpload
            type="photo"
            institutionCode={institutionCode}
            currentFile={photoUrl}
            onUploadComplete={onPhotoUpload}
          />
        </div>
      </div>

      {/* Identity Documents */}
      <div>
        <h3 className="text-lg font-medium mb-4">Identity Documents</h3>

        {/* License Section */}
        {hasLicense && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                type="license"
                side="front"
                institutionCode={institutionCode}
                currentFile={licenseUrl}
                onUploadComplete={(url, mimeType) => onLicenseUpload(url, mimeType)}
              />
              {showLicenseBack && (
                <FileUpload
                  type="license"
                  side="back"
                  institutionCode={institutionCode}
                  currentFile={licenseBackUrl}
                  onUploadComplete={(url) => onLicenseBackUpload?.(url)}
                />
              )}
            </div>
            {showLicenseBack && (
              <p className="text-sm text-gray-500 mt-2">
                Upload both front and back sides as separate images.
              </p>
            )}
            {!showLicenseBack && licenseUrl && (
              <p className="text-sm text-gray-500 mt-2">
                PDF uploaded. Back side upload is not required.
              </p>
            )}
          </div>
        )}

        {/* SSLC Section */}
        {!hasLicense && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                type="sslc"
                institutionCode={institutionCode}
                currentFile={sslcUrl}
                onUploadComplete={onSslcUpload}
              />
            </div>
          </div>
        )}

        {/* Aadhar Section */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              type="aadhar"
              side="front"
              institutionCode={institutionCode}
              currentFile={aadharUrl}
              onUploadComplete={(url, mimeType) => onAadharUpload(url, mimeType)}
            />
            {showAadharBack && (
              <FileUpload
                type="aadhar"
                side="back"
                institutionCode={institutionCode}
                currentFile={aadharBackUrl}
                onUploadComplete={(url) => onAadharBackUpload?.(url)}
              />
            )}
          </div>
          {showAadharBack && (
            <p className="text-sm text-gray-500 mt-2">
              Upload both front and back sides as separate images.
            </p>
          )}
          {!showAadharBack && aadharUrl && (
            <p className="text-sm text-gray-500 mt-2">
              PDF uploaded. Back side upload is not required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}