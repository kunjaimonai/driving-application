"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DocumentUpload } from "@/components/ui/upload";
import { DrivingSchool } from "@/lib/types";
import { fetchDrivingSchools } from "@/lib/drivingSchools";
import { submitApplication } from "@/lib/drivingLicenseService";

type LicenseClass = "M/C" | "LMV" | "M/C,LMV";
const SCHOOL_CACHE_KEY = "driving_schools_cache";

function FormContent() {
  const searchParams = useSearchParams();

  // Sanitize URL ID
  const rawId = searchParams.get("schoolid");
  const schoolIdFromUrl = rawId ? rawId.replace(/['"]+/g, "").trim() : "";

  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<DrivingSchool[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");
  const [selectedSchoolPlace, setSelectedSchoolPlace] = useState("");

  const [formData, setFormData] = useState({
    institutionCode: "",
    name: "",
    fatherHusbandName: "",
    dateOfBirth: "",
    age: "",
    placeOfBirth: "",
    qualification: "",
    class: "",
    bloodGroup: "",
    gender: "",
    applicantMobile: "",
    emergencyMobile: "",
    aadharNo: "",
    emailId: "",
    identificationMark1: "",
    identificationMark2: "",
    house: "",
    place: "",
    village: "",
    taluk: "",
    postOffice: "",
    pinCode: "",
    district: "",
    signatureUrl: "",
    photoUrl: "",
    sslcUrl: "",
    licenseUrl: "",
    licenseBackUrl: "",
    aadharUrl: "",
    aadharBackUrl: "",
    licenseFileType: "",
    aadharFileType: "",
    hasLicense: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* =========================
      LOAD SCHOOLS (CACHED)
  ========================= */
  useEffect(() => {
    const cached = sessionStorage.getItem(SCHOOL_CACHE_KEY);
    if (cached) {
      setSchools(JSON.parse(cached));
      setLoadingSchools(false);
      return;
    }

    fetchDrivingSchools()
      .then((data) => {
        setSchools(data);
        sessionStorage.setItem(SCHOOL_CACHE_KEY, JSON.stringify(data));
      })
      .finally(() => setLoadingSchools(false));
  }, []);

  /* =========================
      AUTO-SET SCHOOL FROM URL
  ========================= */
  useEffect(() => {
    if (schools.length > 0 && schoolIdFromUrl) {
      const foundSchool = schools.find(
        (s) => s.code.toString() === schoolIdFromUrl
      );
      if (foundSchool) {
        setFormData((prev) => ({
          ...prev,
          institutionCode: foundSchool.code.toString(),
        }));
        setSelectedSchoolName(foundSchool.name);
        setSelectedSchoolPlace(foundSchool.place);
      }
    }
  }, [schools, schoolIdFromUrl]);

  /* =========================
      AUTO-CALCULATE AGE
  ========================= */
  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }
      setFormData((prev) => ({ ...prev, age: calculatedAge.toString() }));
    }
  }, [formData.dateOfBirth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.age) < 18) {
      alert("Minimum age requirement is 18 years.");
      return;
    }
    try {
      setLoading(true);
      await submitApplication({
        ...formData,
        class: formData.class as LicenseClass,
        gender: formData.gender as "Male" | "Female" | "Other",
        age: Number(formData.age),
      });
      alert("Application submitted successfully");
      window.location.reload();
    } catch (err) {
      alert(
        "Submission failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 1. SCHOOL NAME ABOVE TITLE */}
      {selectedSchoolName && selectedSchoolPlace && (
        <div className="text-center mb-4">
          <h1 className="text-2xl font-black text-primary tracking-tight">
            {selectedSchoolName.toUpperCase()}
          </h1>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            {selectedSchoolPlace.toUpperCase()}
          </h1>
        </div>
      )}

      <Card>
        <CardHeader className="text-center border-b mb-6 bg-muted/20">
          <CardTitle className="text-xl font-bold tracking-widest text-muted-foreground uppercase">
            Driving License Application Form
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="hidden"
              name="institutionCode"
              value={formData.institutionCode}
            />

            {/* 2. SCHOOL SELECTION (ONLY SHOWS IF NO URL PARAM) */}
            {!schoolIdFromUrl && (
              <div className="pb-4">
                <Label className="font-bold">Select Driving School *</Label>
                {loadingSchools ? (
                  <div className="h-10 w-full rounded-md border bg-muted animate-pulse" />
                ) : (
                  <select
                    value={formData.institutionCode}
                    onChange={(e) =>
                      handleInputChange("institutionCode", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="" disabled>
                      -- Select School --
                    </option>
                    {schools.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.place})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* PERSONAL INFO SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name of Applicant *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Father / Husband Name *</Label>
                <Input
                  value={formData.fatherHusbandName}
                  onChange={(e) =>
                    handleInputChange("fatherHusbandName", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  value={formData.age}
                  readOnly
                  className="bg-gray-100 font-bold"
                />
              </div>
              <div>
                <Label>Place of Birth</Label>
                <Input
                  value={formData.placeOfBirth}
                  onChange={(e) =>
                    handleInputChange("placeOfBirth", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Qualification</Label>
                <Input
                  value={formData.qualification}
                  onChange={(e) =>
                    handleInputChange("qualification", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Class *</Label>
                <Select
                  value={formData.class}
                  onValueChange={(v) => handleInputChange("class", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M/C">M/C</SelectItem>
                    <SelectItem value="LMV">LMV</SelectItem>
                    <SelectItem value="M/C,LMV">M/C, LMV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Blood Group</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(v) => handleInputChange("bloodGroup", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "A+",
                      "A-",
                      "B+",
                      "B-",
                      "AB+",
                      "AB-",
                      "O+",
                      "O-",
                      "Unknown",
                    ].map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CONTACT & IDENTIFICATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => handleInputChange("gender", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Applicant Mobile *</Label>
                <Input
                  value={formData.applicantMobile}
                  onChange={(e) =>
                    handleInputChange("applicantMobile", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label>Emergency Mobile</Label>
                <Input
                  value={formData.emergencyMobile}
                  onChange={(e) =>
                    handleInputChange("emergencyMobile", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Aadhar Number</Label>
                <Input
                  value={formData.aadharNo}
                  onChange={(e) =>
                    handleInputChange("aadharNo", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Email ID</Label>
                <Input
                  type="email"
                  value={formData.emailId}
                  onChange={(e) => handleInputChange("emailId", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Identification Mark 1</Label>
                <Input
                  value={formData.identificationMark1}
                  onChange={(e) =>
                    handleInputChange("identificationMark1", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Identification Mark 2</Label>
                <Input
                  value={formData.identificationMark2}
                  onChange={(e) =>
                    handleInputChange("identificationMark2", e.target.value)
                  }
                />
              </div>
            </div>

            {/* ADDRESS SECTION */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold text-muted-foreground uppercase text-sm tracking-wider">
                Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>House Name/No</Label>
                  <Input
                    value={formData.house}
                    onChange={(e) => handleInputChange("house", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Place</Label>
                  <Input
                    value={formData.place}
                    onChange={(e) => handleInputChange("place", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Village</Label>
                  <Input
                    value={formData.village}
                    onChange={(e) =>
                      handleInputChange("village", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Taluk</Label>
                  <Input
                    value={formData.taluk}
                    onChange={(e) => handleInputChange("taluk", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Post Office</Label>
                  <Input
                    value={formData.postOffice}
                    onChange={(e) =>
                      handleInputChange("postOffice", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>PIN Code</Label>
                  <Input
                    value={formData.pinCode}
                    onChange={(e) =>
                      handleInputChange("pinCode", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>District</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) =>
                      handleInputChange("district", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* DOCUMENTS SECTION */}
            <div className="pt-4 border-t">
              <Label className="font-bold text-lg">Required Documents *</Label>
              <div className="flex items-center gap-3 mt-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.hasLicense}
                  onChange={(e) =>
                    handleInputChange("hasLicense", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">
                  I already have a driving license (Renewal/Addition)
                </span>
              </div>

              <DocumentUpload
                institutionCode={formData.institutionCode}
                hasLicense={formData.hasLicense}
                signatureUrl={formData.signatureUrl}
                photoUrl={formData.photoUrl}
                sslcUrl={formData.sslcUrl}
                licenseUrl={formData.licenseUrl}
                licenseBackUrl={formData.licenseBackUrl}
                aadharUrl={formData.aadharUrl}
                aadharBackUrl={formData.aadharBackUrl}
                onSignatureUpload={(v) => handleInputChange("signatureUrl", v)}
                onPhotoUpload={(v) => handleInputChange("photoUrl", v)}
                onSslcUpload={(v) => handleInputChange("sslcUrl", v)}
                onLicenseUpload={(v, mimeType) => {
                  handleInputChange("licenseUrl", v);
                  handleInputChange("licenseFileType", mimeType);
                }}
                onAadharUpload={(v, mimeType) => {
                  handleInputChange("aadharUrl", v);
                  handleInputChange("aadharFileType", mimeType);
                }}
              />
            </div>

            <Button
              disabled={
                loading ||
                loadingSchools ||
                (formData.age !== "" && Number(formData.age) < 18)
              }
              type="submit"
              className="w-full text-lg h-14 font-bold shadow-lg"
            >
              {loading ? "Submitting Application..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DrivingLicenseForm() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center animate-pulse">
          Initializing Form...
        </div>
      }
    >
      <FormContent />
    </Suspense>
  );
}
