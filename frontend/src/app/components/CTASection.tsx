"use client";

import React from "react";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { Leaf, Shield, Globe, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  // Animation Variants
  const fadeInUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut", delay },
    },
  });

  const scaleIn = {
    hidden: { scale: 0.85, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 6 },
        background: "linear-gradient(135deg, #0f2a24 0%, #1e3a2f 50%, #2d6a4f 100%)",
        color: "#e0f2e9",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          background: "linear-gradient(90deg, #000000, #c8102e, #006600, #c8102e, #000000)",
          backgroundSize: "200% 100%",
          animation: "kenyaFlag 10s linear infinite",
        },
        "@keyframes kenyaFlag": {
          "0%, 100%": { backgroundPosition: "0% 0" },
          "50%": { backgroundPosition: "100% 0" },
        },
      }}
    >
      {/* Animated Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M0 40h40v40H0zM40 0h40v40H40z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "50px",
          animation: "drift 40s linear infinite",
        }}
      />
      <style jsx>{`
        @keyframes drift {
          from { transform: translateX(0); }
          to { transform: translateX(-50px); }
        }
      `}</style>

      <Container maxWidth="xl">
        {/* Hero Tagline */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp(0.2)}
        >
          <Typography
            variant="body1"
            sx={{
              color: "#a8d5ba",
              textAlign: "center",
              mb: 4,
              fontWeight: 600,
              fontSize: { xs: "1rem", md: "1.25rem" },
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <Sparkles size={20} />
            Empowering Kenyan Farmers • Building Global Trust
            <Sparkles size={20} />
          </Typography>
        </motion.div>

        {/* Main Content - Flex Instead of Grid */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 6, md: 8 },
            alignItems: "center",
            mb: { xs: 10, md: 14 },
          }}
        >
          {/* Image Side */}
          <Box sx={{ flex: { md: 1 }, width: "100%", maxWidth: { md: "560px" } }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <Box
                sx={{
                  position: "relative",
             
                  overflow: "hidden",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
                  bgcolor: "#1a3a2a",

                }}
              >
                <img
                  src="/images/blockchain.webp"
                  alt="FairTrace: Blockchain traceability dashboard for Kenyan farmers"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    transform: "scale(1.02)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(45deg, transparent 30%, rgba(47, 133, 90, 0.25) 70%)",
                    opacity: 0,
                    transition: "opacity 0.5s ease",
                    pointerEvents: "none",
                  }}
                />
                {/* Fallback */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "#1e3a2f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a8d5ba",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    opacity: 0,
                    transition: "opacity 0.4s",
                  }}
                >
                  FairTrace Dashboard
                </Box>
              </Box>
            </motion.div>
          </Box>

          {/* Text & CTA Side */}
          <Box sx={{ flex: { md: 1 }, textAlign: { xs: "center", md: "left" } }}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp(0.4)}
            >

              <Typography
                variant="body1"
                sx={{
                  color: "#d4e4d9",
                  mb: 5,
                  fontSize: { xs: "1.15rem", md: "1.35rem" },
                  lineHeight: 1.8,
                  maxWidth: 620,
                  opacity: 0.95,
                }}
              >
                Join <strong>thousands of Kenyan farmers</strong> using{" "}
                <Box component="span" sx={{ color: "#2f855a", fontWeight: 700 }}>
                  FairTrace
                </Box>{" "}
                to prove origin, ensure fair pay, and access premium global markets — all on blockchain.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                justifyContent={{ xs: "center", md: "flex-start" }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={20} />}
                  href="/register"
                  component={motion.a}
                  
                  whileTap={{ scale: 0.95 }}
                  sx={{
                    px: { xs: 5, md: 6 },
                    py: 2,
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    bgcolor: "#2f855a",
                   
                    boxShadow: "0 8px 30px rgba(47, 133, 90, 0.4)",
                    textTransform: "none",
                    
                  }}
                >
                  Start Trial
                </Button>

              </Stack>
            </motion.div>
          </Box>
        </Box>

        {/* Feature Cards - Flex Wrap */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            justifyContent: "center",
            mt: 8,
          }}
        >
          {[
            {
              icon: <Leaf size={44} />,
              title: "Sustainable Farming",
              desc: "Promote eco-friendly practices with verified data",
            },
            {
              icon: <Shield size={44} />,
              title: "Secure Blockchain",
              desc: "Immutable, tamper-proof transaction records",
            },
            {
              icon: <Globe size={44} />,
              title: "Global Markets",
              desc: "Connect directly with premium buyers worldwide",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp(0.7 + index * 0.15)}
              style={{ flex: "1 1 300px", maxWidth: "380px" }}
            >
              <Box
                sx={{
                  p: 5,
                  textAlign: "center",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(168, 213, 186, 0.25)",
                 
                  height: "100%",
                  transition: "all 0.4s ease",
                  
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    bgcolor: "rgba(47, 133, 90, 0.25)",
                    
                    display: "inline-flex",
                    mb: 2,
                  }}
                >
                  {React.cloneElement(item.icon, { color: "#2f855a" })}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#a8d5ba", fontSize: "1rem", lineHeight: 1.6 }}>
                  {item.desc}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}