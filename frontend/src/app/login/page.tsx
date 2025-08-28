"use client";

import React, { useState } from "react";
import { Box, Container, Typography, TextField, Button, Stepper, Step, StepLabel, FormHelperText } from "@mui/material";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";

interface FormData {
  email: string;
  password: string;
  otp: string;
}

interface Errors {
  email?: string;
  password?: string;
  otp?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    otp: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0); // 0: Email/Password, 1: OTP
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    const newErrors: Errors = {};
    if (step === 0) {
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.password) newErrors.password = "Password is required";
    } else if (step === 1) {
      if (!formData.otp) newErrors.otp = "OTP is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      if (step === 0) {
        // Placeholder for API call to verify email/password and send OTP
        // e.g., await api.login({ email: formData.email, password: formData.password });
        console.log("Sending OTP to:", formData.email);
        setOtpSent(true);
        setStep(1);
      } else {
        // Placeholder for API call to verify OTP and login
        // e.g., await api.verifyOtp({ email: formData.email, otp: formData.otp });
        console.log("OTP verified:", formData.otp);
        alert("Login successful! Redirecting based on role...");
        // Redirect based on role (e.g., SACCO employee or customer)
      }
    }
  };

  const handleResendOtp = () => {
    // Placeholder for resending OTP
    console.log("Resending OTP to:", formData.email);
    alert("OTP resent!");
  };

  const steps = ["Email & Password", "Verify OTP"];

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1a3c34 0%, #2f855a 100%)",
        color: "#ffffff",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <TopNavBar />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4e4d9' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 20l10 10-10 10-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          fontWeight="600"
          textAlign="center"
          gutterBottom
          sx={{ color: "#ffffff", mb: 4 }}
        >
          Login to FairTrace
        </Typography>
        <Box
          sx={{
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            border: "1px solid #c4d8c9",
            p: 4,
          }}
        >
          <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ "& .MuiStepLabel-label": { color: "#1a3c34" } }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box component="form" onSubmit={handleNext}>
            {step === 0 && (
              <Box sx={{ display: "grid", gap: 3 }}>
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Box>
            )}
            {step === 1 && (
              <Box sx={{ display: "grid", gap: 3 }}>
                <TextField
                  label="Enter OTP"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  error={!!errors.otp}
                  helperText={errors.otp || "Check your email for the OTP"}
                />
                <Button
                  variant="text"
                  onClick={handleResendOtp}
                  sx={{ color: "#2f855a", textTransform: "none" }}
                >
                  Resend OTP
                </Button>
              </Box>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 3,
                background: "#2f855a",
                color: "#ffffff",
                borderRadius: "8px",
                "&:hover": {
                  background: "#276749",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              {step === 0 ? "Continue" : "Login"}
            </Button>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}