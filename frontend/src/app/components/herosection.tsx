"use client";

import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import dynamic from "next/dynamic";

// Dynamically import react-slick to prevent SSR issues
const Slider = dynamic(() => import("react-slick"), { ssr: false });

// Slick settings
const settings = {
  dots: true,
  infinite: true,
  speed: 1000,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  fade: true,
  arrows: false,
};

const images: string[] = [
  "/images/tear53.webp",
  "/images/trace2.jpg",
  "/images/trace3.jpg",
];

export default function HeroSection() {
  return (
    <Box sx={{ position: "relative", height: "80vh", overflow: "hidden" }}>
      <Slider {...settings}>
        {images.map((img, index) => (
          <Box
            key={index}
            sx={{
              height: "80vh",
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.85)",
            }}
          />
        ))}
      </Slider>

      {/* Overlay Content */}
      <Container
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#fff",
          px: 3,
          zIndex: 2,
        }}
      >
        <Typography
          variant="h2"
          fontWeight="bold"
          gutterBottom
          sx={{ textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)" }}
        >
          Blockchain-Powered Traceability
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ textShadow: "1px 1px 6px rgba(0, 0, 0, 0.6)" }}
        >
          Ensure transparency, authenticity, and accountability across your supply chain.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            mt: 3,
            backgroundColor: "#00c853",
            "&:hover": { backgroundColor: "#00b342" },
            px: 4,
          }}
        >
          Get Started
        </Button>
      </Container>
    </Box>
  );
}
