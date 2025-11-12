"use client";

import React, { useState, useEffect } from "react";
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
import { Close as CloseIcon } from "@mui/icons-material";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";

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
    // Clear error on typing
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
          setOtpSent(true);
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
          const isAdmin = decoded.is_sacco_admin ?? false;

          showToast("Login successful! Redirecting...", "success");
          setTimeout(() => {
            router.push(isAdmin ? "/dashboard/sacco_admin" : "/dashboard");
          }, 1500);
        } else {
          setErrors({
            otp: data.detail || data.error || "Invalid or expired OTP",
          });
          showToast("Invalid OTP. Try again.", "error");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      const msg = "Network error. Please try again.";
      showToast(msg, "error");
      setErrors({
        [step === 0 ? "password" : "otp"]: msg,
      });
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

      if (res.ok) {
        showToast("New OTP sent!", "success");
      } else {
        showToast(data.detail || "Failed to resend OTP", "error");
      }
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
          background: "linear-gradient(135deg, #0f3a2e 0%, #1e6b4a 50%, #2d9a6b 100%)",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.07,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z' fill='%23ffffff' fill-opacity='0.2'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px",
            animation: "float 20s ease-in-out infinite",
          }}
        />

        <TopNavBar />

        <Container maxWidth="sm" sx={{ flex: 1, py: { xs: 4, md: 7 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              gutterBottom
              sx={{
                background: "linear-gradient(90deg, #a8e6cf, #dcedc1)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                mb: 3,
                fontSize: { xs: "1.8rem", md: "2.2rem" },
              }}
            >
              Welcome to FairTrace
            </Typography>

            <Box
              sx={{
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                
                p: { xs: 3, md: 4 },
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease",
              
              }}
            >
              <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label, i) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          color: step >= i ? "#a8e6cf !important" : "#666",
                          "&.Mui-active": { color: "#2d9a6b" },
                          "&.Mui-completed": { color: "#a8e6cf" },
                        },
                      }}
                      sx={{
                        "& .MuiStepLabel-label": {
                          color: "#e0f7e9",
                          fontWeight: 500,
                          fontSize: "0.95rem",
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box component="form" onSubmit={handleNext}>
                    {step === 0 && (
                      <Box sx={{ display: "grid", gap: 2.5 }}>
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
                          variant="filled"
                          InputProps={{
                            sx: {
                              background: "rgba(255,255,255,0.1)",
                              color: "#fff",
                             
                              "& .MuiFilledInput-underline:before": {
                                borderBottomColor: "rgba(255,255,255,0.3)",
                              },
                            },
                          }}
                          InputLabelProps={{ style: { color: "#a8e6cf" } }}
                          sx={{
                            "& .MuiFormHelperText-root": { color: "#ff6b6b" },
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
                          variant="filled"
                          InputProps={{
                            sx: {
                              background: "rgba(255,255,255,0.1)",
                              color: "#fff",
                            },
                          }}
                          InputLabelProps={{ style: { color: "#a8e6cf" } }}
                          sx={{
                            "& .MuiFormHelperText-root": { color: "#ff6b6b" },
                          }}
                        />
                      </Box>
                    )}

                    {step === 1 && (
                      <Box sx={{ display: "grid", gap: 2.5 }}>
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
                          variant="filled"
                          InputProps={{
                            sx: {
                              background: "rgba(255,255,255,0.1)",
                              color: "#fff",
                              fontSize: "1.2rem",
                              letterSpacing: "0.3rem",
                              textAlign: "center",
                            },
                          }}
                          InputLabelProps={{ style: { color: "#a8e6cf" } }}
                          sx={{
                            "& .MuiFormHelperText-root": {
                              color: errors.otp ? "#ff6b6b" : "#a8e6cf",
                              textAlign: "center",
                            },
                          }}
                        />
                        <Button
                          variant="text"
                          onClick={handleResendOtp}
                          disabled={loading}
                          sx={{
                            color: "#a8e6cf",
                            textTransform: "none",
                            fontWeight: 500,
                            alignSelf: "center",

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
                    
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        background: "linear-gradient(45deg, #2d9a6b, #a8e6cf)",
                        color: "#fff",
                        boxShadow: "0 4px 15px rgba(45, 154, 107, 0.4)",
                       
                        "&:disabled": {
                          background: "rgba(255,255,255,0.1)",
                          color: "#888",
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : step === 0 ? (
                        "Send OTP"
                      ) : (
                        "Verify & Login"
                      )}
                    </Button>

                    <FormHelperText
                      sx={{
                        textAlign: "center",
                        color: "#a8e6cf",
                        mt: 2,
                        fontSize: "0.9rem",
                      }}
                    >
                      {step === 0
                        ? "Secure login with email + OTP"
                        : "Enter the code sent to your email"}
                    </FormHelperText>
                  </Box>
                </motion.div>
              </AnimatePresence>
            </Box>
          </motion.div>
        </Container>

        <Footer />
      </Box>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setToast({ ...toast, open: false })}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{
            background: toast.severity === "success" ? "#1e6b4a" : undefined,
            color: "#fff",
            "& .MuiAlert-icon": {
              color: toast.severity === "success" ? "#a8e6cf" : undefined,
            },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </>
  );
}