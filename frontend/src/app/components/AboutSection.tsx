"use client";

import React from "react";
import { Box, Container, Card, CardContent, Typography } from "@mui/material";
import { Eye, ShieldCheck, Sprout } from "lucide-react";

const features = [
  {
    title: "End-to-End Transparency",
    description:
      "Track every product's journey from farm to table with immutable blockchain records.",
    icon: <Eye size={42} color="#2f855a" />,
  },
  {
    title: "Unmatched Security",
    description:
      "Blockchain-backed verification ensures every transaction is secure and tamper-proof.",
    icon: <ShieldCheck size={42} color="#2f855a" />,
  },
  {
    title: "Empowered Communities",
    description:
      "Enabling fair trade practices and improving livelihoods for farmers globally.",
    icon: <Sprout size={42} color="#2f855a" />,
  },
];

export default function AboutSection() {
  return (
    <Box
      sx={{
        py: 10,
       
     background: "linear-gradient(135deg, #1a3c34 0%, #2f855a 100%)",
      }}
    >
      <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "200%",
                opacity: 0.1,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4e4d9' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 20l10 10-10 10-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            />
      
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                 background: "#e6f0e9",
                border: "1px solid #c4d8c9",
                textAlign: "center",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                },
                p: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  gutterBottom
                  sx={{ color: "#1a3c34" }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#4a6b5e",
                    fontSize: "1rem",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}