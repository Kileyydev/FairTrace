"use client";

import React, { useState } from "react";
import { Box, Container, Typography, TextField, Button, Stepper, Step, StepLabel, FormHelperText } from "@mui/material";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

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

interface JwtPayload {
  user_id: number;
  is_sacco_admin: boolean;
  exp: number;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    otp: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

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
    if (!validateStep()) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/users/login";

    try {
      if (step === 0) {
        const res = await fetch(`${API_BASE}/users/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setOtpSent(true);
          setStep(1);
        } else {
          setErrors({ ...errors, password: data.detail || "Invalid credentials" });
        }
      } else if (step === 1) {
        const res = await fetch(`${API_BASE}/users/verify-otp/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);

          const decoded: JwtPayload = jwtDecode(data.access);
          router.push(decoded.is_sacco_admin ? "/admin-dashboard" : "/dashboard");
        } else {
          setErrors({ ...errors, otp: data.detail || "Invalid or expired OTP" });
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ ...errors, [step === 0 ? "password" : "otp"]: "Error communicating with server" });
    }
  };

  const handleResendOtp = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/users";
    try {
      const res = await fetch(`${API_BASE}/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("OTP resent!");
      } else {
        setErrors({ ...errors, otp: data.detail || "Failed to resend OTP" });
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setErrors({ ...errors, otp: "Error communicating with server" });
    }
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              border: "1px solid #c4d8c9",
              p: 4,
              transition: "transform 0.3s ease",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ "& .MuiStepLabel-label": { color: "#1a3c34" } }}>
                    {label}
                  </StepLabel>
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
                    fullWidth
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
                    fullWidth
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
                    fullWidth
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
              <FormHelperText sx={{ textAlign: "center", color: "#4a6b5e", mt: 2 }}>
                Secure login with multi-factor authentication.
              </FormHelperText>
            </Box>
          </Box>
        </motion.div>
      </Container>
      <Footer />
    </Box>
  );
}