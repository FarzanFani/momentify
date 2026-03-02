import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  phone_number: string;
  is_verified: boolean;
  has_company_registered: boolean;
}

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserInfo>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
