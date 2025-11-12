"use client";

import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import dynamic from "next/dynamic";
import Image from "next/image";

// Prevent SSR flash
const Slider = dynamic(() => import("react-slick"), { ssr: false });

// Slick settings
const settings = {
  dots: true,
  infinite: true,
  speed: 1200,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  fade: true,
  arrows: false,
  pauseOnHover: true,
  cssEase: "cubic-bezier(0.7, 0, 0.3, 1)",
  appendDots: (dots: React.ReactNode[]) => (
    <Box
      sx={{
        position: "absolute",
        bottom: { xs: 16, md: 24 },
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 3,
      }}
    >
      <ul style={{ margin: 0, padding: 0, display: "inline-block" }}>
        {dots}
      </ul>
    </Box>
  ),
  customPaging: () => (
    <Box
      sx={{
        width: 10,
        height: 10,
        mx: 0.5,
        background: "rgba(255, 255, 255, 0.4)",
        borderRadius: "50%",
        display: "inline-block",
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": { background: "rgba(255, 255, 255, 0.7)" },
      }}
    />
  ),
};

const images = [
  "/images/hero2.jpg",
  // Add more if you want: "/images/hero1.jpg", "/images/hero3.jpg"
];

export default function HeroSection() {
  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "70vh", md: "85vh" },
        overflow: "hidden",
      }}
    >
      {/* Carousel Background */}
      <Slider {...settings}>
        {images.map((src, index) => (
          <Box
            key={src}
            sx={{
              position: "relative",
              height: { xs: "70vh", md: "85vh" },
              width: "100%",
            }}
          >
            <Image
              src={src}
              alt={`Supply chain hero ${index + 1}`}
              fill
              priority={index === 0}
              quality={95}
              style={{ objectFit: "cover" }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.style.background = "#1a3a2a";
                  parent.style.display = "flex";
                  parent.style.alignItems = "center";
                  parent.style.justifyContent = "center";
                  parent.style.color = "#e0f2e9";
                  parent.style.fontWeight = "600";
                  parent.innerHTML = `<div style="text-align:center; padding:2rem;">
                    Image not found<br/><small>${src}</small>
                  </div>`;
                }
              }}
            />

            {/* Dark gradient + subtle vignette */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%), linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)",
                zIndex: 1,
              }}
            />
          </Box>
        ))}
      </Slider>

      {/* GLASSMORPHISM TEXTURE OVERLAY + CONTENT */}
      <Container
        maxWidth="lg"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "none",
          "& *": { pointerEvents: "auto" },
        }}
      >
        <Box
          sx={{
            position: "relative",
            background: "rgba(15, 30, 22, 0.58)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid rgba(255, 255, 255, 0.18)",
            borderRadius: "24px",
            p: { xs: 4, md: 7 },
            maxWidth: 900,
            mx: "auto",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "24px",
              padding: "2px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
            },
          }}
        >
          {/* Noise/Grain Texture */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.15,
              background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              mixBlendMode: "overlay",
              pointerEvents: "none",
            }}
          />

          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "4.2rem" },
              fontWeight: 900,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              mb: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #c8f0d8 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 4px 20px rgba(0,0,0,0.4)",
              position: "relative",
              zIndex: 2,
            }}
          >
            Trace Every Step.<br />Trust Every Product.
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: "1.15rem", md: "1.55rem" },
              fontWeight: 600,
              mb: 4,
              opacity: 0.95,
              color: "#e0f7ea",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              position: "relative",
              zIndex: 2,
            }}
          >
            End-to-end blockchain traceability for agriculture, manufacturing & luxury goods.<br />
            Immutable proof from source to shelf.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 2 }}>
            <Button
              variant="contained"
              size="large"
              href="/register"
              sx={{
                px: { xs: 5, md: 6 },
                py: 1.8,
                fontSize: "1.15rem",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "12px",
                background: "linear-gradient(45deg, #2f855a 0%, #66bb6a 100%)",
                boxShadow: "0 8px 25px rgba(47, 133, 90, 0.5)",
                transition: "all 0.4s ease",
                "&:hover": {
                  background: "linear-gradient(45deg, #276749 0%, #4caf50 100%)",
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 30px rgba(47, 133, 90, 0.6)",
                },
              }}
            >
              Start Tracing Free
            </Button>

            <Button
              variant="outlined"
              size="large"
              href="/demo"
              sx={{
                px: { xs: 5, md: 6 },
                py: 1.8,
                fontSize: "1.15rem",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "12px",
                border: "2px solid rgba(255,255,255,0.4)",
                color: "#fff",
                backdropFilter: "blur(10px)",
                transition: "all 0.4s ease",
                "&:hover": {
                  border: "2px solid rgba(255,255,255,0.8)",
                  background: "rgba(255,255,255,0.15)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              Watch Demo
            </Button>
          </Box>

          {/* Trust badges (optional) */}
          <Box sx={{ mt: 6, opacity: 0.8, position: "relative", zIndex: 2 }}>
            <Typography variant="body2" sx={{ color: "#a8e6cf", letterSpacing: "0.5px" }}>
              Powered by Ethereum • Audited by Certik • Used by 50+ global brands
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Custom Slick Dots */}
      <style jsx global>{`
        .slick-dots {
          bottom: 24px !important;
        }
        .slick-dots li {
          margin: 0 6px !important;
        }
        .slick-dots li button:before {
          display: none !important;
        }
        .slick-dots li.slick-active div {
          background: #ffffff !important;
          transform: scale(1.5);
          box-shadow: 0 0 10px rgba(255,255,255,0.6);
        }
      `}</style>
    </Box>
  );
}