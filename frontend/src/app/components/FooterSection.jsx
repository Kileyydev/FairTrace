"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Link,
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

export default function Footer() {
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
                sx={{ opacity: 0.8, lineHeight: 1.6, maxWidth: 280, mx: { xs: "auto", md: 0 } }}
              >
                Transparency in Every Harvest — Empowering farmers, building trust.
              </Typography>

              {/* Social Icons */}
              <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: { xs: "center", md: "flex-start" } }}>
                {[
                  { icon: <Facebook />, label: "Facebook", href: "#" },
                  { icon: <Twitter />, label: "Twitter", href: "#" },
                  { icon: <LinkedIn />, label: "LinkedIn", href: "#" },
                  { icon: <Instagram />, label: "Instagram", href: "#" },
                ].map(({ icon, label, href }) => (
                  <IconButton
                    key={label}
                    aria-label={label}
                    component="a"
                    href={href}
                    target="_blank"
                    sx={{
                      color: "#d4e4d9",
                      bgcolor: "rgba(212, 228, 217, 0.1)",
                      backdropFilter: "blur(4px)",
                      transition: "all 0.3s ease",
                     
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
              {["Home", "About", "Features", "Contact", "Blog"].map((text) => (
                <Link
                  key={text}
                  href={`#${text.toLowerCase()}`}
                  underline="none"
                  sx={{
                    color: "#d4e4d9",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    display: "block",
                    
                  }}
                >
                  {text}
                </Link>
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
              {["Help Center", "Privacy Policy", "Terms of Service", "FAQs"].map((text) => (
                <Link
                  key={text}
                  href="#"
                  underline="none"
                  sx={{
                    color: "#d4e4d9",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    display: "block",
                   
                  }}
                >
                  {text}
                </Link>
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

            <Box component="form" sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
              <TextField
                placeholder="Your email"
                variant="outlined"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <MailOutline sx={{ color: "#a8d5ba", mr: 1, fontSize: 18 }} />,
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
            bgcolor: "linear-gradient(90deg, transparent, #a8d5ba, transparent)",
            height: "1px",
            opacity: 0.3,
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
          © {new Date().getFullYear()} <strong>FairTrace</strong>. All rights reserved.
          
        </Typography>
      </Container>
    </Box>
  );
}