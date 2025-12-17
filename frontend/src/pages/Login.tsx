import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Typography, Box, Container } from '@mui/material';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
      navigate('/');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        '@keyframes gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box
            sx={{
              backdropFilter: 'blur(16px) saturate(180%)',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              borderRadius: '24px',
              border: '1px solid rgba(209, 213, 219, 0.3)',
              p: 5,
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            }}
          >
            <Typography 
              variant="h4" 
              fontWeight="800" 
              textAlign="center" 
              mb={1} 
              sx={{ color: '#1a1a1a', letterSpacing: -1 }}
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="body2" 
              textAlign="center" 
              mb={4} 
              sx={{ color: '#666' }}
            >
              Please enter your details to sign in.
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                {...register('username')}
                label="Username"
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!errors.username}
                helperText={errors.username?.message}
                sx={inputStyles}
              />
              <TextField
                {...register('password')}
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={inputStyles}
              />
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    mt: 4,
                    py: 1.5,
                    borderRadius: '12px',
                    background: 'linear-gradient(45deg, #23a6d5 30%, #23d5ab 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                  }}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </motion.div>
            </form>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

// Custom styles for a cleaner input look
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
    '&.Mui-focused fieldset': { borderColor: '#23a6d5' },
  },
};