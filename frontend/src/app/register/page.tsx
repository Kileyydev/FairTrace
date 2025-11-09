"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapEvents } from "react-leaflet";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";

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

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 4, pb: 2 }}>{children}</Box>}
    </div>
  );
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

  // Success Snackbar
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

      // Success!
      setTxHash(data.tx_hash || "N/A");
      setSnackOpen(true);
      // Optionally reset form
      setFormData({
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
    <Box sx={{ bgcolor: "#f5f7f5", minHeight: "100vh", color: "#333" }}>
      <TopNavBar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Typography
          variant="h4"
          fontWeight="700"
          textAlign="center"
          gutterBottom
          sx={{ color: "#1a3c34" }}
        >
          Farmer Registration – FairTrace
        </Typography>

        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 4, pb: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box component="form" onSubmit={handleSubmit} sx={{ px: { xs: 3, md: 6 }, pb: 4 }}>
            {/* Step 0: Personal Info */}
            <TabPanel value={activeStep} index={0}>
              <TextField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} fullWidth required error={!!errors.fullName} helperText={errors.fullName} sx={{ mb: 3 }} />
              <TextField label="National ID" name="nationalId" value={formData.nationalId} onChange={handleChange} fullWidth required error={!!errors.nationalId} helperText={errors.nationalId} sx={{ mb: 3 }} />
              <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} fullWidth required error={!!errors.phone} helperText={errors.phone} sx={{ mb: 3 }} />
              <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required error={!!errors.email} helperText={errors.email} sx={{ mb: 3 }} />
            </TabPanel>

            {/* Step 1: Farm Details */}
            <TabPanel value={activeStep} index={1}>
              <TextField label="Farm Address" name="farmAddress" value={formData.farmAddress} onChange={handleChange} fullWidth required error={!!errors.farmAddress} helperText={errors.farmAddress} sx={{ mb: 3 }} />

              <Box sx={{ height: 320, borderRadius: 2, overflow: "hidden", mb: 3, border: "1px solid #e0e0e0" }}>
                {mapLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CircularProgress />
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

              {mapError && <Alert severity="error" sx={{ mb: 2 }}>{mapError}</Alert>}

              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Button variant="outlined" color="success" onClick={handleGetLocation}>
                  Use Current Location
                </Button>
                <Button variant="outlined" color="success" onClick={handleGeocodeAddress}>
                  Find From Address
                </Button>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField label="GPS Latitude" name="gpsLat" value={formData.gpsLat} onChange={handleChange} sx={{ flex: 1 }} error={!!errors.gps} helperText={errors.gps || "Click map or use buttons"} />
                <TextField label="GPS Longitude" name="gpsLong" value={formData.gpsLong} onChange={handleChange} sx={{ flex: 1 }} error={!!errors.gps} />
              </Box>

              <TextField label="Farm Size (acres)" name="farmSize" type="number" value={formData.farmSize} onChange={handleChange} fullWidth sx={{ mt: 3, mb: 3 }} />
              <TextField label="Main Crops / Livestock" name="mainCrops" value={formData.mainCrops} onChange={handleChange} fullWidth sx={{ mb: 3 }} />
            </TabPanel>

            {/* Step 2: Account Setup */}
            <TabPanel value={activeStep} index={2}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password}
                sx={{ mb: 3 }}
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                sx={{ mb: 3 }}
              />
            </TabPanel>

            {/* Navigation Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
              <Button disabled={activeStep === 0} variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack}>
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{
                    bgcolor: "#1a3c34",
                    "&:hover": { bgcolor: "#0f241d" },
                  }}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : "Complete Registration"}
                </Button>
              ) : (
                <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext} sx={{ bgcolor: "#2f855a", "&:hover": { bgcolor: "#276749" } }}>
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
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnack}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{ width: "100%", fontSize: "1rem" }}
        >
          <strong>Registration Successful!</strong>
          <br />
          Your data is now on the blockchain.
          <br />
          Transaction Hash:{" "}
          <Box component="span" sx={{ fontFamily: "Monospace", wordBreak: "break-all", fontSize: "0.85rem" }}>
            {txHash || "N/A"}
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
}