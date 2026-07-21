import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from '../api/axios';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const chartData = [
    { name: 'Purchases', amount: data?.breakdown?.purchases || 0 },
    { name: 'Transfers In', amount: data?.breakdown?.transfersIn || 0 },
    { name: 'Transfers Out', amount: data?.breakdown?.transfersOut || 0 },
    { name: 'Assignments', amount: data?.breakdown?.assignments || 0 },
    { name: 'Expenditures', amount: data?.breakdown?.expenditures || 0 },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Tactical Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Opening Balance</Typography>
              <Typography variant="h3" color="primary">{data?.openingBalance || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Closing Balance</Typography>
              <Typography variant="h3" color="secondary">{data?.closingBalance || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Net Movement</Typography>
              <Typography variant="h3" color={data?.netMovement >= 0 ? 'success.main' : 'error.main'}>
                {data?.netMovement > 0 ? '+' : ''}{data?.netMovement || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 3, height: 400 }}>
        <Typography variant="h6" gutterBottom>Asset Movement Breakdown</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }} />
            <Bar dataKey="amount" fill="#4caf50" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;
