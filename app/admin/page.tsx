"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DrivingSchool } from "@/lib/types"
import { fetchDrivingSchools } from "@/lib/drivingSchools"

export default function AdminDrivingSchools() {
  const [password, setPassword] = useState("")
  const [auth, setAuth] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [schools, setSchools] = useState<DrivingSchool[]>([])
  const [loadingSchools, setLoadingSchools] = useState(true)

  const [form, setForm] = useState({
    code: "",
    name: "",
    email: "",
    driveFolderId: "",
    place: "",
  })

  /* =========================================================
     FETCH SCHOOLS
  ========================================================= */
  const loadSchools = async () => {
    setLoadingSchools(true)
    try {
      const data = await fetchDrivingSchools()
      setSchools(data)
    } finally {
      setLoadingSchools(false)
    }
  }

  useEffect(() => {
    loadSchools()
  }, [])

  /* =========================================================
     ADD SCHOOL
  ========================================================= */
  const addSchool = async () => {
    try {
      setError("")
      setSuccess("")

      const res = await fetch("/api?action=addSchool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const text = await res.text()

      if (text.startsWith("<")) {
        throw new Error("Server returned HTML instead of JSON")
      }

      const data = JSON.parse(text)

      if (data.error) throw new Error(data.error)
      if (!data.success) throw new Error("Failed to add school")

      setSuccess("School added successfully!")

      setForm({
        code: "",
        name: "",
        email: "",
        driveFolderId: "",
        place: "",
      })

      // 🔄 Refresh list
      await loadSchools()
    } catch (err) {
      setError((err as Error).message || "Failed to add school")
    }
  }

  /* =========================================================
     AUTH SCREEN
  ========================================================= */
  if (!auth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-600">Enter your password to continue</p>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Admin password"
              className="h-12 text-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                setAuth(password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD)
              }
            />
            <Button
              className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
              onClick={() =>
                setAuth(password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD)
              }
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* =========================================================
     MAIN UI
  ========================================================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Driving Schools
            </h1>
            <p className="text-gray-600">
              Manage your driving school database
            </p>
          </div>
          <Button variant="outline" onClick={() => setAuth(false)}>
            Logout
          </Button>
        </div>

        {/* ADD SCHOOL */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Add New School</h2>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              placeholder="School Code"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
            />
            <Input
              placeholder="School Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
            <Input
              placeholder="Place"
              value={form.place}
              onChange={(e) =>
                setForm({ ...form, place: e.target.value })
              }
            />
            <Input
              className="md:col-span-2"
              placeholder="Drive Folder ID"
              value={form.driveFolderId}
              onChange={(e) =>
                setForm({ ...form, driveFolderId: e.target.value })
              }
            />
          </div>

          <Button
            onClick={addSchool}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
          >
            Add School
          </Button>
        </div>

        {/* SCHOOLS LIST */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">
            All Schools ({schools.length})
          </h2>

          {loadingSchools && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600" />
              <p className="mt-4 text-gray-600">Loading schools...</p>
            </div>
          )}

          {!loadingSchools && schools.length === 0 && (
            <p className="text-gray-500 text-center py-12">
              No schools added yet
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((s) => (
              <div
                key={s.code}
                className="border rounded-xl p-5 hover:shadow-md transition"
              >
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                  {s.code}
                </span>
                <h3 className="text-lg font-bold mt-2">{s.name}</h3>
                <p className="text-sm text-gray-600">{s.email}</p>
                <p className="text-sm text-gray-600">{s.place}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
