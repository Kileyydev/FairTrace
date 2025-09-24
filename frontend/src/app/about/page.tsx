
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
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "../components/FooterSection";

const theme = createTheme({
  palette: {
    primary: { main: "#2f855a", contrastText: "#ffffff" },
    secondary: { main: "#1a3c34" },
    background: { default: "#f1f7f3" },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
});

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
              About FairTrace
            </Typography>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid #c4d8c9",
                mb: 2,
                p: 1.5,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{
                    color: "#1e3a2f",
                    mb: 1,
                    fontSize: { xs: "1.2rem", md: "1.4rem" },
                  }}
                >
                  Our Mission
                </Typography>
                <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem", mb: 1 }}>
                  FairTrace is dedicated to revolutionizing agricultural supply chains by providing transparent, blockchain-based tracking from farm to table. We empower farmers with fair pricing, streamline logistics for transporters, and ensure consumers can trust the origin and quality of their food.
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid #c4d8c9",
                mb: 2,
                p: 1.5,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{
                    color: "#1e3a2f",
                    mb: 1,
                    fontSize: { xs: "1.2rem", md: "1.4rem" },
                  }}
                >
                  Key Features
                </Typography>
                <Box component="ul" sx={{ pl: 2, color: "#4a6b5e", fontSize: "0.9rem" }}>
                  {[
                    "Blockchain Tracking: Immutable records ensure transparency for every product.",
                    "QR Code Integration: Scan to view a product’s journey from farm to market.",
                    "Farmer Empowerment: Direct listing and feedback tools for farmers.",
                    "Real-Time Updates: Track product status and supply chain stages instantly.",
                    "Secure Authentication: Safe access for farmers, transporters, and consumers.",
                  ].map((feature, index) => (
                    <Typography component="li" key={index} sx={{ mb: 0.5 }}>
                      {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid #c4d8c9",
                mb: 2,
                p: 1.5,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{
                    color: "#1e3a2f",
                    mb: 1,
                    fontSize: { xs: "1.2rem", md: "1.4rem" },
                  }}
                >
                  Benefits for All
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box>
                    <Typography sx={{ color: "#2f855a", fontWeight: "600", fontSize: "0.95rem" }}>
                      Farmers
                    </Typography>
                    <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                      List products directly, receive fair pricing, and get real-time feedback from consumers.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#2f855a", fontWeight: "600", fontSize: "0.95rem" }}>
                      Transporters
                    </Typography>
                    <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                      Streamline logistics with clear tracking and status updates for every shipment.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#2f855a", fontWeight: "600", fontSize: "0.95rem" }}>
                      Consumers
                    </Typography>
                    <Typography sx={{ color: "#4a6b5e", fontSize: "0.9rem" }}>
                      Verify the authenticity and origin of your food with confidence.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Box sx={{ textAlign: "center" }}>
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
