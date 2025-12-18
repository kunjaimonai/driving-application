"use client";

import type React from "react";
import { useState, useEffect } from "react";
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

export default function DrivingLicenseForm() {
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<DrivingSchool[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  useEffect(() => {
    fetchDrivingSchools()
      .then(setSchools)
      .finally(() => setLoadingSchools(false));
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.institutionCode) {
      alert("Please select driving school");
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.fatherHusbandName || !formData.dateOfBirth) {
      alert("Please fill all required fields");
      return;
    }

    // Validate documents
    if (!formData.signatureUrl || !formData.photoUrl || !formData.aadharUrl) {
      alert("Please upload Signature, Photo, and Aadhar documents");
      return;
    }

    if (formData.hasLicense && !formData.licenseUrl) {
      alert("Please upload existing license");
      return;
    }

    if (!formData.hasLicense && !formData.sslcUrl) {
      alert("Please upload SSLC/Birth Certificate");
      return;
    }

    try {
      setLoading(true);
      await submitApplication({
        ...formData,
        class: formData.class as "M/C" | "LMV" | "M/C,LMV",
        gender: formData.gender as "Male" | "Female" | "Other",
        age: Number(formData.age),
      });

      alert("Application submitted successfully");

      // Reset form
      setFormData({
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
        aadharUrl: "",
        hasLicense: false,
        licenseBackUrl: "",
        aadharBackUrl: "",
        licenseFileType: "",
        aadharFileType: "",
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Submission failed: " + (err instanceof Error ? err.message : "Unknown error"));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">
            DRIVING LICENSE APPLICATION FORM
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DRIVING SCHOOL */}
            <div>
              <Label>Driving School *</Label>
              <select
                value={formData.institutionCode}
                onChange={(e) =>
                  handleInputChange("institutionCode", e.target.value)
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>
                  {loadingSchools
                    ? "Loading driving schools..."
                    : "Select driving school"}
                </option>
                {schools.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} – {s.place}
                  </option>
                ))}
              </select>
            </div>

            {/* PERSONAL INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
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
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                />
              </div>
              <div>
                <Label>Place of Birth</Label>
                <Input
                  placeholder="Place of Birth"
                  value={formData.placeOfBirth}
                  onChange={(e) =>
                    handleInputChange("placeOfBirth", e.target.value)
                  }
                />
              </div>
            </div>

            {/* CLASS / GENDER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Class *</Label>
                <Select
                  value={formData.class}
                  onValueChange={(v) => handleInputChange("class", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Class" />
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
            </div>

            {/* CONTACT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Mobile *</Label>
                <Input
                  placeholder="Mobile"
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
                  placeholder="Emergency Mobile"
                  value={formData.emergencyMobile}
                  onChange={(e) =>
                    handleInputChange("emergencyMobile", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Aadhar Number *</Label>
                <Input
                  placeholder="Aadhar Number"
                  value={formData.aadharNo}
                  onChange={(e) => handleInputChange("aadharNo", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.emailId}
                  onChange={(e) => handleInputChange("emailId", e.target.value)}
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <h3 className="text-lg font-medium mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="House/Building"
                  value={formData.house}
                  onChange={(e) => handleInputChange("house", e.target.value)}
                />
                <Input
                  placeholder="Place"
                  value={formData.place}
                  onChange={(e) => handleInputChange("place", e.target.value)}
                />
                <Input
                  placeholder="Village"
                  value={formData.village}
                  onChange={(e) => handleInputChange("village", e.target.value)}
                />
                <Input
                  placeholder="Taluk"
                  value={formData.taluk}
                  onChange={(e) => handleInputChange("taluk", e.target.value)}
                />
                <Input
                  placeholder="Post Office"
                  value={formData.postOffice}
                  onChange={(e) =>
                    handleInputChange("postOffice", e.target.value)
                  }
                />
                <Input
                  placeholder="PIN Code"
                  value={formData.pinCode}
                  onChange={(e) => handleInputChange("pinCode", e.target.value)}
                />
                <Input
                  placeholder="District"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                />
              </div>
            </div>

            {/* DOCUMENTS */}
            <div>
              <Label className="font-semibold">Documents *</Label>

              <div className="flex items-center gap-3 mt-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.hasLicense}
                  onChange={(e) =>
                    handleInputChange("hasLicense", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <span>Already has license</span>
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
                licenseFileType={formData.licenseFileType}
                aadharFileType={formData.aadharFileType}
                onSignatureUpload={(v) => handleInputChange("signatureUrl", v)}
                onPhotoUpload={(v) => handleInputChange("photoUrl", v)}
                onSslcUpload={(v) => handleInputChange("sslcUrl", v)}
                onLicenseUpload={(v, mimeType) => {
                  handleInputChange("licenseUrl", v);
                  handleInputChange("licenseFileType", mimeType);
                }}
                onLicenseBackUpload={(v) => handleInputChange("licenseBackUrl", v)}
                onAadharUpload={(v, mimeType) => {
                  handleInputChange("aadharUrl", v);
                  handleInputChange("aadharFileType", mimeType);
                }}
                onAadharBackUpload={(v) => handleInputChange("aadharBackUrl", v)}
              />
            </div>

            <div className="flex justify-center pt-6">
              <Button disabled={loading} type="submit" size="lg">
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}