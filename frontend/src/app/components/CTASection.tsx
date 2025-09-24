"use client";

import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Leaf, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion"; // Added for animations

export default function CTASection() {
  // Animation variants for smooth transitions
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const hoverEffect = {
    scale: 1.05,
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.3 },
  };

  return (
    <Box
      sx={{
        py: { xs: 10, md: 12 },
        textAlign: "center",
        background: "linear-gradient(135deg, #1e3a2f 0%, #3b7551 100%)",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3Cpath d='M30 30l15 15-15 15-15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <Container maxWidth="xl">
        {/* Tagline */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <Typography
            variant="body1"
            sx={{
              color: "#e0f2e9",
              mb: 3,
              fontWeight: "600",
              fontSize: { xs: "1.1rem", md: "1.25rem" },
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Empowering Farmers, Securing Supply Chains
          </Typography>
        </motion.div>

        {/* Main Content Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 3, md: 5 },
            alignItems: "center",
            mb: 5,
          }}
        >
          {/* Image Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            whileHover={hoverEffect}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: "80%", md: "90%" },
                height: { xs: "250px", md: "350px" },
                overflow: "hidden",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                mx: "auto",
                position: "relative",
                "&:hover img": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <img
                src="/images/blockchain.webp"
                alt="FairTrace Web Interface"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.4s ease",
                }}
              />
            </Box>
          </motion.div>

          {/* Text and Buttons */}
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Typography
                variant="h2"
                fontWeight="800"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                Build Trust in Your Supply Chain
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#e0f2e9",
                  mb: 4,
                  lineHeight: 1.7,
                  maxWidth: "600px",
                  fontSize: { xs: "1rem", md: "1.2rem" },
                }}
              >
                Join FairTrace to unlock transparency, security, and accountability in every transaction with cutting-edge blockchain technology.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "center", md: "flex-start" },
                  gap: 2,
                }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      px: 5,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      background: "linear-gradient(90deg, #2f855a 0%, #4caf50 100%)",
                      color: "#ffffff",
                      textTransform: "none",
                      "&:hover": {
                        background: "linear-gradient(90deg, #276749 0%, #388e3c 100%)",
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 5,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      borderColor: "#e0f2e9",
                      color: "#e0f2e9",
                      textTransform: "none",
                      "&:hover": {
                        background: "#e0f2e9",
                        color: "#1e3a2f",
                        borderColor: "#e0f2e9",
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Box>
        </Box>

        {/* Icon Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(auto-fit, minmax(140px, 1fr))",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
            justifyContent: "center",
          }}
        >
          {[
            { icon: <Leaf size={36} color="#e0f2e9" />, text: "Sustainable Farming" },
            { icon: <Shield size={36} color="#e0f2e9" />, text: "Secure Blockchain" },
            { icon: <Globe size={36} color="#e0f2e9" />, text: "Global Transparency" },
          ].map(({ icon, text }, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              whileHover={hoverEffect}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  gap: 1.5,
                  p: 3,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {icon}
                <Typography
                  variant="body2"
                  sx={{
                    color: "#e0f2e9",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  {text}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}