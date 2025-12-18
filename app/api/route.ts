import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/* ===========================
   GET (simple proxy)
=========================== */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action") || ""

  const res = await fetch(`${APPS_SCRIPT_URL}?action=${action}`)

  const text = await res.text()

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

/* ===========================
   POST (JSON + FILE UPLOAD)
=========================== */
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action") || ""
  const contentType = req.headers.get("content-type") || ""

  let res: Response

  // 🔹 MULTIPART (Form Data) - Proxy directly
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const side = formData.get("side") as string | null
    const institutionCode = formData.get("institutionCode") as string

    const scriptFormData = new FormData()
    scriptFormData.append("file", file)

    const uploadUrl = new URL(APPS_SCRIPT_URL)
    uploadUrl.searchParams.set("action", action)
    uploadUrl.searchParams.set("type", encodeURIComponent(type))
    uploadUrl.searchParams.set("institutionCode", encodeURIComponent(institutionCode))
    if (side) {
      uploadUrl.searchParams.set("side", encodeURIComponent(side))
    }

    res = await fetch(uploadUrl.toString(), {
      method: "POST",
      body: scriptFormData,
    })
  }
  // 🔹 JSON (Base64 Upload or Data Submission)
  else {
    let body;
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // Check if this is a file upload that we can handle with Cloudinary
    const isFileUpload = action === "uploadFile" && body.file && body.institutionCode

    const hasCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (isFileUpload && hasCloudinary) {
      try {
        console.log("Using Direct Cloudinary Upload");
        const uploadResponse = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload(
            `data:${body.mimeType || 'image/png'};base64,${body.file}`,
            {
              folder: `driving_school/${body.institutionCode || 'general'}`,
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
        })

        return NextResponse.json({
          success: true,
          url: uploadResponse.secure_url,
          format: uploadResponse.format,
          resource_type: uploadResponse.resource_type
        })
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return NextResponse.json({ error: "Upload failed: " + (error as Error).message }, { status: 500 })
      }
    }

    // Fallback or Normal Data Submission -> Proxy to Apps Script
    // We need to construct the URL params from the body
    const scriptUrl = new URL(APPS_SCRIPT_URL)
    scriptUrl.searchParams.set("action", action)

    // Copy relevant fields to params if they exist in body (Apps Script often looks for them in query for some actions)
    if (body.institutionCode) scriptUrl.searchParams.set("institutionCode", body.institutionCode)
    if (body.type) scriptUrl.searchParams.set("type", body.type)
    if (body.side) scriptUrl.searchParams.set("side", body.side)

    res = await fetch(scriptUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  }

  const text = await res.text()

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
