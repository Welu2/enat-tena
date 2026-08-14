const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: {
        id: string;
        phone_number: string;
        full_name?: string;
    };
}
export interface OnboardingPayload {
  taking_supplements: boolean;
  supplements: string[];
  appointment_date?: string | null;
  mic_permission_granted: boolean;
}


export async function submitOnboardingData(payload: OnboardingPayload) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/user/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to save profile" }));
    throw new Error(err.detail || "Error saving onboarding details");
  }

  return res.json();
}


export async function loginWithFastAPI(phoneNumber: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber, password }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(errorData.detail || "Authentication error");
    }

    return res.json();
}

export async function registerWithFastAPI(
    fullName: string,
    phoneNumber: string,
    password: string
): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            full_name: fullName,
            phone_number: phoneNumber,
            password,
        }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Registration failed" }));
        throw new Error(errorData.detail || "Registration failed");
    }

    return res.json();
    

}