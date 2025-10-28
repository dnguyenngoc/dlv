import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Node } from '@xyflow/react'
import './MetricsPanel.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface MetricsPanelProps {
  selectedNode: Node | null
  metrics: {
    totalNodes: number
    activeConnections: number
    dataThroughput: string
    systemHealth: string
  }
}

export function MetricsPanel({ selectedNode, metrics }: MetricsPanelProps) {
  // Sample data for charts
  const throughputData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Data Throughput (MB/s)',
        data: [120, 190, 300, 500, 200, 300],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const nodeTypeData = {
    labels: ['Spark', 'Kafka', 'Airflow', 'Database'],
    datasets: [
      {
        label: 'Node Count',
        data: [12, 8, 5, 15],
        backgroundColor: [
          'rgba(255, 107, 53, 0.8)',
          'rgba(74, 74, 74, 0.8)',
          'rgba(0, 160, 225, 0.8)',
          'rgba(74, 144, 226, 0.8)',
        ],
        borderColor: [
          'rgb(255, 107, 53)',
          'rgb(74, 74, 74)',
          'rgb(0, 160, 225)',
          'rgb(74, 144, 226)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const healthData = {
    labels: ['Healthy', 'Warning', 'Error'],
    datasets: [
      {
        data: [85, 10, 5],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 10,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 10,
          },
        },
      },
    },
  }

  return (
    <div className="metrics-panel">
      <h3>Metrics & Analytics</h3>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="selected-node-details">
          <h4>Selected Node</h4>
          <div className="node-info">
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">{selectedNode.type}</span>
            </div>
            <div className="info-item">
              <span className="info-label">ID:</span>
              <span className="info-value">{selectedNode.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Label:</span>
              <span className="info-value">{selectedNode.data.label}</span>
            </div>
            {selectedNode.data.status && (
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`info-value status-${selectedNode.data.status.toLowerCase()}`}>
                  {selectedNode.data.status}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Throughput Chart */}
      <div className="chart-container">
        <h4>Data Throughput (24h)</h4>
        <div className="chart-wrapper">
          <Line data={throughputData} options={chartOptions} />
        </div>
      </div>

      {/* Node Type Distribution */}
      <div className="chart-container">
        <h4>Node Distribution</h4>
        <div className="chart-wrapper">
          <Bar data={nodeTypeData} options={chartOptions} />
        </div>
      </div>

      {/* System Health */}
      <div className="chart-container">
        <h4>System Health</h4>
        <div className="chart-wrapper doughnut-wrapper">
          <Doughnut data={healthData} options={doughnutOptions} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <h4>Quick Stats</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{metrics.totalNodes}</div>
            <div className="stat-label">Total Nodes</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{metrics.activeConnections}</div>
            <div className="stat-label">Connections</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{metrics.dataThroughput}</div>
            <div className="stat-label">Throughput</div>
          </div>
          <div className="stat-item">
            <div className={`stat-value health-${metrics.systemHealth}`}>
              {metrics.systemHealth}
            </div>
            <div className="stat-label">Health</div>
          </div>
        </div>
      </div>
    </div>
  )
}
