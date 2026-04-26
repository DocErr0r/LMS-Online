'use client';

import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

type Props = {
  textFieldSx: object;
  onBackToSignIn: () => void;
  onVerify: (otp: string) => void | Promise<void>;
};

export default function OtpValidation({ textFieldSx, onBackToSignIn, onVerify }: Props) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [otpError, setOtpError] = useState(false);
  const [otpShakeNonce, setOtpShakeNonce] = useState(0);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (otpError) setOtpError(false);
    if (value && index < 3) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const otpFieldSx = {
    ...textFieldSx,
    width: 72,
    '& .MuiOutlinedInput-root': {
      ...(textFieldSx as any)['& .MuiOutlinedInput-root'],
      height: 52,
      borderRadius: 2,
      px: 0,
      '& input': {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 600,
        padding: 0,
      },
    },
  } as const;

  return (
    <Box className="flex flex-col gap-2 justify-center py-4">
      <Box
        key={otpShakeNonce}
        className="flex gap-2 justify-center py-4"
        sx={{
          '@keyframes otpShake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '20%': { transform: 'translateX(-8px)' },
            '40%': { transform: 'translateX(8px)' },
            '60%': { transform: 'translateX(-6px)' },
            '80%': { transform: 'translateX(6px)' },
          },
          animation: otpError ? 'otpShake 350ms ease-in-out' : 'none',
        }}
      >
        {otp.map((digit, index) => (
          <TextField
            key={index}
            inputRef={inputRefs[index]}
            variant="outlined"
            value={digit}
            error={otpError}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            slotProps={{ htmlInput: { maxLength: 1, inputMode: 'numeric', pattern: '[0-9]*' } }}
            sx={otpFieldSx}
          />
        ))}
      </Box>

      {otpError && (
        <Typography variant="body2" className="text-red-400 text-center text-sm">
          Wrong code. Please try again.
        </Typography>
      )}

      <Button
        variant="contained"
        className="!bg-primary !text-gray-100 hover:!bg-primary-hover"
        disabled={otp.some((d) => d === '')}
        onClick={async () => {
          const code = otp.join('');
          try {
            await onVerify(code);
          } catch {
            setOtpError(true);
            setOtpShakeNonce((n) => n + 1);
          }
        }}
      >
        Verify Code
      </Button>

      <Typography variant="body2" className="text-text-muted text-center text-sm">
        Back To Sing In?{' '}
        <button type="button" className="text-primary hover:underline" onClick={onBackToSignIn}>
          Sign in
        </button>
      </Typography>
    </Box>
  );
}

