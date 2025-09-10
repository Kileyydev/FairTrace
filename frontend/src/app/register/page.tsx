"use client";

import React, { useState, useEffect } from "react";
import { Box, Container, Typography, TextField, Button, Tabs, Tab, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapEvents, MapContainerProps } from "react-leaflet";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
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

  const validate = () => {
    const newErrors: Errors = {};
    if (!formData.fullName) newErrors.fullName = "Full Name required";
    if (!formData.nationalId) newErrors.nationalId = "National ID required";
    if (!formData.phone) newErrors.phone = "Phone required";
    if (!formData.email) newErrors.email = "Email required";
    if (!formData.farmAddress) newErrors.farmAddress = "Farm Address required";
    if (!formData.gpsLat || !formData.gpsLong) newErrors.gps = "Farm location required";
    if (!formData.password) newErrors.password = "Password required";
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

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      // Success message from backend (already registered on Hardhat)
      alert(`Registration successful! Blockchain tx: ${data.tx_hash}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Unknown error");
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setMapLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Box sx={{ background: "linear-gradient(135deg, #1a3c34 0%, #2f855a 100%)", color: "#fff", minHeight: "100vh" }}>
      <TopNavBar />
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight="600" textAlign="center" gutterBottom>Farmer Registration - FairTrace</Typography>
        <Box sx={{ background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "1px solid #c4d8c9", overflow: "hidden" }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} centered>
            <Tab label="Personal Info" />
            <Tab label="Farm Details" />
            <Tab label="Account Setup" />
          </Tabs>
          <Box component="form" onSubmit={handleSubmit}>
            <TabPanel value={tabValue} index={0}>
              <TextField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} fullWidth required error={!!errors.fullName} helperText={errors.fullName} sx={{ mb: 2 }} />
              <TextField label="National ID" name="nationalId" value={formData.nationalId} onChange={handleChange} fullWidth required error={!!errors.nationalId} helperText={errors.nationalId} sx={{ mb: 2 }} />
              <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} fullWidth required error={!!errors.phone} helperText={errors.phone} sx={{ mb: 2 }} />
              <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth required error={!!errors.email} helperText={errors.email} sx={{ mb: 2 }} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <TextField label="Farm Address" name="farmAddress" value={formData.farmAddress} onChange={handleChange} fullWidth required error={!!errors.farmAddress} helperText={errors.farmAddress} sx={{ mb: 2 }} />
              <Box sx={{ height: "300px", mb: 2 }}>
                {mapLoading ? <CircularProgress /> : (
                  <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker setPosition={setPosition} />
                    {formData.gpsLat && formData.gpsLong && <Marker position={[parseFloat(formData.gpsLat), parseFloat(formData.gpsLong)]} icon={customIcon} />}
                  </MapContainer>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Button variant="outlined" onClick={handleGetLocation}>Use Current Location</Button>
                <Button variant="outlined" onClick={handleGeocodeAddress}>Find From Address</Button>
              </Box>
              <TextField label="GPS Latitude" name="gpsLat" value={formData.gpsLat} onChange={handleChange} sx={{ mb: 2 }} error={!!errors.gps} helperText={errors.gps} />
              <TextField label="GPS Longitude" name="gpsLong" value={formData.gpsLong} onChange={handleChange} sx={{ mb: 2 }} error={!!errors.gps} helperText={errors.gps} />
              <TextField label="Farm Size (acres)" name="farmSize" type="number" value={formData.farmSize} onChange={handleChange} sx={{ mb: 2 }} />
              <TextField label="Main Crops/Livestock" name="mainCrops" value={formData.mainCrops} onChange={handleChange} sx={{ mb: 2 }} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth required error={!!errors.password} helperText={errors.password} sx={{ mb: 2 }} />
              <TextField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} fullWidth required error={!!errors.confirmPassword} helperText={errors.confirmPassword} sx={{ mb: 2 }} />
            </TabPanel>
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <Button type="submit" variant="contained" size="large" sx={{ background: "#2f855a", color: "#fff", "&:hover": { background: "#276749" } }}>Register</Button>
            </Box>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
