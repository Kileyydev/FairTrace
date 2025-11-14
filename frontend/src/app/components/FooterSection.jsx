// components/Footer.tsx  (or wherever you keep it)
"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Divider,
  TextField,
  Button,
  Stack,
  Grid,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  MailOutline,
} from "@mui/icons-material";
import NextLink from "next/link";   // <-- Next.js Link

export default function Footer() {
  // ---- Social media URLs (replace with real ones) ----
  const socialLinks = [
    { icon: <Facebook />, label: "Facebook", href: "https://facebook.com/fairtrace" },
    { icon: <Twitter />, label: "Twitter", href: "https://twitter.com/fairtrace" },
    { icon: <LinkedIn />, label: "LinkedIn", href: "https://linkedin.com/company/fairtrace" },
    { icon: <Instagram />, label: "Instagram", href: "https://instagram.com/fairtrace" },
  ];

  // ---- Internal quick links (adjust paths if your folder structure differs) ----
  const quickLinks = [
    { text: "Home", href: "/" },
    { text: "About", href: "/about" },
    { text: "Features", href: "/features" },
  ];

  // ---- Support / legal links ----
  const supportLinks = [
    { text: "Help Center", href: "/help-center" },
    { text: "Privacy Policy", href: "/privacy" },
    { text: "Terms of Service", href: "/terms" },
  
  ];

  return (
    <Box
      sx={{
        bgcolor: "#0f2a24",
        color: "#d4e4d9",
        py: { xs: 6, md: 3 },
        fontFamily: '"Inter", "Roboto", sans-serif',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand & Tagline */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "#a8d5ba",
                  mb: 1,
                }}
              >
                FairTrace
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.8,
                  lineHeight: 1.6,
                  maxWidth: 280,
                  mx: { xs: "auto", md: 0 },
                }}
              >
                Transparency in Every Harvest — Empowering farmers, building trust.
              </Typography>

              {/* Social Icons */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  mt: 3,
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                {socialLinks.map(({ icon, label, href }) => (
                  <IconButton
                    key={label}
                    aria-label={label}
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#d4e4d9",
                      bgcolor: "rgba(212, 228, 217, 0.1)",
                      backdropFilter: "blur(4px)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "rgba(212, 228, 217, 0.2)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {icon}
                  </IconButton>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: "#a8d5ba" }}
            >
              Quick Links
            </Typography>
            <Stack spacing={1.5}>
              {quickLinks.map(({ text, href }) => (
                <NextLink key={text} href={href} passHref legacyBehavior>
                  <Typography
                    component="a"
                    sx={{
                      color: "#d4e4d9",
                      fontSize: "0.95rem",
                      textDecoration: "none",
                      display: "block",
                      transition: "color 0.3s ease",
                      "&:hover": { color: "#a8d5ba" },
                    }}
                  >
                    {text}
                  </Typography>
                </NextLink>
              ))}
            </Stack>
          </Grid>

          {/* Legal & Support */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: "#a8d5ba" }}
            >
              Support
            </Typography>
            <Stack spacing={1.5}>
              {supportLinks.map(({ text, href }) => (
                <NextLink key={text} href={href} passHref legacyBehavior>
                  <Typography
                    component="a"
                    sx={{
                      color: "#d4e4d9",
                      fontSize: "0.95rem",
                      textDecoration: "none",
                      display: "block",
                      transition: "color 0.3s ease",
                      "&:hover": { color: "#a8d5ba" },
                    }}
                  >
                    {text}
                  </Typography>
                </NextLink>
              ))}
            </Stack>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: "#a8d5ba" }}
            >
              Stay Updated
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Get the latest updates on traceability and sustainable farming.
            </Typography>

            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1,
              }}
            >
              <TextField
                placeholder="Your email"
                variant="outlined"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <MailOutline sx={{ color: "#a8d5ba", mr: 1, fontSize: 18 }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(212, 228, 217, 0.08)",
                    color: "#d4e4d9",
                    "& fieldset": { borderColor: "rgba(212, 228, 217, 0.2)" },
                  },
                  "& input::placeholder": { color: "#a8d5ba", opacity: 0.7 },
                }}
              />
              <Button
                variant="contained"
                type="submit"
                sx={{
                  bgcolor: "#2f855a",
                  color: "#fff",
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(47, 133, 90, 0.3)",
                  "&:hover": {
                    bgcolor: "#276a4a",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(47, 133, 90, 0.4)",
                  },
                  whiteSpace: "nowrap",
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider
          sx={{
            my: 5,
            bgcolor: "rgba(168, 213, 186, 0.3)",
            height: "1px",
          }}
        />

        {/* Copyright */}
        <Typography
          variant="body2"
          align="center"
          sx={{
            color: "#a8d5ba",
            opacity: 0.7,
            fontSize: "0.875rem",
          }}
        >
          © {new Date().getFullYear()} <strong>FairTrace</strong>. All rights
          reserved.
        </Typography>
      </Container>
    </Box>
  );
}