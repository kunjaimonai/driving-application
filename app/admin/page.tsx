"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface School {
  code: string
  name: string
  email: string
  driveFolderId: string
  place: string
}

export default function AdminDrivingSchools() {
  const [password, setPassword] = useState("")
  const [auth, setAuth] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({
    code: "",
    name: "",
    email: "",
    driveFolderId: "",
    place: "",
  })

  useEffect(() => {
    if (!auth) return
    setLoading(true)
    // fetchDrivingSchools().then(setSchools).finally(() => setLoading(false))
  }, [auth])

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

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.success) {
        throw new Error("Failed to add school")
      }

      setSuccess("School added successfully!")
      setForm({
        code: "",
        name: "",
        email: "",
        driveFolderId: "",
        place: "",
      })

      // fetchDrivingSchools().then(setSchools)
    } catch (err) {
      setError((err as Error).message || "Failed to add school")
    }
  }

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
              onKeyDown={(e) => e.key === 'Enter' && setAuth(password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD)}
            />
            <Button
              className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setAuth(password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD)}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Driving Schools</h1>
              <p className="text-gray-600">Manage your driving school database</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setAuth(false)}
              className="border-2 hover:bg-gray-50"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Add School Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add New School</h2>
          </div>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Code</label>
              <Input
                placeholder="e.g., ABC123"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
              <Input
                placeholder="e.g., Premier Driving Academy"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="e.g., contact@school.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Place</label>
              <Input
                placeholder="e.g., New York, NY"
                value={form.place}
                onChange={(e) => setForm({ ...form, place: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Drive Folder ID</label>
              <Input
                placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j"
                value={form.driveFolderId}
                onChange={(e) => setForm({ ...form, driveFolderId: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          <Button
            onClick={addSchool}
            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add School
          </Button>
        </div>

        {/* Schools List */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Schools</h2>
              <p className="text-gray-600 text-sm">{schools.length} schools registered</p>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading schools...</p>
            </div>
          )}

          {!loading && schools.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg">No schools added yet</p>
              <p className="text-gray-500 text-sm">Add your first driving school above</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((s) => (
              <div key={s.code} className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                    {s.code}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{s.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {s.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {s.place}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}