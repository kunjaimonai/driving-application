import { DrivingSchool } from "./types"

const API_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!

export async function fetchDrivingSchools(): Promise<DrivingSchool[]> {
  const res = await fetch("/api?action=getSchools")

  if (!res.ok) {
    throw new Error("Failed to fetch schools")
  }

  return res.json()
}

