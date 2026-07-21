import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from '../api/axios';

const Assignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get('/assignments');
        setAssignments(response.data);
      } catch (error) {
        console.error('Error fetching assignments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        Personnel Assignments
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#2e2e2e' }}>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Personnel Name</TableCell>
                <TableCell>Rank</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Equipment</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell>{item.personnelName}</TableCell>
                  <TableCell>{item.rank}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.equipment?.name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>-{item.quantity}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
              {assignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No assignments recorded.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Assignments;
