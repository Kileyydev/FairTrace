'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app } from '@/firebaseConfig';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function OnboardingPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth(app);
  const router = useRouter();

  const requestOTP = async () => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });

      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const verifyOTP = async () => {
    try {
      if (!confirmationResult) return;
      await confirmationResult.confirm(otp);
      setIsVerified(true); // Show success icon
      setTimeout(() => {
        setIsLoading(true); // Show loading
        setTimeout(() => {
          router.push('/homepage'); // Redirect
        }, 2000);
      }, 1500);
    } catch (error: any) {
      alert("❌ Invalid OTP. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #0a192f, #0c1f38)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            backgroundColor: '#12284c',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
            textAlign: 'center',
          }}
        >
          {isVerified ? (
            <>
              <Typography variant="h5" sx={{ mt: 2, color: '#c8e6c9' }}>
                Verification Successful!
              </Typography>
              {isLoading && (
                <Box sx={{ mt: 4 }}>
                  <CircularProgress color="inherit" />
                  <Typography variant="body2" sx={{ mt: 1, color: '#cfd8dc' }}>
                    Redirecting to your dashboard...
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Phone Verification
              </Typography>

              <Typography variant="body1" sx={{ mb: 4, color: '#cfd8dc' }}>
                To proceed with FairTrace, enter your phone number. We’ll send you a one-time password (OTP) for verification.
              </Typography>

              <Stack spacing={3}>
                <TextField
                  label="Phone Number (e.g. +2547XXXXXXXX)"
                  variant="outlined"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{
                    input: { color: '#fff' },
                    label: { color: '#90caf9' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#90caf9' },
                      '&:hover fieldset': { borderColor: '#ffffff' },
                    },
                  }}
                />

                {otpSent && (
                  <TextField
                    label="Enter OTP"
                    variant="outlined"
                    fullWidth
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    sx={{
                      input: { color: '#fff' },
                      label: { color: '#90caf9' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#90caf9' },
                        '&:hover fieldset': { borderColor: '#ffffff' },
                      },
                    }}
                  />
                )}

                {!otpSent ? (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={requestOTP}
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#1976d2',
                      '&:hover': { backgroundColor: '#1565c0' },
                    }}
                  >
                    Request OTP
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={verifyOTP}
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#43a047',
                      '&:hover': { backgroundColor: '#388e3c' },
                    }}
                  >
                    Verify OTP
                  </Button>
                )}
              </Stack>
            </>
          )}
        </Paper>
        <div id="recaptcha-container"></div>
      </Container>
    </Box>
  );
}
