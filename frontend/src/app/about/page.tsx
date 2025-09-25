
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
import Tilt from "react-parallax-tilt";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "../components/FooterSection";
import FlagIcon from "@mui/icons-material/Flag";
import StarIcon from "@mui/icons-material/Star";
import PeopleIcon from "@mui/icons-material/People";
import VisionIcon from "@mui/icons-material/Visibility";
import HistoryIcon from "@mui/icons-material/History";
import ImpactIcon from "@mui/icons-material/BarChart";

const theme = createTheme({
  palette: {
    primary: { main: "#2f855a", contrastText: "#ffffff" },
    secondary: { main: "#1a3a2f" },
    background: { default: "#f1f7f3" },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h3: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    body1: { fontWeight: 400 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
       
          background: "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(241, 247, 243, 0.95))",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(196, 216, 201, 0.5)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
            border: "1px solid transparent",
            borderImage: "linear-gradient(45deg, #1e3a2f, #2f855a) 1",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,

          "&:hover": {
            boxShadow: "0 4px 16px rgba(47, 133, 90, 0.4)",
          },
        },
      },
    },
  },
});

const cards = [
  {
    title: "Our Mission",
    icon: <FlagIcon sx={{ fontSize: "2.5rem", color: "#2f855a" }} />,
    summary: "Transforming agriculture with blockchain transparency.",
    details:
      "FairTrace is committed to revolutionizing supply chains using blockchain, ensuring transparency from farm to table. We empower farmers with fair pricing, optimize logistics, and build consumer trust in food origins.",
  },
  {
    title: "Our Vision",
    icon: <VisionIcon sx={{ fontSize: "2.5rem", color: "#2f855a" }} />,
    summary: "Setting a global standard for sustainable agriculture.",
    details:
      "We aim to create a world where every agricultural product is traceable and equitably priced, establishing FairTrace as a global leader in supply chain transparency and sustainability.",
  },
  {
    title: "Our Story",
    icon: <HistoryIcon sx={{ fontSize: "2.5rem", color: "#2f855a" }} />,
    summary: "FairTrace’s journey to transparency.",
    details: [
      { year: "2020", event: "Founded to bring transparency to agriculture." },
      { year: "2021", event: "Launched blockchain tracking platform." },
      { year: "2023", event: "Partnered with 1,000+ farmers in 10 countries." },
      { year: "2025", event: "Introduced QR code tracking for consumers." },
    ],
  },
  {
    title: "Our Impact",
    icon: <ImpactIcon sx={{ fontSize: "2.5rem", color: "#2f855a" }} />,
    summary: "Transforming lives and supply chains.",
    details: [
      "10,000+ farmers supported with fair pricing.",
      "50,000+ products tracked via blockchain.",
      "30% reduction in supply chain inefficiencies.",
      "1M+ consumers using QR codes to verify origins.",
    ],
  },
  {
    title: "Key Features",
    icon: <StarIcon sx={{ fontSize: "2.5rem", color: "#2f855a" }} />,
    summary: "Tools for a transparent supply chain.",
    details: [
      "Blockchain Tracking: Immutable product records.",
      "QR Code Integration: Trace journeys with a scan.",
      "Farmer Tools: Direct listings and feedback.",
      "Real-Time Updates: Instant status tracking.",
      "Secure Authentication: Safe stakeholder access.",
    ],
  },
  {
    title: "Benefits for All",
    icon: <PeopleIcon sx={{ fontSize: "2.5rem", color: "#2f855a" }} />,
    summary: "Empowering every supply chain role.",
    details: [
      { role: "Farmers", text: "Secure fair prices and connect with buyers." },
      { role: "Transporters", text: "Optimize logistics with real-time data." },
      { role: "Consumers", text: "Trust food authenticity with QR scans." },
    ],
  },
];

export default function About() {
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
            height: "400px",
            background: "linear-gradient(180deg, rgba(30, 58, 47, 0.8) 0%, rgba(47, 133, 90, 0.6) 100%)",
            opacity: 0.2,
            transform: "translateY(-20%)",
            transition: "transform 0.5s ease",
          }}
          component={motion.div}
          animate={{ y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%232f855a' fill-opacity='0.5' d='M0,160L48,144C96,128,192,96,288,80C384,64,480,64,576,96C672,128,768,192,864,208C960,224,1056,192,1152,160C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </Box>
        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            py: { xs: 4, md: 6 },
            px: { xs: 2, md: 4 },
            mt: { xs: "56px", md: "64px" },
            minHeight: "calc(100vh - 56px - 80px)",
            position: "relative",
            zIndex: 1200,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Box sx={{ textAlign: "center", mb: 5 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2.5rem", md: "3.2rem" },
                  background: "linear-gradient(90deg, #1e3a2f 0%, #2f855a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                About FairTrace
              </Typography>
              <Typography
                sx={{ color: "#4a6b5e", fontSize: "1.1rem", mt: 1, maxWidth: "700px", mx: "auto" }}
              >
                Building a transparent, sustainable future for agriculture with blockchain-powered trust.
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/contact")}
                  sx={{
                    mt: 2,
                    borderColor: "#2f855a",
                    color: "#2f855a",
                    fontSize: "0.95rem",
                    "&:hover": {
                      background: "rgba(47, 133, 90, 0.1)",
                      borderColor: "#276749",
                    },
                  }}
                >
                  Get in Touch
                </Button>
              </motion.div>
            </Box>
<Grid container spacing={3}>
  {cards.map((card, index) => (
    <Grid item xs={12} sm={6} md={4} key={index}> {/* wider on medium screens */}
      <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2, ease: "easeOut" }}
        >
          <motion.div
            initial={{ rotateY: 0 }}
            whileHover={{ rotateY: 180 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ perspective: "1000px" }}
          >
            <Card
              sx={{
                minHeight: "400px",
                minWidth: "300px", // prevents X-axis from shrinking
                width: "100%",    // fill the grid cell
                display: "flex",
                flexDirection: "column",
                transformStyle: "preserve-3d",
              }}
            >
             <CardContent
  sx={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    transform: "translateZ(1px)", // optional for tilt effect
  }}
>
  {card.icon}
  <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
    {card.title}
  </Typography>
  <Typography sx={{ mt: 1, color: "#4a6b5e" }}>{card.summary}</Typography>

  {Array.isArray(card.details) ? (
    <Box sx={{ mt: 1, textAlign: "left" }}>
      {card.details.map((item: any, i: number) =>
        typeof item === "string" ? (
          <Typography key={i} sx={{ fontSize: "0.85rem" }}>
            • {item}
          </Typography>
        ) : item.year ? (
          <Typography key={i} sx={{ fontSize: "0.85rem" }}>
            {item.year}: {item.event}
          </Typography>
        ) : (
          <Typography key={i} sx={{ fontSize: "0.85rem" }}>
            {item.role}: {item.text}
          </Typography>
        )
      )}
    </Box>
  ) : (
    <Typography sx={{ mt: 1, fontSize: "0.85rem" }}>{card.details}</Typography>
  )}
</CardContent>

            </Card>
          </motion.div>
        </motion.div>
      </Tilt>
    </Grid>
  ))}
</Grid>


            <Box sx={{ textAlign: "center", mt: 5 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  onClick={() => router.push("/dashboard")}
                  sx={{
                    background: "linear-gradient(45deg, #2f855a 0%, #4caf50 100%)",
                    color: "#ffffff",
                    fontSize: "1rem",
                    px: 5,
                    py: 1.5,
                    "&:hover": {
                      background: "linear-gradient(45deg, #276749 0%, #388e3c 100%)",
                      boxShadow: "0 6px 20px rgba(47, 133, 90, 0.4)",
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
