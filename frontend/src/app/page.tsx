'use client';

import { Box, Button, Typography, Grid, Container } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #0a192f, #0c1f38)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={4}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            flexDirection: {
              xs: 'column-reverse',
              md: 'row',
            },
          }}
        >
          {/* LEFT TEXT CONTENT */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                px: { xs: 2, md: 4 },
                maxWidth: '500px', // ⬅️ Limit text width here
                width: '100%',
              }}
            >
              <Typography
                variant="h2"
                fontWeight="bold"
                sx={{ color: '#ffffff', mb: 2 }}
              >
                FairTrace
              </Typography>

              <Typography
                variant="h5"
                sx={{ color: '#90caf9', mb: 3 }}
              >
                A Blockchain-Powered Platform for Transparent, Reliable, and Sustainable Supply Chains
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: '#cfd8dc', mb: 5 }}
              >
                FairTrace leverages blockchain technology to enhance traceability across supply chains, ensuring fair trade and sustainability practices. Explore its features optimized for secure and ethical sourcing.
              </Typography>

              <Link href="/onboarding" passHref>
                <Button
                  variant="contained"
                  sx={{
                    px: 5,
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  }}
                >
                  Get Started
                </Button>
              </Link>
            </Box>
          </Grid>

          {/* RIGHT IMAGE */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                maxWidth: 500,
                mx: 'auto',
                transform: {
                  xs: 'none',
                  md: 'perspective(1000px) rotateY(-5deg)',
                },
              }}
            >
              <Image
                src="/images/welcomepage/welcome.png"
                alt="FairTrace Welcome"
                width={600}
                height={400}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
