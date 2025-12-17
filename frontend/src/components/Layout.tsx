import { AppBar, Toolbar, Typography, Button, Container, Box, Stack } from '@mui/material';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Updated Navbar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.7)', // Increased opacity for visibility
          backdropFilter: 'blur(15px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)', // Subtle dark border
          top: 0,
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography 
              variant="h5" 
              onClick={() => navigate('/')}
              sx={{ 
                fontWeight: 900, 
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #23a6d5, #23d5ab)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: -1.5
              }}
            >
              TaskFlow
            </Typography>

            <Stack direction="row" spacing={1}>
              {isAuthenticated ? (
                <Button 
                  onClick={() => { logout(); navigate('/login'); }}
                  sx={navButtonStyle}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button onClick={() => navigate('/login')} sx={navButtonStyle}>
                    Login
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')} 
                    variant="contained"
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3,
                      background: 'linear-gradient(45deg, #1a1a1a, #434343)', // Dark aesthetic button
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      '&:hover': { 
                        background: '#000',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ flexGrow: 1, position: 'relative' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}

// Updated Styles
const navButtonStyle = {
  color: '#2d3436', // Dark gray for visibility
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '10px',
  px: 2,
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    color: '#23a6d5' // Changes to blue on hover
  }
};