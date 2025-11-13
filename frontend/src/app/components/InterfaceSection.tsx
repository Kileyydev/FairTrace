"use client";

import React from "react";
import { Box, Container, Typography, Divider } from "@mui/material";
import { Package, Lock, Layout, Stamp, FileCheck, Shield } from "lucide-react";

export default function InterfaceSection() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 12 },
        background: "#f8faf9",
        color: "#1a3c34",
        borderTop: "4px double #1a3c34",
        borderBottom: "4px double #1a3c34",
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
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
            FAIRTRACE VERIFICATION PORTAL
          </Typography>
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#2f855a",
              letterSpacing: "2.2px",
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            User Interface Specification
          </Typography>
          <Divider
            sx={{
              width: 300,
              mx: "auto",
              borderBottomWidth: 3,
              borderColor: "#1a3c34",
            }}
          />
        </Box>

        {/* Main Content: Panel + Image (One Row, Aligned Height) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 5, md: 3 },
            alignItems: "stretch",
          }}
        >
          {/* Left: Specification Panel */}
          <Box
            sx={{
              flex: { md: 1.3 },
              background: "#ffffff",
              border: "4px double #1a3c34",
              p: { xs: 4.5, md: 5.5 },
              boxShadow: "0 16px 50px rgba(26, 60, 52, 0.16)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top-Right Seal */}
            <Box
              sx={{
                position: "absolute",
                top: -18,
                right: 18,
                width: 72,
                height: 72,
                border: "5px double #1a3c34",
                borderRadius: "50%",
                bgcolor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.52rem",
                fontWeight: 800,
                color: "#1a3c34",
                boxShadow: "0 8px 24px rgba(26, 60, 52, 0.22)",
                zIndex: 10,
              }}
            >
              <Stamp size={24} strokeWidth={3} />
              CLASSIFIED<br />PUBLIC
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Georgia", serif',
                fontSize: { xs: "1.75rem", md: "2.1rem" },
                fontWeight: 800,
                color: "#1a3c34",
                mb: 3,
                lineHeight: 1.15,
              }}
            >
              FairTrace Platform Interface
            </Typography>

            <Typography
              sx={{
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "#1a3c34",
                opacity: 0.92,
                mb: 4.5,
              }}
            >
              Official blockchain verification portal for consumer-side zero-knowledge proof validation and supply chain attestation.
            </Typography>

            {/* Features List */}
            {[
              {
                icon: <Package size={34} />,
                title: "Real-Time Tracking",
                
                desc: "Live synchronization with Ethereum state via The Graph protocol indexing.",
              },
              {
                icon: <Lock size={34} />,
                title: "Secure Verification",
               
                desc: "ZKP circuit validation with Groth16 proof verification in-browser.",
              },
              {
                icon: <Layout size={34} />,
                title: "Intuitive Dashboard",
                
                desc: "Role-based access control with transporter, farmer, and consumer views.",
              },
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2.5,
                  p: 2.5,
                  background: "rgba(248, 250, 249, 0.7)",
                  border: "2px solid #1a3c34",
                  mb: 2.5,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    background: "#ffffff",
                    border: "3px double #1a3c34",
                    borderRadius: "50%",
                    flexShrink: 0,
                    width: 64,
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ color: "#1a3c34" }}>{item.icon}</Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Georgia", serif',
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "#1a3c34",
                      mb: 0.5,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.92rem",
                      lineHeight: 1.55,
                      color: "#1a3c34",
                      opacity: 0.88,
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 6,
                    right: 10,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#2f855a",
                    border: "1.5px solid #2f855a",
                    px: 1.2,
                    py: 0.3,
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <FileCheck size={11} />
                  CERTIFIED
                </Box>
              </Box>
            ))}
          </Box>

          {/* Right: Image (Same Height, Smaller, Framed) */}
          <Box
            sx={{
              flex: { md: 1 },
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Certificate Frame */}
            

            <Box
              sx={{
                width: "100%",
                maxWidth: 480,
                boxShadow: "0 16px 50px rgba(26, 60, 52, 0.2)",
                border: "2px solid #1a3c34",
                overflow: "hidden",
                bgcolor: "#fff",
              }}
            >
              <img
                src="/images/FairTrade.jpg"
                alt="FairTrace Verification Portal — Official Interface"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                  maxHeight: "100%",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}