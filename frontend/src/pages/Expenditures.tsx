import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from '../api/axios';

const Expenditures = () => {
  const [expenditures, setExpenditures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenditures = async () => {
      try {
        const response = await axios.get('/expenditures');
        setExpenditures(response.data);
      } catch (error) {
        console.error('Error fetching expenditures', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenditures();
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        Asset Expenditures
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
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenditures.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell>{item.base?.name}</TableCell>
                  <TableCell>{item.equipment?.name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>-{item.quantity}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                </TableRow>
              ))}
              {expenditures.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No expenditures recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Expenditures;
