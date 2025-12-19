export interface DrivingSchool {
  code: string;
  name: string;
  email: string;
  driveFolderId: string;
  place: string;
  active: boolean;
}

export interface DrivingLicenseApplication {
  institutionCode: string;
  name: string;
  fatherHusbandName: string;
  dateOfBirth: string;
  age: number;
  placeOfBirth: string;
  qualification: string;
  class: "M/C" | "LMV" | "M/C,LMV" | "Heavy";
  bloodGroup: string;
  gender: "Male" | "Female" | "Other";
  applicantMobile: string;
  emergencyMobile: string;
  aadharNo: string;
  emailId: string;
  identificationMark1: string;
  identificationMark2: string;
  house: string;
  place: string;
  village: string;
  taluk: string;
  postOffice: string;
  pinCode: string;
  district: string;
  signatureUrl: string;
  photoUrl: string;
  sslcUrl: string;
  licenseUrl: string;
  aadharUrl: string;
  hasLicense: boolean;
}