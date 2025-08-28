"use client";

import React, { useState, useEffect } from "react";
import { Box, Container, Typography, TextField, Button, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapEvents, MapContainerProps } from "react-leaflet";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";

// Custom Leaflet icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Dynamic Leaflet imports
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false }) as React.ComponentType<MapContainerProps>;
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
  saccoName: string;
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
  const map = useMapEvents({
    click(e: L.LeafletMouseEvent) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RegisterPage() {
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
    saccoName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [position, setPosition] = useState<[number, number]>([0.0236, 37.9062]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setFormData({
            ...formData,
            gpsLat: latitude.toFixed(6),
            gpsLong: longitude.toFixed(6),
          });
          setPosition([latitude, longitude]);
        },
        () => {
          setMapError("Unable to fetch location. Please select manually on the map or enter coordinates.");
        }
      );
    } else {
      setMapError("Geolocation is not supported by your browser.");
    }
  };

  const handleGeocodeAddress = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.farmAddress)}`
      );
      const data = await response.json();
      if (data[0]) {
        setFormData({
          ...formData,
          gpsLat: data[0].lat,
          gpsLong: data[0].lon,
        });
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setMapError(null);
      } else {
        setMapError("Could not find location for this address. Please try the map or manual entry.");
      }
    } catch {
      setMapError("Error fetching address location. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    setFormData({ ...formData, [e.target.name!]: e.target.value });
  };

  const validate = () => {
    const newErrors: Errors = {};
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.nationalId) newErrors.nationalId = "National ID is required";
    if (!formData.phone) newErrors.phone = "Phone Number is required";
    if (!formData.email) newErrors.email = "Email Address is required";
    if (!formData.farmAddress) newErrors.farmAddress = "Farm Address is required";
    if (!formData.gpsLat || !formData.gpsLong) newErrors.gps = "Farm location is required";
    if (!formData.saccoMembership) newErrors.saccoMembership = "SACCO Membership Number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Registration successful!");
    } else {
      const errorData = await res.json();
      alert("Error: " + JSON.stringify(errorData));
    }
  } catch (err) {
    console.error(err);
    alert("Network error - check backend");
  }
};


  useEffect(() => {
    setTimeout(() => setMapLoading(false), 1000);
  }, []);

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
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          fontWeight="600"
          textAlign="center"
          gutterBottom
          sx={{ color: "#ffffff", mb: 4 }}
        >
          Farmer Registration - FairTrace
        </Typography>
        <Box
          sx={{
            background: "#ffffff",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            border: "1px solid #c4d8c9",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            centered
            sx={{
              background: "#f5f5f5",
              "& .MuiTab-root": { color: "#1a3c34", fontWeight: 600 },
              "& .Mui-selected": { color: "#2f855a" },
              "& .MuiTabs-indicator": { backgroundColor: "#2f855a" },
            }}
          >
            <Tab label="Personal Info" />
            <Tab label="Farm Details" />
            <Tab label="SACCO Info" />
            <Tab label="Account Setup" />
          </Tabs>
          <Box component="form" onSubmit={handleSubmit}>
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                <TextField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="National ID Number"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  required
                  error={!!errors.nationalId}
                  helperText={errors.nationalId}
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{ gridColumn: "span 2" }}
                />
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                <TextField
                  label="Farm Address"
                  name="farmAddress"
                  value={formData.farmAddress}
                  onChange={handleChange}
                  required
                  error={!!errors.farmAddress}
                  helperText={errors.farmAddress}
                  sx={{ gridColumn: "span 2" }}
                />
                <Box sx={{ gridColumn: "span 2", height: "300px",  overflow: "hidden", position: "relative" }}>
                  {mapLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", background: "#f5f5f5" }}>
                      <CircularProgress sx={{ color: "#2f855a" }} />
                    </Box>
                  ) : mapError ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", background: "#f5f5f5" }}>
                      <Typography color="error">{mapError}</Typography>
                    </Box>
                  ) : (
                    <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationMarker setPosition={setPosition} />
                      {formData.gpsLat && formData.gpsLong && (
                        <Marker position={[parseFloat(formData.gpsLat), parseFloat(formData.gpsLong)]} icon={customIcon} />
                      )}
                    </MapContainer>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  onClick={handleGetLocation}
                  sx={{
                    gridColumn: "span 1",
                    mb: 2,
                    borderColor: "#2f855a",
                    color: "#2f855a",
                    "&:hover": { background: "#2f855a", color: "#ffffff", borderColor: "#276749" },
                  }}
                >
                  Use My Current Location
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleGeocodeAddress}
                  sx={{
                    gridColumn: "span 1",
                    mb: 2,
                    borderColor: "#2f855a",
                    color: "#2f855a",
                    "&:hover": { background: "#2f855a", color: "#ffffff", borderColor: "#276749" },
                  }}
                >
                  Find Location from Address
                </Button>
                <TextField
                  label="GPS Latitude"
                  name="gpsLat"
                  value={formData.gpsLat}
                  onChange={handleChange}
                  error={!!errors.gps}
                  helperText={errors.gps}
                />
                <TextField
                  label="GPS Longitude"
                  name="gpsLong"
                  value={formData.gpsLong}
                  onChange={handleChange}
                  error={!!errors.gps}
                  helperText={errors.gps}
                />
                <TextField
                  label="Farm Size (acres)"
                  name="farmSize"
                  type="number"
                  value={formData.farmSize}
                  onChange={handleChange}
                />
                <TextField
                  label="Main Crops/Livestock"
                  name="mainCrops"
                  value={formData.mainCrops}
                  onChange={handleChange}
                />
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                <TextField
                  label="SACCO Membership Number"
                  name="saccoMembership"
                  value={formData.saccoMembership}
                  onChange={handleChange}
                  required
                  error={!!errors.saccoMembership}
                  helperText={errors.saccoMembership}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="SACCO Name"
                  name="saccoName"
                  value={formData.saccoName}
                  onChange={handleChange}
                  sx={{ gridColumn: "span 2" }}
                />
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
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
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
              </Box>
            </TabPanel>
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  background: "#bcd0c6ff",
                  color: "#ffffff",
                  
                  "&:hover": { background: "#276749", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" },
                }}
              >
                Register
              </Button>
            </Box>
            <FormHelperText sx={{ textAlign: "center", color: "#4a6b5e", pb: 2 }}>
              Upon registration, your data will be securely stored 
            </FormHelperText>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}