"use client";

import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import Image from "next/image";

const HERO_IMAGE = "/images/hero2.jpg"; // Update if you add more later

export default function HeroSection() {
  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "75vh", md: "90vh" },
        minHeight: "640px",
        overflow: "hidden",
        background: "#0f1e16",
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          "& img": {
            objectFit: "cover",
            objectPosition: "center",
          },
        }}
      >
        <Image
          src={HERO_IMAGE}
          alt="Supply Chain Traceability Platform"
          fill
          priority
          quality={95}
          style={{ filter: "brightness(0.65)" }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.style.background = "#0f1e16";
              parent.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#e0f2e9;font-weight:600;text-align:center;padding:2rem;">
                  <div>
                    <div style="font-size:1.5rem;margin-bottom:0.5rem;">Image Not Found</div>
                    <div style="font-size:0.9rem;opacity:0.7;">${HERO_IMAGE}</div>
                  </div>
                </div>
              `;
            }
          }}
        />
      </Box>

      {/* Dark Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
          zIndex: 1,
        }}
      />

      {/* Content Container */}
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          px: { xs: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            maxWidth: 950,
            mx: "auto",
            py: { xs: 6, md: 8 },
          }}
        >
          {/* Main Headline */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2.8rem", sm: "3.5rem", md: "4.5rem" },
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.05em",
              color: "#ffffff",
              mb: 2.5,
              textShadow: "0 3px 12px rgba(0,0,0,0.5)",
            }}
          >
            Trace Every Step.
            <br />
            <span style={{ color: "#a8e6cf" }}>Trust Every Product.</span>
          </Typography>

          {/* Subheadline */}
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: "1.15rem", md: "1.45rem" },
              fontWeight: 500,
              color: "#e0f7ea",
              mb: 5,
              maxWidth: 780,
              mx: "auto",
              opacity: 0.95,
              lineHeight: 1.6,
            }}
          >
            End-to-end blockchain traceability for agriculture, manufacturing, and luxury goods. 
            Immutable proof from source to shelf.
          </Typography>

          {/* CTA Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2.5,
              justifyContent: "center",
              alignItems: "center",
              mb: 5,
            }}
          >
          </Box>
        </Box>
      </Container>

      {/* Optional: Subtle bottom fade */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "120px",
          background: "linear-gradient(180deg, transparent 0%, #0a0f0d 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}