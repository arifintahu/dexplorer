import Chart, { ChartData, ChartOptions } from 'chart.js/auto'
import React, { useEffect, useRef } from 'react'

// Define a type for the props if you plan to pass any in the future
interface TransactionsChartProps {}

// Define the data type for the chart
const data: ChartData<'line'> = {
  labels: ['21 Oct', '29 Oct', '6 Nov', '13 Nov', '20 Nov', '26 Nov', '3 Dec'],
  datasets: [
    {
      label: 'Transactions',
      data: [100, 120, 150, 800, 250, 200, 180],
      borderColor: '#00BFFF',
      fill: true,
      tension: 0.4, // Smooth curve
      pointRadius: 0, // No points
      borderWidth: 2,
      backgroundColor: (context) => {
        const { chart } = context
        const { ctx, chartArea } = chart
        if (!chartArea) return '#00BFFF' // Return a solid color if chartArea is not available
        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom
        )
        gradient.addColorStop(0, 'rgba(0, 191, 255, 0.8)')
        gradient.addColorStop(1, 'rgba(0, 191, 255, 0)')
        return gradient
      },
    },
  ],
}

// Define the chart options
const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Hide the legend
    },
    tooltip: {
      backgroundColor: '#333333',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#333333',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'rgba(107, 114, 128, 1)',
      },
      grid: {
        display: false,
      },
    },
    y: {
      ticks: {
        color: 'rgba(107, 114, 128, 1)',
        maxTicksLimit: 3,
      },
      grid: {
        color: 'rgba(42, 49, 58, 0.4)',
        tickBorderDash: [3, 3],
        tickBorderDashOffset: 4,
      },
    },
  },
}

const TransactionsChart: React.FC<TransactionsChartProps> = () => {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart<'line'> | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      // Initialize Chart.js chart
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'line',
        data,
        options,
      })
    }

    // Cleanup function to destroy chart instance
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '150px' }}>
      <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export default TransactionsChart
