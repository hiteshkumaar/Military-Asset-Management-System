import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from '../api/axios';

const Inventory = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('/inventory');
        setInventory(response.data);
      } catch (error) {
        console.error('Error fetching inventory', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        Asset Inventory
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Real-time tracking of military assets across assigned bases.
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#2e2e2e' }}>
              <TableRow>
                <TableCell>Base</TableCell>
                <TableCell>Equipment Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Opening Balance</TableCell>
                <TableCell align="right">Current Quantity</TableCell>
                <TableCell align="right">Closing Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.base?.name}</TableCell>
                  <TableCell>{item.equipment?.name}</TableCell>
                  <TableCell>{item.equipment?.category?.name}</TableCell>
                  <TableCell align="right">{item.openingBalance}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {item.quantity}
                  </TableCell>
                  <TableCell align="right">{item.closingBalance}</TableCell>
                </TableRow>
              ))}
              {inventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No inventory found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Inventory;
