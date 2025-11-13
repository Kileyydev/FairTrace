"use client";

import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Leaf, Shield, Globe, ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 12 },
        background: "linear-gradient(135deg, #f8faf9 0%, #e8f5e9 100%)",
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
              fontFamily: '"Georgia", serif',
              fontSize: { xs: "2.3rem", md: "3.2rem" },
              fontWeight: 800,
              letterSpacing: "-0.05em",
              color: "#1a3c34",
              mb: 1.5,
            }}
          >
            Ready to Trace with Confidence?
          </Typography>
          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 600,
              color: "#2f855a",
              maxWidth: 720,
              mx: "auto",
              opacity: 0.95,
              lineHeight: 1.7,
            }}
          >
            Join FairTrace for transparent, secure, and verifiable supply chains.
          </Typography>
        </Box>

        {/* Main CTA Row: Image + Text (Aligned Height) */}
        
          {/* Left: Image (Same Height, Smaller, Framed) */}
          <Box
            sx={{
              flex: { md: 1 },
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            
            <Box
              sx={{
                width: "100%",
                maxWidth: 460,
                boxShadow: "0 16px 50px rgba(26, 60, 52, 0.18)",
                border: "2px solid #1a3c34",
                overflow: "hidden",
                bgcolor: "#fff",
                position: "relative",
              }}
            >
              <img
                src="/images/blockchain.webp"
                alt="FairTrace Dashboard"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  background: "rgba(26,60,52,0.92)",
                  color: "#e0f2e9",
                  px: 2.5,
                  py: 0.8,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  border: "2px solid #2f855a",
                  borderRadius: "4px",
                }}
              >
                Running on Ganache • Dev Mode
              </Box>
            </Box>


          {/* Right: Text + CTA */}
          <Box
            sx={{
              flex: { md: 1.1 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: { xs: "center", md: "left" },
              pl: { md: 2 },
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "1.15rem", md: "1.3rem" },
                lineHeight: 1.75,
                color: "#1a3c34",
                mb: 4,
                maxWidth: 540,
                mx: { xs: "auto", md: 0 },
              }}
            >
              Start tracing your products in minutes. No setup fees. No blockchain complexity.
              <br />
              <strong style={{ color: "#2f855a" }}>Just real transparency.</strong>
            </Typography>

            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={22} />}
              href="/register"
              sx={{
                px: 6,
                py: 2.2,
                fontSize: "1.2rem",
                fontWeight: 800,
                fontFamily: '"Georgia", serif',
                textTransform: "none",
                background: "linear-gradient(45deg, #1a3c34 0%, #2f855a 100%)",
                border: "3px solid #1a3c34",
                borderRadius: "0px",
                boxShadow: "0 10px 30px rgba(26,60,52,0.28)",
                alignSelf: { xs: "center", md: "flex-start" },
                "&:hover": {
                  background: "linear-gradient(45deg, #0f241d 0%, #276749 100%)",
                  boxShadow: "0 12px 35px rgba(26,60,52,0.35)",
                },
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Box>

        {/* Mini Features — One Row, Tight, Shadowed */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 3, sm: 2 },
            justifyContent: "center",
            mt: 6,
          }}
        >
          {[
            { icon: <Leaf size={36} />, text: "Sustainable & Verified" },
            { icon: <Shield size={36} />, text: "Tamper-Proof Records" },
            { icon: <Globe size={36} />, text: "Trusted Worldwide" },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                minWidth: 200,
                p: 3.5,
                background: "#ffffff",
                border: "2px solid #1a3c34",
                boxShadow: "0 10px 30px rgba(26,60,52,0.12)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box sx={{ color: "#2f855a" }}>{item.icon}</Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#1a3c34",
                  fontSize: "1.05rem",
                  textAlign: "center",
                }}
              >
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>

      </Container>
    </Box>
  );
}