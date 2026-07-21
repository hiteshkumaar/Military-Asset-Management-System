import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from '../api/axios';

const Transfers = () => {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await axios.get('/transfers');
        setTransfers(response.data);
      } catch (error) {
        console.error('Error fetching transfers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransfers();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }} gutterBottom color="primary">
        Asset Transfers
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#2e2e2e' }}>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>From Base</TableCell>
                <TableCell>To Base</TableCell>
                <TableCell>Equipment</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transfers.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: 'error.main' }}>{item.fromBase?.name}</TableCell>
                  <TableCell sx={{ color: 'success.main' }}>{item.toBase?.name}</TableCell>
                  <TableCell>{item.equipment?.name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{item.quantity}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
              {transfers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No transfers recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Transfers;
