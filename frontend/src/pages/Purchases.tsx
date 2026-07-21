import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from '../api/axios';

const Purchases = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get('/purchases');
        setPurchases(response.data);
      } catch (error) {
        console.error('Error fetching purchases', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }} gutterBottom color="primary">
        Procurement & Purchases
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#2e2e2e' }}>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Base</TableCell>
                <TableCell>Equipment</TableCell>
                <TableCell align="right">Quantity Added</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchases.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell>{item.base?.name}</TableCell>
                  <TableCell>{item.equipment?.name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>+{item.quantity}</TableCell>
                  <TableCell>{item.remarks || 'N/A'}</TableCell>
                </TableRow>
              ))}
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No purchases recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Purchases;
