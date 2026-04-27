'use client';

import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { InputAdornment } from '@mui/material';
import { LuEye, LuEyeClosed } from 'react-icons/lu';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useLoginMutation } from '@/redux toolkit/features/auth/authApi';
import toast from 'react-hot-toast';

const signInSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Please enter your email!'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Please enter your password!'),
});

type Props = {
  textFieldSx: object;
  // onSubmit: (values: { email: string; password: string }) => void | Promise<void>;
  onClose: () => void;
  onForgotPassword?: () => void;
};

export default function SignInForm({ textFieldSx, onClose, onForgotPassword }: Props) {
  const [show, setShow] = useState(false);
  const [login, { isError, isLoading, isSuccess, data, error }] = useLoginMutation();
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: signInSchema,
    onSubmit: async ({ email, password }) => {
      try {
        await login({ email, password }).unwrap();
        onClose();
        toast.success('Login Success');
      } catch (e) {
        toast.error((e as any)?.data?.message || 'Invalid');
      }
    },
  });

  return (
    <Stack component="form" spacing={1} onSubmit={formik.handleSubmit}>
      <TextField name="email" label="Email" type="email" fullWidth placeholder="Enter your email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} error={Boolean(formik.touched.email && formik.errors.email)} helperText={formik.touched.email && formik.errors.email ? formik.errors.email : ''} sx={textFieldSx} className="!mb-3" />

      <TextField
        name="password"
        label="Password"
        type={show ? 'text' : 'password'}
        autoComplete="password"
        fullWidth
        placeholder="Enter your password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(formik.touched.password && formik.errors.password)}
        helperText={formik.touched.password ? formik.errors.password : ''}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="toggle password visibility" onClick={() => setShow((s) => !s)} edge="end" className="!text-text">
                  {show ? <LuEyeClosed /> : <LuEye />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={textFieldSx}
      />

      <Typography variant="body2" className="text-text-muted  text-sm">
        or{' '}
        <button type="button" className="text-primary hover:underline" onClick={onForgotPassword}>
          Forget Password?
        </button>
      </Typography>

      {isError && (
        <Typography variant="body2" className="text-danger text-center mt-2  text-sm">
          {(error as any)?.data?.message || 'Invalid Email or Password'}
        </Typography>
      )}

      <Button type="submit" variant="contained" className="!bg-primary !mt-4 !text-gray-100 hover:!bg-primary-hover">
        {isLoading ? 'Loading...' : 'Sign In'}
      </Button>
    </Stack>
  );
}
