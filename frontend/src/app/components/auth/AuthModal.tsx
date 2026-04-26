'use client';
import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { IoClose } from 'react-icons/io5';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import OtpValidation from './OtpValidation';

export type AuthMode = 'signin' | 'signup' | 'validation';

type Props = {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
};

export default function AuthModal({ open, mode, onClose, onModeChange }: Props) {
  const [contentKey, setContentKey] = useState(0);

  const textFieldSx = {
    '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-text)' },
    '& .MuiOutlinedInput-root': {
      color: 'var(--color-text)',
      backgroundColor: 'var(--color-border)',
      '& fieldset': { borderColor: 'var(--color-border/10)' },
      '&:hover fieldset': { borderColor: 'var(--color-ring)' },
      '&.Mui-focused fieldset': { borderColor: 'var(--color-ring)', borderWidth: 2 },
    },
    '& .MuiFormHelperText-root': {},
  } as const;

  useEffect(() => {
    if (!open) {
      setContentKey((k) => k + 1);
    }
  }, [open]);

  const title = mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Verify your account';
  const subtitle = mode === 'signin' ? 'Log In To Your LearnMax Account!' : mode === 'signup' ? 'Sign Up and Start Learning!' : 'Enter the code we sent you.';

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            className: '!bg-bg !text-text border border-ring shadow-2xl',
          },
        }}
      >
        <DialogTitle className="!pr-12">
          <span className="text-xl font-poppins text-center block font-semibold">{title}</span>
          <IconButton aria-label="close" onClick={onClose} className="!absolute right-2 top-2 !text-inherit hover:!bg-primary-hover">
            <IoClose />
          </IconButton>
          <span className="text-sm font-josefin !text-center block text-text-muted">{subtitle}</span>
        </DialogTitle>

        <DialogContent>
          {/* <Tabs value={tabValue} onChange={(_, v: number) => onModeChange(v === 0 ? 'signin' : 'signup')} variant="fullWidth" className="mb-3">
            <Tab label="Sign In" className="!text-text" />
            <Tab label="Sign Up" className="!text-text" />
            </Tabs>*/}
          <Divider className="!border-ring !mb-4" />

          {mode === 'signin' && <SignInForm key={`signin-${contentKey}`} textFieldSx={textFieldSx} onForgotPassword={() => {}} onClose={() => onClose()} />}

          {mode === 'signup' && <SignUpForm key={`signup-${contentKey}`} textFieldSx={textFieldSx} onClose={() => onClose()} />}

          {mode === 'validation' ? (
            <OtpValidation
              key={`validation-${contentKey}`}
              textFieldSx={textFieldSx}
              onBackToSignIn={() => onModeChange('signin')}
              onVerify={async (code) => {
                const isValid = code === '1234';
                if (!isValid) throw new Error('invalid_otp');
                alert('OTP Verified: ' + code);
              }}
            />
          ) : (
            <>
              <Divider className="!border-ring !my-4" />
              <Stack spacing={0} className="mb-4 !flex-col !gap-2 items-center justify-center">
                <div className="flex w-full flex-row gap-2 sm:flex-col items-center justify-center">
                  <Button variant="outlined" onClick={() => {}} className="sm:!w-full !min-w-auto !p-2 sm:!px-4 sm:!py-2 !rounded-full !border-ring !text-text hover:!bg-primary-hover/40">
                    <FcGoogle className="h-6 w-6 p-0 sm:mr-1.5" />
                    <span className="hidden sm:inline">Continue with Google</span>
                  </Button>
                  <Button variant="outlined" onClick={() => {}} className="sm:!w-full !min-w-auto !p-2 sm:!px-4 sm:!py-2 !rounded-full !border-ring !text-text hover:!bg-primary-hover/40">
                    <FaGithub className="h-6 w-6 sm:mr-2" />
                    <span className="hidden sm:inline">Continue with GitHub</span>
                  </Button>
                </div>
                {mode === 'signin' ? (
                  <Typography variant="body2" className="text-text-muted text-sm">
                    Don’t have an account?{' '}
                    <button type="button" className="text-primary hover:underline" onClick={() => onModeChange('signup')}>
                      Sign up
                    </button>
                  </Typography>
                ) : (
                  <Typography variant="body2" className="text-text-muted text-sm">
                    Already have an account?{' '}
                    <button type="button" className="text-primary hover:underline" onClick={() => onModeChange('signin')}>
                      Sign in
                    </button>
                  </Typography>
                )}
              </Stack>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
