'use client';
import { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { IoClose } from 'react-icons/io5';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { InputAdornment } from '@mui/material';
import { LuEye, LuEyeClosed } from 'react-icons/lu';

export type AuthMode = 'signin' | 'signup' | 'validation';

type Props = {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
};

const signInSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Please enter your email!'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Please enter your password!'),
});

const signUpSchema = Yup.object({
  name: Yup.string().min(2, 'Name is too short').required('Please enter your name!'),
  email: Yup.string().email('Invalid email').required('Please enter your email!'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Please enter your password!'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password!'),
});

export default function AuthModal({ open, mode, onClose, onModeChange }: Props) {
  const [show, setShow] = useState(false);
  const signInFormik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: signInSchema,
    onSubmit: async (values) => {
      console.log('signin', values);
    },
  });

  const signUpFormik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema: signUpSchema,
    onSubmit: async (values) => {
      onModeChange('validation');
      console.log('signup', values);
    },
  });

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

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [otpError, setOtpError] = useState(false);
  const [otpShakeNonce, setOtpShakeNonce] = useState(0);

  useEffect(() => {
    if (!open) {
      signInFormik.resetForm();
      signUpFormik.resetForm();
      setShow(false);
      setOtp(['', '', '', '']);
      setOtpError(false);
    }
  }, [open]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (otpError) setOtpError(false);
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
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
      ...(textFieldSx['& .MuiOutlinedInput-root'] as object),
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
          <span className="text-xl font-poppins text-center block font-semibold">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</span>
          <IconButton aria-label="close" onClick={onClose} className="!absolute right-2 top-2 !text-inherit hover:!bg-primary-hover">
            <IoClose />
          </IconButton>
          <span className="text-sm font-josefin !text-center block text-text-muted">{mode === 'signin' ? 'Log In To Your LearnMax Account!' : 'Sign Up and Start Learning!'}</span>
        </DialogTitle>

        <DialogContent>
          {/* <Tabs value={tabValue} onChange={(_, v: number) => onModeChange(v === 0 ? 'signin' : 'signup')} variant="fullWidth" className="mb-3">
            <Tab label="Sign In" className="!text-text" />
            <Tab label="Sign Up" className="!text-text" />
            </Tabs>*/}
          <Divider className="!border-ring !mb-4" />

          {mode === 'signin' && (
            <Stack component="form" spacing={1} onSubmit={signInFormik.handleSubmit}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                placeholder="Enter your email"
                value={signInFormik.values.email}
                onChange={signInFormik.handleChange}
                onBlur={signInFormik.handleBlur}
                error={Boolean(signInFormik.touched.email && signInFormik.errors.email)}
                helperText={signInFormik.touched.email && signInFormik.errors.email ? signInFormik.errors.email : ''}
                //  text filed
                sx={textFieldSx}
                className="!mb-3"
              />
              <TextField
                name="password"
                label="Password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                fullWidth
                placeholder="Enter your password"
                value={signInFormik.values.password}
                onChange={signInFormik.handleChange}
                onBlur={signInFormik.handleBlur}
                error={Boolean(signInFormik.touched.password && signInFormik.errors.password)}
                helperText={signInFormik.touched.password ? signInFormik.errors.password : ''}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => {
                            setShow(!show);
                          }}
                          edge="end"
                          className="!text-text"
                        >
                          {show ? <LuEyeClosed /> : <LuEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                //  text filed
                sx={textFieldSx}
              />
              <Typography variant="body2" className="text-text-muted  text-sm">
                or{' '}
                <button type="button" className="text-primary hover:underline">
                  Forget Password?
                </button>
              </Typography>
              <Button type="submit" variant="contained" className="!bg-primary !mt-4 !text-gray-100 hover:!bg-primary-hover">
                Sign In
              </Button>
            </Stack>
          )}
          {mode === 'signup' && (
            <Stack component="form" spacing={2} onSubmit={signUpFormik.handleSubmit}>
              <TextField name="name" variant="outlined" label="Name" autoComplete="name" fullWidth value={signUpFormik.values.name} onChange={signUpFormik.handleChange} onBlur={signUpFormik.handleBlur} error={Boolean(signUpFormik.touched.name && signUpFormik.errors.name)} helperText={signUpFormik.touched.name ? signUpFormik.errors.name : ''} sx={textFieldSx} />
              <TextField name="email" variant="outlined" label="Email" type="email" autoComplete="email" fullWidth value={signUpFormik.values.email} onChange={signUpFormik.handleChange} onBlur={signUpFormik.handleBlur} error={Boolean(signUpFormik.touched.email && signUpFormik.errors.email)} helperText={signUpFormik.touched.email ? signUpFormik.errors.email : ''} sx={textFieldSx} />
              <TextField
                name="password"
                variant="outlined"
                label="Password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                fullWidth
                value={signUpFormik.values.password}
                onChange={signUpFormik.handleChange}
                onBlur={signUpFormik.handleBlur}
                error={Boolean(signUpFormik.touched.password && signUpFormik.errors.password)}
                helperText={signUpFormik.touched.password ? signUpFormik.errors.password : ''}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => {
                            setShow(!show);
                          }}
                          edge="end"
                        >
                          {show ? <LuEyeClosed className="text-text" /> : <LuEye className="text-text" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={textFieldSx}
              />
              <TextField
                name="confirmPassword"
                variant="outlined"
                label="Confirm Password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                fullWidth
                value={signUpFormik.values.confirmPassword}
                onChange={signUpFormik.handleChange}
                onBlur={signUpFormik.handleBlur}
                error={Boolean(signUpFormik.touched.confirmPassword && signUpFormik.errors.confirmPassword)}
                helperText={signUpFormik.touched.confirmPassword ? signUpFormik.errors.confirmPassword : ''}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => {
                            setShow(!show);
                          }}
                          edge="end"
                        >
                          {show ? <LuEyeClosed className="text-text" /> : <LuEye className="text-text" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={textFieldSx}
              />
              <Button type="submit" variant="contained" className="!bg-primary !text-gray-100 hover:!bg-primary-hover">
                Sign Up
              </Button>
              {/* <Divider className="!border-ring !mb-4" /> */}
            </Stack>
          )}
          {mode === 'validation' ? (
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
                  <TextField key={index} inputRef={inputRefs[index]} variant="outlined" value={digit} error={otpError} onChange={(e) => handleChange(e.target.value, index)} onKeyDown={(e) => handleKeyDown(e, index)} slotProps={{ htmlInput: { maxLength: 1, inputMode: 'numeric', pattern: '[0-9]*' } }} sx={otpFieldSx} />
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
                onClick={() => {
                  const isValid = otp.join('') === '1234';
                  if (!isValid) {
                    setOtpError(true);
                    setOtpShakeNonce((n) => n + 1);
                    return;
                  }
                  alert('OTP Verified: ' + otp.join(''));
                }}
              >
                Verify Code
              </Button>
              <Typography variant="body2" className="text-text-muted text-center text-sm">
                Back To Sing In?{' '}
                <button type="button" className="text-primary hover:underline" onClick={() => onModeChange('signin')}>
                  Sign in
                </button>
              </Typography>
            </Box>
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
