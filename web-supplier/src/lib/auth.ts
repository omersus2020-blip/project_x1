// Mock Auth utility for Supplier Portal
const MOCK_USER_ID = "mock-supplier-id-123";

export const auth = {
  getUserId: () => MOCK_USER_ID,
  getToken: () => "mock-token", // In real app, this would be from localStorage
  logout: () => {
    console.log("Logging out...");
    window.location.href = "/";
  }
};
