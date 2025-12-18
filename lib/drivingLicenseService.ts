import { DrivingLicenseApplication } from "./types";

export async function submitApplication(
  data: DrivingLicenseApplication
): Promise<void> {
  try {
    const response = await fetch("/api?action=submitApplication", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Submission failed");
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    if (!result.success) {
      throw new Error("Application submission failed");
    }
  } catch (error) {
    console.error("Error submitting application:", error);
    throw error;
  }
}