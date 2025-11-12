"use client";

import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Eye, ShieldCheck, Sprout } from "lucide-react";

const features = [
  {
    title: "End-to-End Transparency",
    description:
      "Track every product's journey from farm to table with immutable blockchain records.",
    icon: <Eye size={48} />,
  },
  {
    title: "Unmatched Security",
    description:
      "Blockchain-backed verification ensures every transaction is secure and tamper-proof.",
    icon: <ShieldCheck size={48} />,
  },
  {
    title: "Empowered Communities",
    description:
      "Enabling fair trade practices and improving livelihoods for farmers globally.",
    icon: <Sprout size={48} />,
  },
];

const panelVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export default function AboutSection() {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 5 },
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0f2b22 0%, #1e4d3a 50%, #2f855a 100%)",
        color: "#e0f2e9",
      }}
    >
      {/* Subtle SVG Pattern Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "70%",
          opacity: 0.08,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4e4d9' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 3, md: 4 },
            alignItems: "stretch",
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={panelVariants}
              style={{ height: "100%" }}
            >
              <Box
                sx={{
                  height: "100%",
                  p: { xs: 3.5, md: 4.5 },
                  background: "rgba(30, 58, 47, 0.68)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(224, 242, 233, 0.18)",
                  borderRadius: 0,
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  position: "relative",
                  overflow: "hidden",
                  
                }}
              >
                {/* Glow Effect Behind Icon */}
                <Box
                  className="icon-glow"
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(47, 133, 90, 0.2) 0%, transparent 70%)",
                    opacity: 0.5,
                    transition: "all 0.4s ease",
                    pointerEvents: "none",
                  }}
                />

                {/* Icon */}
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      background: "rgba(47, 133, 90, 0.15)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Box sx={{ color: "#2f855a" }}>{feature.icon}</Box>
                  </Box>
                </Box>

                {/* Text */}
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{
                    color: "#ffffff",
                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                    letterSpacing: "-0.3px",
                    lineHeight: 1.3,
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: "#c8e6d3",
                    fontSize: { xs: "0.95rem", md: "1rem" },
                    lineHeight: 1.7,
                    opacity: 0.95,
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}