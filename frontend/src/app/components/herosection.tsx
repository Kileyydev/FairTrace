"use client";

import React from "react";
import { Box, Typography, Container } from "@mui/material";
import Image from "next/image";

const HERO_IMAGE = "/images/hero2.jpg";

export default function HeroSection() {
  const [imageError, setImageError] = React.useState(false);

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
      {/* Background Image Container */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          "& img": {
            objectFit: "cover",
            objectPosition: "center",
            filter: "brightness(0.65)", // <-- Apply filter here
          },
        }}
      >
        {imageError ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#e0f2e9",
              fontWeight: 600,
              textAlign: "center",
              p: 4,
              background: "#0f1e16",
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Image Not Found
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, fontFamily: "monospace" }}>
                {HERO_IMAGE}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Image
            src={HERO_IMAGE}
            alt="Supply Chain Traceability Platform"
            fill
            priority
            quality={95}
            onError={() => setImageError(true)}
            // No `sx`, no `style` → clean props
          />
        )}
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

      {/* Content */}
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

          {/* CTA Buttons (empty for now) */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2.5,
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        </Box>
      </Container>

      {/* Bottom Fade */}
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