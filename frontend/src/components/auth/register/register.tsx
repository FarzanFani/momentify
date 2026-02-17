"use client";

import { useState } from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import axiosInstance from "@/api/axiosInstance";
import * as styles from "@/components/auth/login/styles";
import Link from "next/link";
import InputField from "@/components/common/input/InputField";
import PasswordField from "@/components/common/password/PasswordField";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axiosInstance.post("/api/accounts/register/", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
        phone_number: phoneNumber,
      });
      alert("Register successful!");
    } catch (err: any) {
      alert(err);
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

          <InputField
            value={firstName}
            onChange={setFirstName}
            label="First Name"
            placeholder="Enter your first name"
          />
          <InputField
            value={lastName}
            onChange={setLastName}
            label="Last Name"
            placeholder="Enter your last name"
          />
          <InputField
            value={email}
            onChange={setEmail}
            label="Email"
            placeholder="Enter your email"
            type="email"
          />
          <InputField
            value={phoneNumber}
            onChange={setPhoneNumber}
            label="Phone Number"
            placeholder="Enter your phone number"
            type="tel"
          />
          <PasswordField value={password} onChange={setPassword} />
          <PasswordField
            value={confirmPassword}
            onChange={setConfirmPassword}
            label="Confirm Password"
            placeholder="Confirm your password"
          />

          <Button
            variant="contained"
            onClick={handleRegister}
            color="primary"
            sx={styles.registerButton}
          >
            Register
          </Button>

          <Link href="/login">
            <Button variant="text" color="primary" sx={styles.registerButton}>
              Already have an account?
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
