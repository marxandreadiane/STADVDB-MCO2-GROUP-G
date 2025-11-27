import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ReportsSummaryCards from '../components/reports/ReportsSummaryCards';
import CompanyRollupSection from '../components/reports/CompanyRollupSection';
import ArtistRollupSection from '../components/reports/ArtistRollupSection';
import AlbumDrilldownSection from '../components/reports/AlbumDrilldownSection';
import SliceAnalysisSection from '../components/reports/SliceAnalysisSection';
import TrendsSection from '../components/reports/TrendsSection';
import DiceSection from '../components/reports/DiceSection';
import InsightsSection from '../components/reports/InsightsSection';
import './Reports.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const fetchJSON = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

function Reports() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesByCompany, setSalesByCompany] = useState([]);
  const [salesByArtist, setSalesByArtist] = useState([]);
  const [salesByAlbum, setSalesByAlbum] = useState([]);
  const [salesByStatus, setSalesByStatus] = useState([]);
  const [timeSliceData, setTimeSliceData] = useState({ daily: [], monthly: [], yearly: [] });
  const [dailyTrends, setDailyTrends] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [quarterlyTrends, setQuarterlyTrends] = useState([]);
  const [annualTrends, setAnnualTrends] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const [sliceDimension, setSliceDimension] = useState('status');
  const [sliceLoading, setSliceLoading] = useState(false);
  const [timeSliceView, setTimeSliceView] = useState('daily');
  
  const [diceFilters, setDiceFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    minPrice: '',
    maxPrice: ''
  });
  const [diceLoading, setDiceLoading] = useState(false);
  const dateLimits = useMemo(() => ({
    min: '2000-01-01',
    max: new Date().toISOString().split('T')[0]
  }), []);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          companyData,
          artistData,
          albumData,
          statusSliceData,
          timeSlice,
          dailyTrendData,
          monthlyTrendData,
          quarterlyTrendData,
          annualTrendData
        ] = await Promise.all([
          fetchJSON('/api/reports/rollup-sales?level=company'),
          fetchJSON('/api/reports/rollup-sales?level=artist'),
          fetchJSON('/api/reports/rollup-sales?level=album'),
          fetchJSON('/api/reports/slice/status'),
          fetchJSON('/api/reports/slice/time'),
          fetchJSON('/api/reports/sales-trends?granularity=daily'),
          fetchJSON('/api/reports/sales-trends?granularity=monthly'),
          fetchJSON('/api/reports/sales-trends?granularity=quarterly'),
          fetchJSON('/api/reports/sales-trends?granularity=annual')
        ]);

        setSalesByCompany(companyData);
        setSalesByArtist(artistData);
        setSalesByAlbum(albumData);
        setSalesByStatus(statusSliceData);
        setTimeSliceData(timeSlice);
        setDailyTrends(dailyTrendData.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setMonthlyTrends(monthlyTrendData);
        setQuarterlyTrends(quarterlyTrendData);
        setAnnualTrends(annualTrendData);
      } catch (err) {
        console.error('Analytics load error:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const fetchSliceDimension = useCallback(async (dimension) => {
    if (dimension === 'time') return;
    setSliceLoading(true);
    try {
      const data = await fetchJSON(`/api/reports/slice/${dimension}`);
      setSalesByStatus(data);
    } catch (err) {
      console.error('Slice fetch error:', err);
    } finally {
      setSliceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && sliceDimension !== 'time') {
      fetchSliceDimension(sliceDimension);
    }
  }, [sliceDimension, loading, fetchSliceDimension]);

  const buildDiceUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (diceFilters.startDate) params.append('startDate', diceFilters.startDate);
    if (diceFilters.endDate) params.append('endDate', diceFilters.endDate);
    if (diceFilters.status) params.append('status', diceFilters.status);
    if (diceFilters.minPrice) params.append('minPrice', diceFilters.minPrice);
    if (diceFilters.maxPrice) params.append('maxPrice', diceFilters.maxPrice);
    const query = params.toString();
    return `${API_BASE_URL}/api/reports/dice${query ? `?${query}` : ''}`;
  }, [diceFilters]);

  const fetchDiceData = useCallback(async () => {
    if (loading) return;
    setDiceLoading(true);
    try {
      const response = await fetch(buildDiceUrl());
      if (!response.ok) throw new Error('Dice request failed');
      const data = await response.json();
      setRecentOrders(data.slice(0, 15));
    } catch (err) {
      console.error('Dice fetch error:', err);
    } finally {
      setDiceLoading(false);
    }
  }, [buildDiceUrl, loading]);

  useEffect(() => {
    fetchDiceData();
  }, [diceFilters, fetchDiceData]);

  const handleSliceChange = (dimension) => {
    setSliceDimension(dimension);
    if (dimension === 'time') {
      setSliceLoading(false);
    }
  };

  const handleDiceFilterChange = (field, value) => {
    setDiceFilters(prev => {
      const next = { ...prev };
      if (field === 'minPrice' || field === 'maxPrice') {
        if (value === '') {
          next[field] = '';
        } else {
          const numeric = Math.min(9999, Math.max(0.01, parseFloat(value)));
          next[field] = Number.isNaN(numeric) ? '' : numeric.toFixed(2);
        }
        return next;
      }
      if (field === 'startDate') {
        next.startDate = value;
        if (next.endDate && value && new Date(value) > new Date(next.endDate)) {
          next.endDate = value;
        }
        return next;
      }
      if (field === 'endDate') {
        if (next.startDate && value && new Date(value) < new Date(next.startDate)) {
          next.endDate = next.startDate;
        } else {
          next.endDate = value;
        }
        return next;
      }
      next[field] = value;
      return next;
    });
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getBarWidth = (value, maxValue) => {
    if (maxValue === 0) return '0%';
    const width = (parseFloat(value || 0) / maxValue) * 100;
    return `${Math.min(width, 100)}%`;
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading comprehensive reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="loading-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totalRevenue = salesByCompany.reduce((sum, c) => sum + parseFloat(c.total_revenue || 0), 0);
  const totalOrders = salesByCompany.reduce((sum, c) => sum + parseInt(c.total_orders || 0, 10), 0);
  const totalUnits = salesByCompany.reduce((sum, c) => sum + parseInt(c.total_units_sold || 0, 10), 0);

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>{isAdmin ? 'Sales Analytics Dashboard' : 'Popular Albums & Trends'}</h1>
        <p>{isAdmin ? 'Comprehensive OLAP Analysis & Business Intelligence' : 'Discover trending albums and popular artists'}</p>
      </div>

      <ReportsSummaryCards
        isAdmin={isAdmin}
        totalRevenue={formatCurrency(totalRevenue)}
        totalOrders={totalOrders}
        totalUnits={totalUnits}
        companyCount={salesByCompany.length}
        artistCount={salesByArtist.length}
      />

      <CompanyRollupSection
        data={salesByCompany}
        isAdmin={isAdmin}
        getBarWidth={getBarWidth}
        formatCurrency={formatCurrency}
      />

      <ArtistRollupSection
        data={salesByArtist}
        isAdmin={isAdmin}
        getBarWidth={getBarWidth}
        formatCurrency={formatCurrency}
      />

      <AlbumDrilldownSection data={salesByAlbum} isAdmin={isAdmin} formatCurrency={formatCurrency} />

      {isAdmin && (
        <SliceAnalysisSection
          sliceDimension={sliceDimension}
          onDimensionChange={handleSliceChange}
          sliceData={sliceDimension === 'time' ? [] : salesByStatus}
          sliceLoading={sliceLoading}
          formatCurrency={formatCurrency}
          timeData={timeSliceData}
          timeView={timeSliceView}
          onTimeViewChange={setTimeSliceView}
          formatDate={formatDate}
        />
      )}

      <TrendsSection
        dailyData={dailyTrends}
        monthlyData={monthlyTrends}
        quarterlyData={quarterlyTrends}
        annualData={annualTrends}
        isAdmin={isAdmin}
        getBarWidth={getBarWidth}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {isAdmin && (
        <DiceSection
          dateLimits={dateLimits}
          diceFilters={diceFilters}
          onFilterChange={handleDiceFilterChange}
          diceLoading={diceLoading}
          recentOrders={recentOrders}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      <InsightsSection
        salesByCompany={salesByCompany}
        salesByArtist={salesByArtist}
        salesByAlbum={salesByAlbum}
        isAdmin={isAdmin}
        formatCurrency={formatCurrency}
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
      />
    </div>
  );
}

export default Reports;

