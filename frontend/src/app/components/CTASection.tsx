"use client";

import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Leaf, Shield, Globe } from "lucide-react";

export default function CTASection() {
  return (
    <Box
      sx={{
        py: 8,
        textAlign: "center",
        background: "linear-gradient(135deg, #1a3c34 0%, #2f855a 100%)",
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
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4e4d9' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 20l10 10-10 10-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <Container maxWidth="xl">
        {/* Tagline */}
        <Typography
          variant="body1"
          sx={{ color: "#d4e4d9", mb: 2, fontWeight: "500", opacity: 0.9 }}
        >
          Empowering Farmers, Securing Supply Chains
        </Typography>

        {/* Main Content Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
            alignItems: "center",
            mb: 3,
          }}
        >
          {/* Placeholder Image */}
          <Box
            sx={{
              width: { xs: "100%", sm: "80%", md: "50%" },
              height: { xs: "200px", md: "300px" },
              background: "#ffffff",
            
              border: "1px solid #d4e4d9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              mx: "auto",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <Typography variant="body1" sx={{ color: "#4a6b5e" }}>
              <img
              src="/images/CTA.jpg"
              alt="FairTrace Web Interface"
              style={{ width: "100%", height: "100%" }}
            />
            </Typography>
          </Box>

          {/* Text and Buttons */}
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography
              variant="h3"
              fontWeight="800"
              gutterBottom
              sx={{
                color: "#ffffff",
                mb: 2,
                letterSpacing: "0.01em",
              }}
            >
              Ready to Build Trust in Your Supply Chain?
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "#d4e4d9", mb: 3, lineHeight: 1.6, maxWidth: "500px" }}
            >
              Join FairTrace and bring transparency, security, and accountability to every transaction.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" }, gap: 1.5 }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.2,
                  fontSize: "1rem",
                  fontWeight: "600",
                  background: "#2f855a",
                  color: "#ffffff",
                 
                  "&:hover": {
                    background: "#276749",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.2,
                  fontSize: "1rem",
                  fontWeight: "600",
                  borderColor: "#d4e4d9",
                  color: "#d4e4d9",
                  
                  "&:hover": {
                    background: "#2f855a",
                    color: "#ffffff",
                    borderColor: "#2f855a",
                  },
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Icon Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(auto-fit, minmax(120px, 1fr))" },
            gap: 2,
            mt: 2,
            justifyContent: "center",
          }}
        >
          {[
            { icon: <Leaf size={32} color="#d4e4d9" />, text: "Sustainable Farming" },
            { icon: <Shield size={32} color="#d4e4d9" />, text: "Secure Blockchain" },
            { icon: <Globe size={32} color="#d4e4d9" />, text: "Global Transparency" },
          ].map(({ icon, text }, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                gap: 1,
                p: 1.5,
             
                background: "#ffffff10",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  background: "#ffffff20",
                },
              }}
            >
              {icon}
              <Typography variant="body2" sx={{ color: "#d4e4d9", fontWeight: "500" }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}