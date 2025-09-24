"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Button,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";
import LockIcon from "@mui/icons-material/Lock";
import QrCodeIcon from "@mui/icons-material/QrCode";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SyncIcon from "@mui/icons-material/Sync";
import FeedbackIcon from "@mui/icons-material/Feedback";
import SecurityIcon from "@mui/icons-material/Security";

const theme = createTheme({
  palette: {
    primary: { main: "#2f855a", contrastText: "#ffffff" },
    secondary: { main: "#1a3c34" },
    background: { default: "#f1f7f3" },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
});

const features = [
  {
    title: "Blockchain Tracking",
    description: "Immutable records ensure every step of the supply chain is transparent and verifiable.",
    icon: <LockIcon sx={{ fontSize: "1.5rem", color: "#2f855a" }} />,
  },
  {
    title: "QR Code Scanning",
    description: "Scan QR codes to instantly view a product’s journey from farm to table.",
    icon: <QrCodeIcon sx={{ fontSize: "1.5rem", color: "#2f855a" }} />,
  },
  {
    title: "Farmer Dashboard",
    description: "Empower farmers with tools to list products, track status, and receive feedback.",
    icon: <DashboardIcon sx={{ fontSize: "1.5rem", color: "#2f855a" }} />,
  },
  {
    title: "Real-Time Updates",
    description: "Track product status and supply chain stages in real time for all stakeholders.",
    icon: <SyncIcon sx={{ fontSize: "1.5rem", color: "#2f855a" }} />,
  },
  {
    title: "Feedback System",
    description: "Direct communication channel for farmers, transporters, and consumers.",
    icon: <FeedbackIcon sx={{ fontSize: "1.5rem", color: "#2f855a" }} />,
  },
  {
    title: "Secure Authentication",
    description: "Safe and reliable access for all users with robust security measures.",
    icon: <SecurityIcon sx={{ fontSize: "1.5rem", color: "#2f855a" }} />,
  },
];

export default function Features() {
  const router = useRouter();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "linear-gradient(145deg, #f1f7f3 0%, #c9e2d3 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <TopNavBar sx={{ zIndex: 1300, position: "fixed", top: 0, width: "100%" }} />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232f855a' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3Cpath d='M30 30l15 15-15 15-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
        <Container
          maxWidth="md"
          sx={{
            flex: 1,
            py: { xs: 3, md: 4 },
            px: { xs: 2, md: 3 },
            mt: { xs: "56px", md: "64px" },
            minHeight: "calc(100vh - 56px - 80px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Typography
              variant="h4"
              fontWeight="800"
              sx={{
                color: "#1e3a2f",
                mb: 2,
                fontSize: { xs: "1.6rem", md: "2rem" },
                background: "linear-gradient(90deg, #1e3a2f 0%, #2f855a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
              }}
            >
              FairTrace Features
            </Typography>
            <Typography
              sx={{ color: "#4a6b5e", fontSize: "0.9rem", mb: 2, textAlign: "center" }}
            >
              Discover the tools that make FairTrace the leading platform for transparent agricultural supply chains.
            </Typography>
            <Grid container spacing={2}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                  >
                    <Card
                      sx={{
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        background: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid #c4d8c9",
                        p: 1.5,
                        mb: 2,
                      }}
                    >
                      <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Box sx={{ mb: 0.5 }}>{feature.icon}</Box>
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          sx={{
                            color: "#1e3a2f",
                            mb: 0.5,
                            fontSize: { xs: "1.2rem", md: "1.4rem" },
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  onClick={() => router.push("/dashboard")}
                  sx={{
                    background: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
                    color: "#ffffff",
                    borderRadius: 2,
                    fontWeight: "600",
                    textTransform: "none",
                    fontSize: "0.9rem",
                    px: 3,
                    "&:hover": {
                      background: "linear-gradient(45deg, #276749 0%, #388e3c 100%)",
                    },
                  }}
                >
                  Explore FairTrace
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
        <Footer sx={{ position: "relative", zIndex: 1300, mt: "auto" }} />
      </Box>
    </ThemeProvider>
  );
}
