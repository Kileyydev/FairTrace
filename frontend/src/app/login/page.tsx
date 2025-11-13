"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, Verified, Shield, Mail, Lock, Key } from "@mui/icons-material";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

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
  is_sacco_admin?: boolean;
  is_transporter?: boolean;
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
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof Errors]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Errors = {};
    if (step === 0) {
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
      if (!formData.password) newErrors.password = "Password is required";
    } else if (step === 1) {
      if (!formData.otp.trim()) newErrors.otp = "OTP is required";
      else if (formData.otp.length !== 6) newErrors.otp = "OTP must be 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message: string, severity: "success" | "error" | "info") => {
    setToast({ open: true, message, severity });
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);

    try {
      if (step === 0) {
        const res = await fetch(`${API_BASE}/users/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setStep(1);
          showToast("OTP sent to your email!", "success");
        } else {
          setErrors({ password: data.detail || "Invalid credentials" });
          showToast(data.detail || "Login failed", "error");
        }
      } else if (step === 1) {
        const res = await fetch(`${API_BASE}/users/verify-otp/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.trim(),
            otp: formData.otp.trim(),
          }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);

          const decoded: JwtPayload = jwtDecode(data.access);
          const role = decoded.is_sacco_admin
            ? "sacco_admin"
            : decoded.is_transporter
              ? "transporter"
              : "farmer";

          showToast("Login successful! Redirecting...", "success");
          setTimeout(() => {
            router.push(`/dashboard/${role}`);
          }, 1500);
        } else {
          setErrors({ otp: data.detail || data.error || "Invalid or expired OTP" });
          showToast("Invalid OTP. Try again.", "error");
        }
      }
    } catch (err) {
      const msg = "Network error. Please try again.";
      showToast(msg, "error");
      setErrors({ [step === 0 ? "password" : "otp"]: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (res.ok) showToast("New OTP sent!", "success");
      else showToast(data.detail || "Failed to resend OTP", "error");
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Credentials", "Verify OTP"];

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          background: "#ffffff",
          color: "#1a3c34",
          display: "flex",
          flexDirection: "column",
          borderTop: "4px double #1a3c34",
          borderBottom: "4px double #1a3c34",
        }}
      >
        <TopNavBar />

        <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 6, md: 8 } }}>
          {/* Official Header */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Georgia", serif',
                fontSize: { xs: "2.2rem", md: "3rem" },
                fontWeight: 800,
                letterSpacing: "-0.05em",
                color: "#1a3c34",
                mb: 1,
              }}
            >
              FAIRTRACE LOGIN
            </Typography>
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#2f855a",
                letterSpacing: "2.2px",
                textTransform: "uppercase",
              }}
            >
              Secure Access  • 2025
            </Typography>
          </Box>

          {/* Login Form — Certificate Style */}
          <Box
            sx={{
              background: "#ffffff",
              border: "4px double #1a3c34",
              p: { xs: 4, md: 5 },
              boxShadow: "0 16px 50px rgba(26, 60, 52, 0.16)",
              position: "relative",
              maxWidth: 520,
              mx: "auto",
            }}
          >
            {/* Official Seal */}
            <Box
              sx={{
                position: "absolute",
                top: -18,
                right: 18,
                width: 72,
                height: 72,
                border: "5px double #1a3c34",
                borderRadius: "50%",
                bgcolor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.52rem",
                fontWeight: 800,
                color: "#1a3c34",
                boxShadow: "0 8px 24px rgba(26, 60, 52, 0.22)",
                zIndex: 10,
              }}
            >
              <Verified style={{ fontSize: 24 }} />
              SECURE<br />ACCESS
            </Box>

            <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label, i) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        color: step >= i ? "#2f855a" : "#ccc",
                        "&.Mui-active": { color: "#2f855a" },
                        "&.Mui-completed": { color: "#2f855a" },
                      },
                    }}
                    sx={{
                      "& .MuiStepLabel-label": {
                        color: "#1a3c34",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box component="form" onSubmit={handleNext} sx={{ mt: 2 }}>
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
                    InputProps={{
                      startAdornment: <Mail sx={{ color: "#2f855a", mr: 1 }} />,
                      sx: {
                        background: "#f8faf9",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1a3c34",
                        },
                      },
                    }}
                    InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                    sx={{
                      "& .MuiFormHelperText-root": { color: "#d32f2f" },
                    }}
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
                    InputProps={{
                      startAdornment: <Lock sx={{ color: "#2f855a", mr: 1 }} />,
                      sx: { background: "#f8faf9" },
                    }}
                    InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                  />
                </Box>
              )}

              {step === 1 && (
                <Box sx={{ display: "grid", gap: 3, alignItems: "center" }}>
                  <TextField
                    label="6-Digit OTP"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    error={!!errors.otp}
                    helperText={errors.otp || "Check your email (including spam)"}
                    fullWidth
                    inputProps={{ maxLength: 6 }}
                    InputProps={{
                      startAdornment: <Key sx={{ color: "#2f855a", mr: 1 }} />,
                      sx: {
                        background: "#f8faf9",
                        fontSize: "1.3rem",
                        letterSpacing: "0.4rem",
                        textAlign: "center",
                      },
                    }}
                    InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                    sx={{
                      "& .MuiFormHelperText-root": {
                        color: errors.otp ? "#d32f2f" : "#666",
                        textAlign: "center",
                      },
                    }}
                  />
                  <Button
                    variant="text"
                    onClick={handleResendOtp}
                    disabled={loading}
                    sx={{
                      color: "#2f855a",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                    }}
                  >
                    {loading ? "Sending..." : "Resend OTP"}
                  </Button>
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  mt: 4,
                  py: 2,
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  fontFamily: '"Georgia", serif',
                  textTransform: "none",
                  background: "linear-gradient(45deg, #1a3c34 0%, #2f855a 100%)",
                  border: "3px solid #1a3c34",
                  borderRadius: "0px",
                  boxShadow: "0 10px 30px rgba(26,60,52,0.28)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #0f241d 0%, #276749 100%)",
                    boxShadow: "0 12px 35px rgba(26,60,52,0.35)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={26} color="inherit" />
                ) : step === 0 ? (
                  "Send OTP"
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <FormHelperText
                sx={{
                  textAlign: "center",
                  color: "#2f855a",
                  mt: 2,
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                {step === 0
                  ? "Secure login with email + OTP"
                  : "Enter the code sent to your email"}
              </FormHelperText>
            </Box>
          </Box>
        </Container>

        <Footer />
      </Box>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          action={
            <IconButton size="small" color="inherit" onClick={() => setToast({ ...toast, open: false })}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{
            background: toast.severity === "success" ? "#1e6b4a" : "#d32f2f",
            color: "#fff",
            fontWeight: 600,
            "& .MuiAlert-icon": { color: "#a8e6cf" },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}