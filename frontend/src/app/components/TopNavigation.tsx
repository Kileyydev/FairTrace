'use client';

import { AppBar, Box, Toolbar, Typography, Button, Stack } from '@mui/material';
import Link from 'next/link';

export default function TopNavigation() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(10, 25, 47, 0.6)', // glassy dark blue
        backdropFilter: 'blur(12px)',             // blur effect
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        {/* Left: Brand or Logo */}
        <Box display="flex" alignItems="center">
          <img
            src="/images/logo/fairtrace-icon.png" // 🧠 Replace with your logo path
            alt="FairTrace Logo"
            width={40}
            height={40}
            style={{ marginRight: '10px', borderRadius: '5px' }}
          />
          <Typography
            variant="h6"
            sx={{ color: '#90caf9', fontWeight: 'bold' }}
          >
            FairTrace
          </Typography>
        </Box>

        {/* Right: Navigation Links */}
        <Stack direction="row" spacing={2}>
          <Link href="/trace" passHref>
            <Button sx={{ color: '#fff', fontWeight: '500' }}>Trace Product</Button>
          </Link>

          <Link href="/batch-entry" passHref>
            <Button sx={{ color: '#fff', fontWeight: '500' }}>Batch Entry</Button>
          </Link>

          <Link href="/verify" passHref>
            <Button sx={{ color: '#fff', fontWeight: '500' }}>Verify Actors</Button>
          </Link>

          <Link href="/reports" passHref>
            <Button sx={{ color: '#fff', fontWeight: '500' }}>Reports</Button>
          </Link>

          <Link href="/about" passHref>
            <Button
              sx={{
                color: '#ffffff',
                fontWeight: 'bold',
                border: '1px solid #90caf9',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#1976d2',
                  borderColor: '#1976d2',
                },
              }}
            >
              About
            </Button>
          </Link>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
