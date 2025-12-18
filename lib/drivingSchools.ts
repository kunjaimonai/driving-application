import { DrivingSchool } from "@/lib/types"

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!

export async function fetchDrivingSchools(): Promise<DrivingSchool[]> {
  const res = await fetch(
    `${APPS_SCRIPT_URL}?action=getSchools`,
    {
      next: { revalidate: 60 }, // cache 1 min
    }
  )

  if (!res.ok) throw new Error("Failed")

  return res.json()
}
