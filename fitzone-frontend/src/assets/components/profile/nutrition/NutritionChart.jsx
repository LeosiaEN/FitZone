import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2'; // Bar yerine Line import ettik
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  Paper,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement, // PointElement'i ekledik
  LineElement, // LineElement'i ekledik
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { nutritionApi } from '../../../../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend); // PointElement ve LineElement'i register ettik

function NutritionChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  const processNutritionData = (mealsData) => {
    const dailyTotals = {};
    mealsData.forEach((meal) => {
      const mealDate = new Date(meal.date).toISOString().split('T')[0];
      if (!dailyTotals[mealDate]) {
        dailyTotals[mealDate] = { protein: 0, fat: 0, carbs: 0 };
      }
      meal.entries.forEach((entry) => {
        if (entry.foodItem && entry.amountInGrams) {
          const amount = parseFloat(entry.amountInGrams);
          const proteinPer100g = parseFloat(entry.foodItem.protein || 0);
          const fatPer100g = parseFloat(entry.foodItem.fat || 0);
          const carbsPer100g = parseFloat(entry.foodItem.carbs || 0);
          dailyTotals[mealDate].protein += (proteinPer100g / 100) * amount;
          dailyTotals[mealDate].fat += (fatPer100g / 100) * amount;
          dailyTotals[mealDate].carbs += (carbsPer100g / 100) * amount;
        }
      });
    });
    Object.values(dailyTotals).forEach((totals) => {
      totals.protein = Math.round(totals.protein);
      totals.fat = Math.round(totals.fat);
      totals.carbs = Math.round(totals.carbs);
    });
    return dailyTotals;
  };

  const formatDataForChart = (dailyTotals) => {
    const sortedDates = Object.keys(dailyTotals).sort((a, b) => new Date(b) - new Date(a));
    const recentDates = sortedDates.slice(0, 7).reverse();
    const labels = recentDates.map((date) => {
      const d = new Date(date);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    });
    const proteinData = recentDates.map((date) => dailyTotals[date]?.protein || 0);
    const fatData = recentDates.map((date) => dailyTotals[date]?.fat || 0);
    const carbsData = recentDates.map((date) => dailyTotals[date]?.carbs || 0);
    return {
      labels: labels,
      datasets: [
        {
          label: 'Protein (g)',
          data: proteinData,
          borderColor: 'rgba(54, 162, 235, 1)', // Neon mavi
          backgroundColor: 'transparent',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          tension: 0.3, // Eğriyi yumuşatır
        },
        {
          label: 'Yağ (g)',
          data: fatData,
          borderColor: 'rgba(255, 206, 86, 1)', // Neon sarı
          backgroundColor: 'transparent',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgba(255, 206, 86, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          tension: 0.3,
        },
        {
          label: 'Karbonhidrat (g)',
          data: carbsData,
          borderColor: 'rgba(255, 99, 132, 1)', // Neon kırmızı
          backgroundColor: 'transparent',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          tension: 0.3,
        },
      ],
    };
  };

  useEffect(() => {
    const fetchAndSetChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await nutritionApi(`api/nutrition/`);
        const mealsData = response.data;
        console.log('Çekilen veri:', mealsData);
        if (!mealsData || mealsData.length === 0) {
          setError('Grafik için yeterli veri bulunamadı.');
        } else {
          const dailyTotals = processNutritionData(mealsData);
          console.log('İşlenmiş veri (dailyTotals):', dailyTotals);
          const formattedData = formatDataForChart(dailyTotals);
          console.log('Grafik için formatlanmış veri:', formattedData);
          if (formattedData.labels.length === 0) {
            setError('İşlenecek uygun veri bulunamadı.');
          } else {
            setChartData(formattedData);
          }
        }
      } catch (err) {
        console.error('Veri çekme hatası:', err);
        setError(`Veri çekilemedi: ${err.message}. Lütfen API endpoint'inizi ve axios yapılandırmanızı kontrol edin.`);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetChartData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: 'transparent', // Arka plan transparan
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Miktar (gram)',
          color: '#fff', // Beyaz yazı
          font: {
            size: 14,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0)', // Açık renk grid çizgileri
        },
        ticks: {
          color: '#eee', // Açık renk etiketler
          font: {
            size: 12,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Tarih',
          color: '#fff', // Beyaz yazı
          font: {
            size: 14,
          },
        },
        grid: {
          color: 'rgb(255, 255, 255)', // Açık renk grid çizgileri
        },
        ticks: {
          color: '#eee', // Açık renk etiketler
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false,
        titleFont: {
          size: 14,
          color: '#000',
        },
        bodyFont: {
          size: 12,
          color: '#000',
        },
        backgroundColor: 'rgb(255, 255, 255)', // Açık tooltip arka planı
        titleColor: '#000',
        bodyColor: '#000',
      },
      legend: {
        position: 'top',
        labels: {
          color: '#fff', // Beyaz legend yazısı
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Makro Besin Dağılımı',
        color: '#fff', // Beyaz başlık yazısı
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

        background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))',
        borderRadius:5,

        padding: (theme) => theme.spacing(2),
      }}
    >
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 600, maxHeight: 400, padding: (theme) => theme.spacing(3),margin:5, backgroundColor: 'transparent' }}>
        <Typography variant="h6" component="h6" align="center" mb={2} color="#fff" sx={{ fontWeight: 600, display: 'none', }}> 
          
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
            <CircularProgress color="inherit" />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : chartData ? (
          <Line data={chartData} options={chartOptions} ref={chartRef} />
        ) : null}
      </Paper>
    </Box>
  );
}

export default NutritionChart;