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
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapEvents } from "react-leaflet";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";
import { Stamp, MapPin } from "lucide-react";

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

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

function LocationMarker({ setPosition }: { setPosition: React.Dispatch<React.SetStateAction<[number, number]>> }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setFormData({ ...formData, gpsLat: latitude.toFixed(6), gpsLong: longitude.toFixed(6) });
          setPosition([latitude, longitude]);
          setMapError(null);
        },
        () => setMapError("Unable to fetch location.")
      );
    } else setMapError("Geolocation not supported.");
  };

  const handleGeocodeAddress = async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.farmAddress)}`);
      const data = await res.json();
      if (data[0]) {
        setFormData({ ...formData, gpsLat: data[0].lat, gpsLong: data[0].lon });
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setMapError(null);
      } else setMapError("Address not found.");
    } catch {
      setMapError("Error fetching address.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Errors = {};
    if (step === 0) {
      if (!formData.fullName) newErrors.fullName = "Full Name required";
      if (!formData.nationalId) newErrors.nationalId = "National ID required";
      if (!formData.phone) newErrors.phone = "Phone required";
      if (!formData.email) newErrors.email = "Email required";
    }
    if (step === 1) {
      if (!formData.farmAddress) newErrors.farmAddress = "Farm Address required";
      if (!formData.gpsLat || !formData.gpsLong) newErrors.gps = "Farm location required";
    }
    if (step === 2) {
      if (!formData.password) newErrors.password = "Password required";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      setTxHash(data.tx_hash || "N/A");
      setSnackOpen(true);
      setFormData({
        fullName: "", nationalId: "", phone: "", email: "", farmAddress: "",
        gpsLat: "", gpsLong: "", farmSize: "", mainCrops: "", saccoMembership: "",
        password: "", confirmPassword: "",
      });
      setActiveStep(0);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setMapLoading(false), 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#1a3c34",
        borderTop: "4px double #1a3c34",
        borderBottom: "4px double #1a3c34",
        position: "relative",
      }}
    >
      <TopNavBar />

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            sx={{
              fontFamily: '"Georgia", serif',
              fontSize: { xs: "2.3rem", md: "3.2rem" },
              fontWeight: 800,
              letterSpacing: "-0.05em",
              color: "#1a3c34",
              mb: 1,
            }}
          >
            FARMER REGISTRATION
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
            FairTrace Authority •  2025
          </Typography>
        </Box>

        {/* Registration Form — Certificate Style */}
        <Box
          sx={{
            background: "#ffffff",
            border: "4px double #1a3c34",
            p: { xs: 4, md: 5 },
            boxShadow: "0 16px 50px rgba(26, 60, 52, 0.16)",
            position: "relative",
            maxWidth: 680,
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* Step 0: Personal Info */}
            {activeStep === 0 && (
              <Box sx={{ display: "grid", gap: 3 }}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  fullWidth
                  InputProps={{
                    sx: { background: "#f8faf9" },
                  }}
                  InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                />
                <TextField
                  label="National ID"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  required
                  error={!!errors.nationalId}
                  helperText={errors.nationalId}
                  fullWidth
                  InputProps={{ sx: { background: "#f8faf9" } }}
                  InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  error={!!errors.phone}
                  helperText={errors.phone}
                  fullWidth
                  InputProps={{ sx: { background: "#f8faf9" } }}
                  InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                  InputProps={{ sx: { background: "#f8faf9" } }}
                  InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                />
              </Box>
            )}

            {/* Step 1: Farm Details */}
            {activeStep === 1 && (
              <Box sx={{ display: "grid", gap: 3 }}>
                <TextField
                  label="Farm Address"
                  name="farmAddress"
                  value={formData.farmAddress}
                  onChange={handleChange}
                  required
                  error={!!errors.farmAddress}
                  helperText={errors.farmAddress}
                  fullWidth
                  InputProps={{ sx: { background: "#f8faf9" } }}
                  InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                />

                {/* Map — Same Height as Form */}
                <Box
                  sx={{
                    height: 340,
                    border: "3px double #1a3c34",
                    borderRadius: 0,
                    overflow: "hidden",
                    mb: 2,
                    position: "relative",
                    boxShadow: "0 8px 24px rgba(26,60,52,0.12)",
                  }}
                >
                  {mapLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                      <CircularProgress size={36} sx={{ color: "#2f855a" }} />
                    </Box>
                  ) : (
                    <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker setPosition={setPosition} />
                      {formData.gpsLat && formData.gpsLong && (
                        <Marker position={[parseFloat(formData.gpsLat), parseFloat(formData.gpsLong)]} icon={customIcon} />
                      )}
                    </MapContainer>
                  )}
                </Box>

                {mapError && (
                  <Alert severity="error" sx={{ mb: 1, fontSize: "0.9rem" }}>
                    {mapError}
                  </Alert>
                )}

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    startIcon={<MapPin size={18} />}
                    onClick={handleGetLocation}
                    sx={{
                      flex: 1,
                      border: "2px solid #2f855a",
                      color: "#2f855a",
                      fontWeight: 600,
                      py: 1.5,
                    }}
                  >
                    Use Current
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleGeocodeAddress}
                    sx={{
                      flex: 1,
                      border: "2px solid #2f855a",
                      color: "#2f855a",
                      fontWeight: 600,
                      py: 1.5,
                    }}
                  >
                    Find Address
                  </Button>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <TextField
                    label="GPS Latitude"
                    name="gpsLat"
                    value={formData.gpsLat}
                    onChange={handleChange}
                    sx={{ flex: 1 }}
                    error={!!errors.gps}
                    helperText={errors.gps || "Click map or use buttons"}
                    InputProps={{ sx: { background: "#f8faf9" } }}
                  />
                  <TextField
                    label="GPS Longitude"
                    name="gpsLong"
                    value={formData.gpsLong}
                    onChange={handleChange}
                    sx={{ flex: 1 }}
                    error={!!errors.gps}
                    InputProps={{ sx: { background: "#f8faf9" } }}
                  />
                </Box>

                <TextField
                  label="Farm Size (acres)"
                  name="farmSize"
                  type="number"
                  value={formData.farmSize}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ sx: { background: "#f8faf9" } }}
                  InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                />
                <TextField
                  label="Main Crops / Livestock"
                  name="mainCrops"
                  value={formData.mainCrops}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ sx: { background: "#f8faf9" } }}
                  InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                />
              </Box>
            )}

            {/* Step 2: Account Setup */}
            {activeStep === 2 && (
              <Box sx={{ display: "grid", gap: 3 }}>
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
                  InputProps={{ sx: { background: "#f8faf9" } }}
                  InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                />
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  fullWidth
                  InputProps={{ sx: { background: "#f8faf9" } }}
                  InputLabelProps={{ style: { color: "#1a3c34", fontWeight: 600 } }}
                />
              </Box>
            )}

            {/* Navigation */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, gap: 1.5 }}>
              <Button
                disabled={activeStep === 0}
                variant="outlined"
                startIcon={<ArrowBack fontSize="small" />}
                onClick={handleBack}
                sx={{
                  border: "2px solid #1a3c34",
                  color: "#1a3c34",
                  fontWeight: 700,
                  py: 1.8,
                  flex: 1,
                }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{
                    background: "linear-gradient(45deg, #1a3c34 0%, #2f855a 100%)",
                    color: "#fff",
                    fontWeight: 800,
                    fontFamily: '"Georgia", serif',
                    py: 1.8,
                    flex: 2,
                    boxShadow: "0 10px 30px rgba(26,60,52,0.28)",
                  }}
                >
                  {submitting ? <CircularProgress size={26} color="inherit" /> : "Complete Registration"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<ArrowForward fontSize="small" />}
                  onClick={handleNext}
                  sx={{
                    background: "#2f855a",
                    color: "#fff",
                    fontWeight: 700,
                    py: 1.8,
                    flex: 1,
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Container>

      <Footer />

      {/* Success Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={12000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          action={
            <IconButton size="small" color="inherit" onClick={handleCloseSnack}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{
            background: "#1e6b4a",
            color: "#fff",
            fontWeight: 600,
            "& .MuiAlert-icon": { color: "#a8e6cf" },
            width: "100%",
            fontSize: "0.95rem",
          }}
        >
          <strong>Registration Successful!</strong>
          <br />
          Your data is now on the blockchain.
          <br />
          Transaction Hash:{" "}
          <Box component="span" sx={{ fontFamily: "monospace", wordBreak: "break-all", fontSize: "0.82rem" }}>
            {txHash || "N/A"}
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
}