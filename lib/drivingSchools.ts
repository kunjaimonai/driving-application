import { DrivingSchool } from "@/lib/types"

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!

export async function fetchDrivingSchools(): Promise<DrivingSchool[]> {
  const res = await fetch(
    `${APPS_SCRIPT_URL}?action=getSchools`,
    { cache: "no-store" } // always fresh
  )

  if (!res.ok) {
    throw new Error("Failed to fetch driving schools")
  }

  return res.json()
}
