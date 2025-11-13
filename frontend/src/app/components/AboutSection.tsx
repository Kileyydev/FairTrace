"use client";

import React from "react";
import { Box, Container, Typography, Divider } from "@mui/material";
import { Eye, ShieldCheck, Sprout, Stamp, FileCheck } from "lucide-react";

const complianceItems = [
  {
    title: "End-to-End Transparency",
    
    description: "Full visibility from origin to consumer with immutable zero-knowledge proofs.",
    icon: <Eye size={38} />,
    seal: "VERIFIED",
  },
  {
    title: "Tamper-Proof Security",
    
    description: "Ethereum mainnet anchoring with 256-bit cryptographic guarantees.",
    icon: <ShieldCheck size={38} />,
    seal: "SECURED",
  },
  {
    title: "Fair Trade Empowerment",
    
    description: "Direct farmer payments and community upliftment via smart contract escrow.",
    icon: <Sprout size={38} />,
    seal: "EMPOWERED",
  },
];

export default function AboutSection() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 12 },
        background: "#ffffff",
        color: "#1a3c34",
        borderTop: "4px double #1a3c34",
        borderBottom: "4px double #1a3c34",
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Georgia", "Times New Roman", serif',
              fontSize: { xs: "2.3rem", md: "3.2rem" },
              fontWeight: 800,
              letterSpacing: "-0.05em",
              color: "#1a3c34",
              mb: 1.5,
            }}
          >
            FAIRTRACE COMPLIANCE FRAMEWORK
          </Typography>

          <Divider
            sx={{
              width: 180,
              mx: "auto",
              borderBottomWidth: 3,
              borderColor: "#1a3c34",
            }}
          />
        </Box>

        {/* Compliance Cards - ONE ROW (Horizontal on md+) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 2 }, // Tight spacing between cards
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {complianceItems.map((item, index) => (
            <Box
              key={index}
              sx={{
                flex: { md: 1 },
                minWidth: 0,
                p: { xs: 4, md: 4.5 },
                background: "#ffffff",
                border: "3px double #1a3c34",
                position: "relative",
                boxShadow: "0 14px 45px rgba(26, 60, 52, 0.14)", // Stronger shadow
                transition: "none",
              }}
            >
              {/* Official Seal */}
              <Box
                sx={{
                  position: "absolute",
                  top: -16,
                  right: 16,
                  width: 62,
                  height: 62,
                  border: "5px double #1a3c34",
                  borderRadius: "50%",
                  bgcolor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.5rem",
                  fontWeight: 800,
                  color: "#1a3c34",
                  boxShadow: "0 6px 20px rgba(26, 60, 52, 0.2)",
                  zIndex: 10,
                }}
              >
                <Stamp size={20} strokeWidth={3} />
                {item.seal}
              </Box>


              {/* Icon + Title */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2.5 }}>
                <Box
                  sx={{
                    p: 2.5,
                    background: "linear-gradient(135deg, #f5f9f6 0%, #e8f5e9 100%)",
                    border: "3px double #1a3c34",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    width: 76,
                    height: 76,
                  }}
                >
                  <Box sx={{ color: "#1a3c34" }}>{item.icon}</Box>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Georgia", serif',
                    fontSize: { xs: "1.35rem", md: "1.5rem" },
                    fontWeight: 800,
                    color: "#1a3c34",
                    lineHeight: 1.2,
                    flex: 1,
                  }}
                >
                  {item.title}
                </Typography>
              </Box>

              {/* Description */}
              <Typography
                sx={{
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  color: "#1a3c34",
                  opacity: 0.92,
                  pl: { xs: 0, md: 11.5 }, // Align with icon text
                }}
              >
                {item.description}
              </Typography>

              {/* Certified Badge */}
              <Box sx={{ mt: 3.5, textAlign: "right" }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#2f855a",
                    border: "2px solid #2f855a",
                    px: 1.8,
                    py: 0.5,
                    borderRadius: "6px",
                  }}
                >
                  <FileCheck size={17} strokeWidth={2.5} />
                  CERTIFIED
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}