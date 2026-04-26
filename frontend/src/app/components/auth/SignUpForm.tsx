'use client';

import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { InputAdornment } from '@mui/material';
import { LuEye, LuEyeClosed } from 'react-icons/lu';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '@/redux toolkit/features/auth/authApi';

const signUpSchema = Yup.object({
  name: Yup.string().min(2, 'Name is too short').required('Please enter your name!'),
  email: Yup.string().email('Invalid email').required('Please enter your email!'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Please enter your password!'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password!'),
});

type Props = {
  textFieldSx: object;
  // onSubmit: (values: { name: string; email: string; password: string; confirmPassword: string }) => void | Promise<void>;
  onClose: () => void;
};

export default function SignUpForm({ textFieldSx, onClose }: Props) {
  const [show, setShow] = useState(false);

  const [register, { isError, isLoading, isSuccess, data, error }] = useRegisterMutation();

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema: signUpSchema,
    onSubmit: async ({ name, email, password, confirmPassword }) => {
      try {
        await register({ name, email, password }).unwrap();
        onClose();
        toast.success('Register Success');
      } catch (e) {
        toast.error((error as any)?.data?.message ||'somthing wrong...');
      }
    },
  });

  return (
    <Stack component="form" spacing={2} onSubmit={formik.handleSubmit}>
      <TextField name="name" variant="outlined" label="Name" autoComplete="name" fullWidth value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} error={Boolean(formik.touched.name && formik.errors.name)} helperText={formik.touched.name ? formik.errors.name : ''} sx={textFieldSx} />

      <TextField name="email" variant="outlined" label="Email" type="email" autoComplete="email" fullWidth value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} error={Boolean(formik.touched.email && formik.errors.email)} helperText={formik.touched.email ? formik.errors.email : ''} sx={textFieldSx} />

      <TextField
        name="password"
        variant="outlined"
        label="Password"
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        fullWidth
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(formik.touched.password && formik.errors.password)}
        helperText={formik.touched.password ? formik.errors.password : ''}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="toggle password visibility" onClick={() => setShow((s) => !s)} edge="end">
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
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword ? formik.errors.confirmPassword : ''}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="toggle password visibility" onClick={() => setShow((s) => !s)} edge="end">
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
    </Stack>
  );
}
