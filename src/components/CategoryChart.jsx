import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatINR } from '../utils/currency';
import { ChartPieIcon } from './Icons';

ChartJS.register(ArcElement, Tooltip, Legend);

const CATEGORY_COLORS = {
  Food: '#D995AA',
  Travel: '#B6A3DF',
  Shopping: '#A95775',
  Stay: '#39283F',
  Utilities: '#278567',
  Other: '#D9822B',
};

export default function CategoryChart({ expenses = [] }) {
  // Aggregate expenses by category
  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (Number(exp.amountPaise) || 0);
    return acc;
  }, {});

  const totalPaise = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const categories = Object.keys(categoryTotals);

  if (categories.length === 0 || totalPaise === 0) {
    return (
      <div className="chart-container" style={{ textAlign: 'center', justifyContent: 'center', minHeight: '260px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--petal-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChartPieIcon size={24} color="var(--rosewood)" />
          </div>
        </div>
        <div style={{ fontWeight: 600, color: 'var(--deep-plum)', fontSize: '0.95rem' }}>No spending data yet</div>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Record expenses to see category breakdown.
        </p>
      </div>
    );
  }

  const chartData = {
    labels: categories,
    datasets: [
      {
        data: categories.map((cat) => categoryTotals[cat] / 100), // in rupees
        backgroundColor: categories.map((cat) => CATEGORY_COLORS[cat] || '#827786'),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#39283F',
        titleFont: { family: 'DM Sans', size: 13 },
        bodyFont: { family: 'DM Sans', size: 12 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = Math.round((val / (totalPaise / 100)) * 100);
            return ` ₹${val.toLocaleString('en-IN')} (${pct}%)`;
          },
        },
      },
    },
    cutout: '72%',
  };

  return (
    <div className="chart-container">
      <div className="section-header" style={{ marginBottom: '8px' }}>
        <h4 className="section-title" style={{ fontSize: '1.15rem' }}>Spending by Category</h4>
        <span className="badge badge-rose">{formatINR(totalPaise)}</span>
      </div>

      <div className="chart-wrapper">
        <Doughnut data={chartData} options={chartOptions} />
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--deep-plum)' }}>
            {formatINR(totalPaise)}
          </div>
        </div>
      </div>

      <div className="chart-legend">
        {categories.map((cat) => {
          const amt = categoryTotals[cat];
          const pct = Math.round((amt / totalPaise) * 100);
          return (
            <div key={cat} className="legend-item">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  className="legend-color-dot"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] || '#827786' }}
                />
                <span style={{ color: 'var(--deep-plum)', fontWeight: 500 }}>{cat}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--deep-plum)' }}>{formatINR(amt)}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
