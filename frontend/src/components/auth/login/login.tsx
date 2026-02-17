"use client";

import { useState } from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import axiosInstance from "@/api/axiosInstance";
import * as styles from "./styles";
import Link from "next/link";
import InputField from "@/components/common/input/InputField";
import PasswordField from "@/components/common/password/PasswordField";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post("/api/token/", {
        email,
        password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      alert("Login successful!");
    } catch (err: any) {
      alert(err.response.data.detail);
    }
  };

  return (
    <Box sx={styles.pageContainer}>
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          sx={styles.card}
        >
          <Box sx={styles.headerBox}>
            <Typography variant="body2" sx={styles.subtitle}>
              Welcome to
            </Typography>
            <Typography variant="h4" color="primary.dark" sx={styles.title}>
              Momentify
            </Typography>
          </Box>

          <InputField value={email} onChange={setEmail} label="Email" placeholder="Enter your email" type="email" />
          <PasswordField value={password} onChange={setPassword} />

          <Button
            variant="contained"
            onClick={handleLogin}
            color="primary"
            sx={styles.loginButton}
          >
            Login
          </Button>

          <Link href="/register">
            <Button variant="text" color="primary" sx={styles.registerButton}>
              Don&apos;t have an account?
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
