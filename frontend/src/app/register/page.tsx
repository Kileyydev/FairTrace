// app/register/page.tsx
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
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, ArrowForward, ArrowBack } from "@mui/icons-material";
import dynamic from "next/dynamic";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";
import { Stamp, MapPin } from "lucide-react";

// Dynamic imports - fully SSR-safe
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

// Custom icon setup - only in browser
let L: any = typeof window !== "undefined" ? require("leaflet") : null;

const customIcon = L
  ? new L.Icon({
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  : null;

function LocationMarker({
  setPosition,
}: {
  setPosition: React.Dispatch<React.SetStateAction<[number, number]>>;
}) {
  const map = typeof window !== "undefined" ? useMapEvents?.({}) : null;

  useEffect(() => {
    if (!map) return;
    map.on("click", (e: any) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
    });
  }, [map, setPosition]);

  return null;
}

// Hook to get useMapEvents safely
function useMapEvents(events: any) {
  const { useMapEvents } = require("react-leaflet");
  return useMapEvents(events);
}

interface FormData {
  fullName: string;
  nationalId: string;
  phone: string;
  email: string;
  farmAddress: string;
  gpsLat: string;
  gpsLong: string;
  farmSize: string;
  mainCrops: string;
  saccoMembership: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  fullName?: string;
  nationalId?: string;
  phone?: string;
  email?: string;
  farmAddress?: string;
  gps?: string;
  saccoMembership?: string;
  password?: string;
  confirmPassword?: string;
}

const steps = ["Personal Info", "Farm Details", "Account Setup"];

export default function RegisterPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    nationalId: "",
    phone: "",
    email: "",
    farmAddress: "",
    gpsLat: "",
    gpsLong: "",
    farmSize: "",
    mainCrops: "",
    saccoMembership: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [position, setPosition] = useState<[number, number]>([0.0236, 37.9062]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [txHash, setTxHash] = useState<string>("");

  const handleCloseSnack = () => setSnackOpen(false);

  const handleGetLocation = () => {
    if (typeof navigator === "undefined") return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const lat = latitude.toFixed(6);
        const lng = longitude.toFixed(6);
        setFormData((prev) => ({
          ...prev,
          gpsLat: lat,
          gpsLong: lng,
        }));
        setPosition([latitude, longitude]);
        setMapError(null);
      },
      () => setMapError("Unable to retrieve your location."),
      { timeout: 10000 }
    );
  };

  const handleGeocodeAddress = async () => {
    if (!formData.farmAddress.trim()) {
      setMapError("Please enter a farm address first.");
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.farmAddress
        )}&limit=1`
      );
      const data = await res.json();
      if (data?.[0]) {
        const lat = parseFloat(data[0].lat).toFixed(6);
        const lon = parseFloat(data[0].lon).toFixed(6);
        setFormData((prev) => ({ ...prev, gpsLat: lat, gpsLong: lon }));
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setMapError(null);
      } else {
        setMapError("Address not found. Try being more specific.");
      }
    } catch (err) {
      setMapError("Failed to search address. Check internet connection.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear related errors
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Errors = {};

    if (step === 0) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.nationalId.trim()) newErrors.nationalId = "National ID is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
    }

    if (step === 1) {
      if (!formData.farmAddress.trim()) newErrors.farmAddress = "Farm address is required";
      if (!formData.gpsLat || !formData.gpsLong) newErrors.gps = "Please set GPS location";
    }

    if (step === 2) {
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("API URL not configured");

      const res = await fetch(`${apiUrl}/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          nationalId: formData.nationalId,
          phone: formData.phone,
          email: formData.email,
          farmAddress: formData.farmAddress,
          gpsLat: formData.gpsLat,
          gpsLong: formData.gpsLong,
          farmSize: formData.farmSize,
          mainCrops: formData.mainCrops,
          saccoMembership: formData.saccoMembership,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || data.detail || "Registration failed");
        return;
      }

      setTxHash(data.tx_hash || "Success (no hash returned)");
      setSnackOpen(true);

      // Reset form
      setFormData({
        fullName: "", nationalId: "", phone: "", email: "", farmAddress: "",
        gpsLat: "", gpsLong: "", farmSize: "", mainCrops: "", saccoMembership: "",
        password: "", confirmPassword: "",
      });
      setActiveStep(0);
      setPosition([0.0236, 37.9062]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Network error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setMapLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", background: "#ffffff", color: "#1a3c34", borderTop: "4px double #1a3c34", borderBottom: "4px double #1a3c34", position: "relative" }}>
      <TopNavBar />

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography sx={{ fontFamily: '"Georgia", serif', fontSize: { xs: "2.3rem", md: "3.2rem" }, fontWeight: 800, letterSpacing: "-0.05em", color: "#1a3c34", mb: 1 }}>
            FARMER REGISTRATION
          </Typography>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#2f855a", letterSpacing: "2.2px", textTransform: "uppercase" }}>
            FairTrace Authority • 2025
          </Typography>
        </Box>

        <Box sx={{ background: "#ffffff", border: "4px double #1a3c34", p: { xs: 4, md: 5 }, boxShadow: "0 16px 50px rgba(26, 60, 52, 0.16)", position: "relative", maxWidth: 680, mx: "auto" }}>
          <Box sx={{ position: "absolute", top: -18, right: 18, width: 72, height: 72, border: "5px double #1a3c34", borderRadius: "50%", bgcolor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "0.52rem", fontWeight: 800, color: "#1a3c34", boxShadow: "0 8px 24px rgba(26, 60, 52, 0.22)", zIndex: 10 }}>
            <Stamp style={{ fontSize: 24 }} />
            OFFICIAL<br />FORM
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      color: activeStep >= steps.indexOf(label) ? "#2f855a" : "#ccc",
                      "&.Mui-active": { color: "#2f855a" },
                      "&.Mui-completed": { color: "#2f855a" },
                    },
                  }}
                  sx={{ "& .MuiStepLabel-label": { color: "#1a3c34", fontWeight: 600, fontSize: "0.95rem" } }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Step 0 */}
            {activeStep === 0 && (
              <Box sx={{ display: "grid", gap: 3 }}>
                <TextField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required error={!!errors.fullName} helperText={errors.fullName} fullWidth InputProps={{ sx: { background: "#f8faf9" } }} InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }} />
                <TextField label="National ID" name="nationalId" value={formData.nationalId} onChange={handleChange} required error={!!errors.nationalId} helperText={errors.nationalId} fullWidth InputProps={{ sx: { background: "#f8faf9" } }} InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }} />
                <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required error={!!errors.phone} helperText={errors.phone} fullWidth InputProps={{ sx: { background: "#f8faf9" } }} InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }} />
                <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required error={!!errors.email} helperText={errors.email} fullWidth InputProps={{ sx: { background: "#f8faf9" } }} InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }} />
              </Box>
            )}

            {/* Step 1 - Farm Details */}
            {activeStep === 1 && (
              <Box sx={{ display: "grid", gap: 3 }}>
                <TextField label="Farm Address" name="farmAddress" value={formData.farmAddress} onChange={handleChange} required error={!!errors.farmAddress} helperText={errors.farmAddress} fullWidth InputProps={{ sx: { background: "#f8faf9" } }} InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }} />

                <Box sx={{ height: 340, border: "3px double #1a3c34", overflow: "hidden", borderRadius: 0, position: "relative", boxShadow: "0 8px 24px rgba(26,60,52,0.12)" }}>
                  {mapLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <CircularProgress size={36} sx={{ color: "#2f855a" }} />
                    </Box>
                  ) : typeof window !== "undefined" && L ? (
                    <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker setPosition={setPosition} />
                      {formData.gpsLat && formData.gpsLong && (
                        <Marker position={[parseFloat(formData.gpsLat), parseFloat(formData.gpsLong)]} icon={customIcon!} />
                      )}
                    </MapContainer>
                  ) : (
                    <Box sx={{ p: 4, textAlign: "center", color: "#c62828" }}>Map could not be loaded.</Box>
                  )}
                </Box>

                {mapError && <Alert severity="error" sx={{ mb: 1 }}>{mapError}</Alert>}

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button variant="outlined" startIcon={<MapPin size={18} />} onClick={handleGetLocation} sx={{ flex: 1, border: "2px solid #2f855a", color: "#2f855a", fontWeight: 600, py: 1.5 }}>
                    Use Current Location
                  </Button>
                  <Button variant="outlined" onClick={handleGeocodeAddress} sx={{ flex: 1, border: "2px solid #2f855a", color: "#2f855a", fontWeight: 600, py: 1.5 }}>
                    Search Address
                  </Button>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <TextField label="GPS Latitude" name="gpsLat" value={formData.gpsLat} onChange={handleChange} sx={{ flex: 1 }} error={!!errors.gps} helperText={errors.gps || "Click map or use buttons above"} InputProps={{ sx: { background: "#f8faf9" } }} />
                  <TextField label="GPS Longitude" name="gpsLong" value={formData.gpsLong} onChange={handleChange} sx={{ flex: 1 }} error={!!errors.gps} InputProps={{ sx: { background: "#f8faf9" } }} />
                </Box>

                <TextField label="Farm Size (acres)" name="farmSize" type="number" value={formData.farmSize} onChange={handleChange} fullWidth InputProps={{ sx: { background: "#f8faf9" } }} />
                <TextField label="Main Crops / Livestock" name="mainCrops" value={formData.mainCrops} onChange={handleChange} fullWidth InputProps={{ sx: { background: "#f8faf9" } }} />
                <TextField label="SACCO Membership (if any)" name="saccoMembership" value={formData.saccoMembership} onChange={handleChange} fullWidth InputProps={{ sx: { background: "#f8faf9" } }} />
              </Box>
            )}

            {/* Step 2 */}
            {activeStep === 2 && (
              <Box sx={{ display: "grid", gap: 3 }}>
                <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required error={!!errors.password} helperText={errors.password} fullWidth InputProps={{ sx: { background: "#f8faf9" } }} />
                <TextField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required error={!!errors.confirmPassword} helperText={errors.confirmPassword} fullWidth InputProps={{ sx: { background: "#f8faf9" } }} />
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, gap: 1.5 }}>
              <Button disabled={activeStep === 0} variant="outlined" startIcon={<ArrowBack />} onClick={handleBack} sx={{ border: "2px solid #1a3c34", color: "#1a3c34", fontWeight: 700, py: 1.8, flex: 1 }}>
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button type="submit" variant="contained" disabled={submitting} sx={{ background: "linear-gradient(45deg, #1a3c34 0%, #2f855a 100%)", color: "#fff", fontWeight: 800, fontFamily: '"Georgia", serif', py: 1.8, flex: 2, boxShadow: "0 10px 30px rgba(26,60,52,0.28)" }}>
                  {submitting ? <CircularProgress size={26} color="inherit" /> : "Complete Registration"}
                </Button>
              ) : (
                <Button variant="contained" endIcon={<ArrowForward />} onClick={handleNext} sx={{ background: "#2f855a", color: "#fff", fontWeight: 700, py: 1.8, flex: 1 }}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Container>

      <Footer />

      <Snackbar open={snackOpen} autoHideDuration={15000} onClose={handleCloseSnack} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success" onClose={handleCloseSnack} sx={{ background: "#1e6b4a", color: "#fff", fontWeight: 600, "& .MuiAlert-icon": { color: "#a8e6cf" } }}>
          <strong>Registration Successful!</strong><br />
          Your farmer profile is now secured on the blockchain.<br />
          Transaction Hash: <Box component="span" sx={{ fontFamily: "monospace", fontSize: "0.8rem", wordBreak: "break-all" }}>{txHash}</Box>
        </Alert>
      </Snackbar>
    </Box>
  );
}