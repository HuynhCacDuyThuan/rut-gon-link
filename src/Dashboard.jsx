import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format, startOfWeek, addDays } from 'date-fns'; // Import format, startOfWeek, and addDays from date-fns

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  // State variables to hold data
  
 
  const [dailyStats, setDailyStats] = useState([]);
  const [totalUrls, setTotalUrls] = useState(0);
  const [totalUrlsToday, setTotalUrlsToday] = useState(0); // New state for today's URLs
  const [clickCounts, setClickCounts] = useState(0);
  const [totalClicksToday, setTotalClicksToday] = useState(0); // New state for today's click counts
  const [loading, setLoading] = useState(true);
  // Fetch statistics from the API (general stats)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://flask-backend-3-q3m9.onrender.com/stats');  // Update the URL if needed
        const data = await response.json();

        // Set the data in the state
        setTotalUrls(data.total_urls);
        setTotalUrlsToday(data.total_urls_today); // Set today's total URLs
        setClickCounts(data.click_counts.reduce((acc, item) => acc + item.click_count, 0)); // Summing the click counts from each URL
        setTotalClicksToday(data.total_clicks_today); // Set today's total click counts
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);


  // Fetch daily stats
  useEffect(() => {
    const fetchDailyStats = async () => {
      try {
        const response = await fetch('https://flask-backend-3-q3m9.onrender.com/stats/daily');  // Update URL if needed
        const data = await response.json();
  
        // If data is fetched successfully, process it for the chart
        if (data && data.click_counts) {
          const clickCounts = [0, 0, 0, 0, 0, 0, 0]; // Array to hold click counts for each day (Sunday to Saturday)
  
          // Since we don't have the created_at field, let's assume all counts are for today (you can later adjust this)
          const todayIndex = new Date().getDay(); // Get today's index (0 = Sunday, 6 = Saturday)
          
          // Assign all click counts to today's index for now
          data.click_counts.forEach((item) => {
            clickCounts[todayIndex] += item.click_count;  // Add the click count to today
          });
  
          setDailyStats(clickCounts);  // Update the dailyStats state
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };
  
    fetchDailyStats();
  }, []);
  
  // Generate labels for each day of the week, formatted as "dd-MM-yyyy"
  const generateWeekLabels = () => {
    const today = new Date(); // Get the current date
    const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 }); // Start of the week (Sunday)
    const labels = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(startOfWeekDate, i); // Add days to start of the week
      labels.push(format(day, 'dd-MM-yyyy')); // Format the day as "dd-MM-yyyy"
    }
    return labels;
  };

  const [labels, setLabels] = useState(generateWeekLabels()); // Initialize the labels based on the current week

  // Prepare data for the chart
  const data = {
    labels: labels,  // The days of the week formatted as "dd-MM-yyyy"
    datasets: [
      {
        label: 'Lượt truy cập',  // The label for the chart
        data: dailyStats,  // The click counts from the API
        fill: false,  // Do not fill the area below the line
        borderColor: '#3B7DDD',  // Line color
        tension: 0.1,  // Line curve tension
      },
    ],
  };

  // Chart.js options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ngày tháng năm',  // Label for the x-axis
        },
      },
      y: {
        title: {
          display: true,
          text: 'Số lượt truy cập',  // Label for the y-axis
        },
        min: 0,
      },
    },
  };

  return (
    <div className="row mb-3">
      {/* Left column */}
      <div className="col-xl-2 col-lg-3 col-md-4 d-flex">
        <div className="w-100">
          <div className="row">
            <div className="col-sm-12">
              {/* Card 1 */}
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Liên kết</h5>
                  <h1 className="mt-1 mb-3">{totalUrls}</h1>
                  <div className="mb-1">
                    <span className="text-success"> +{totalUrlsToday}</span> {/* Today's URL count */}
                    <span className="text-muted">Hôm nay</span>
                  </div>
                </div>
              </div>
              {/* Card 2 */}
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Truy cập</h5>
                  <h1 className="mt-1 mb-3">{clickCounts}</h1>
                  <div className="mb-1">
                    <span className="text-success"> +{totalClicksToday}</span> {/* Today's click count */}
                    <span className="text-muted">Hôm nay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
   
            
       
 

      {/* Right column */}
      <div className="col-xl-10 col-lg-9 col-md-8">
        <div className="card shadow-sm">
          <div className="card-header">
            <h5 className="fw-bold mb-0">Truy cập gần đây</h5>
          </div>
          <div className="card-body d-flex flex-column">
            {/* Biểu đồ với chiều cao cố định */}
            <div className="chart chart-sm" style={{ flex: '1 1 300px', overflow: 'hidden' }}>
              <Line data={data} options={options} />
            </div>
            {/* Phần thông tin bên dưới biểu đồ */}
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;