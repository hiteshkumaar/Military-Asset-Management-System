import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Divider, Button } from '@mui/material';
import { Dashboard, Inventory, ShoppingCart, SwapHoriz, AssignmentTurnedIn, Output, ExitToApp, Security } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';

const drawerWidth = 260;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
    { text: 'Purchases', icon: <ShoppingCart />, path: '/purchases' },
    { text: 'Transfers', icon: <SwapHoriz />, path: '/transfers' },
    { text: 'Assignments', icon: <AssignmentTurnedIn />, path: '/assignments' },
    { text: 'Expenditures', icon: <Output />, path: '/expenditures' },
  ];

  if (user?.role === 'Admin') {
    menuItems.push({ text: 'Audit Logs', icon: <Security />, path: '/audit-logs' });
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: '#1a1a1a',
          color: 'white'
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          MAMS PORTAL
        </Typography>
      </Box>
      <Divider sx={{ borderColor: '#333' }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">Logged in as:</Typography>
        <Typography variant="body1" fontWeight="bold">{user?.role}</Typography>
      </Box>
      <Divider sx={{ borderColor: '#333' }} />
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
            sx={{
              backgroundColor: location.pathname === item.path ? 'rgba(76, 175, 80, 0.15)' : 'transparent',
              borderRight: location.pathname === item.path ? '4px solid #4caf50' : 'none',
              mb: 1,
              mx: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'gray' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                color: location.pathname === item.path ? 'primary.main' : 'inherit'
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Button 
          fullWidth 
          variant="outlined" 
          color="error" 
          startIcon={<ExitToApp />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
