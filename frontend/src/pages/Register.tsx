import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Typography, Box, Container, Link } from '@mui/material';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data);
      // Using a custom toast would be better here, but sticking to logic for now
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Matching the animated background from the login page
        background: 'linear-gradient(-45deg, #23d5ab, #23a6d5, #e73c7e, #ee7752)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        '@keyframes gradientShift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Box
            sx={{
              backdropFilter: 'blur(20px) saturate(160%)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '32px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              p: { xs: 4, sm: 5 },
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Typography 
              variant="h4" 
              fontWeight="900" 
              textAlign="center" 
              mb={1} 
              sx={{ color: '#121212', letterSpacing: '-0.05em' }}
            >
              Create Account
            </Typography>
            <Typography 
              variant="body2" 
              textAlign="center" 
              mb={4} 
              sx={{ color: '#555' }}
            >
              Join the community and stay productive.
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
              
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    mt: 4,
                    py: 1.8,
                    borderRadius: '16px',
                    background: 'linear-gradient(45deg, #e73c7e 30%, #ee7752 90%)',
                    boxShadow: '0 10px 20px -5px rgba(231, 60, 126, 0.4)',
                    fontSize: '1rem',
                    fontWeight: '800',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #d6336c 30%, #e66444 90%)',
                    }
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Register Now'}
                </Button>
              </motion.div>
            </form>

            <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
              Already have an account?{' '}
              <Link 
                onClick={() => navigate('/login')} 
                sx={{ 
                  cursor: 'pointer', 
                  color: '#e73c7e', 
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transition: '0.3s',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.05)' },
    '&.Mui-focused fieldset': { borderColor: '#e73c7e' },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#e73c7e',
  }
};