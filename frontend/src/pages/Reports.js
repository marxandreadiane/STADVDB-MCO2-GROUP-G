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
  const [sliceData, setSliceData] = useState([]);
  const [timeSliceData, setTimeSliceData] = useState({ daily: [], monthly: [], yearly: [] });
  const [dailyTrends, setDailyTrends] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [quarterlyTrends, setQuarterlyTrends] = useState([]);
  const [annualTrends, setAnnualTrends] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [diceOptions, setDiceOptions] = useState({
    companies: [],
    artists: [],
    albums: []
  });

  const [sliceDimension, setSliceDimension] = useState('company');
  const [sliceLoading, setSliceLoading] = useState(false);
  const [timeSliceView, setTimeSliceView] = useState('daily');
  
  const [diceFilters, setDiceFilters] = useState({
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: '',
    companyId: '',
    artistId: '',
    albumKey: ''
  });
  const [diceLoading, setDiceLoading] = useState(false);
  const dateLimits = useMemo(() => ({
    min: '2000-01-01',
    max: new Date().toISOString().split('T')[0]
  }), []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        companyData,
        artistData,
        albumData,
        timeSlice,
        dailyTrendData,
        monthlyTrendData,
        quarterlyTrendData,
        annualTrendData
      ] = await Promise.all([
        fetchJSON('/api/reports/rollup-sales?level=company'),
        fetchJSON('/api/reports/rollup-sales?level=artist'),
        fetchJSON('/api/reports/rollup-sales?level=album'),
        fetchJSON('/api/reports/slice/time'),
        fetchJSON('/api/reports/sales-trends?granularity=daily'),
        fetchJSON('/api/reports/sales-trends?granularity=monthly'),
        fetchJSON('/api/reports/sales-trends?granularity=quarterly'),
        fetchJSON('/api/reports/sales-trends?granularity=annual')
      ]);

      setSalesByCompany(Array.isArray(companyData) ? companyData : []);
      setSalesByArtist(Array.isArray(artistData) ? artistData : []);
      setSalesByAlbum(Array.isArray(albumData) ? albumData : []);
      setTimeSliceData(timeSlice || { daily: [], monthly: [], yearly: [] });
      setDailyTrends(
        Array.isArray(dailyTrendData)
          ? [...dailyTrendData].sort((a, b) => new Date(b.date) - new Date(a.date))
          : []
      );
      setMonthlyTrends(Array.isArray(monthlyTrendData) ? monthlyTrendData : []);
      setQuarterlyTrends(Array.isArray(quarterlyTrendData) ? quarterlyTrendData : []);
      setAnnualTrends(Array.isArray(annualTrendData) ? annualTrendData : []);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    const loadDiceOptions = async () => {
      try {
        const data = await fetchJSON('/api/reports/dice/filters');
        setDiceOptions(data);
      } catch (err) {
        console.error('Dice options load error:', err);
      }
    };
    loadDiceOptions();
  }, []);

  const fetchSliceDimension = useCallback(async (dimension) => {
    if (dimension === 'time') return;
    setSliceLoading(true);
    try {
      const data = await fetchJSON(`/api/reports/slice/${dimension}`);
      setSliceData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Slice fetch error:', err);
    } finally {
      setSliceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (sliceDimension === 'time') {
      setSliceData([]);
      return;
    }
    fetchSliceDimension(sliceDimension);
  }, [sliceDimension, loading, fetchSliceDimension]);

  const buildDiceUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (diceFilters.startDate) params.append('startDate', diceFilters.startDate);
    if (diceFilters.endDate) params.append('endDate', diceFilters.endDate);
    if (diceFilters.minPrice) params.append('minPrice', diceFilters.minPrice);
    if (diceFilters.maxPrice) params.append('maxPrice', diceFilters.maxPrice);
    if (diceFilters.companyId) params.append('companyId', diceFilters.companyId);
    if (diceFilters.artistId) params.append('artistId', diceFilters.artistId);
    if (diceFilters.albumKey) params.append('albumKey', diceFilters.albumKey);
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
      setRecentOrders(Array.isArray(data) ? data.slice(0, 15) : []);
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
      if (field === 'companyId') {
        next.companyId = value;
        if (!value) {
          next.artistId = '';
          next.albumKey = '';
        } else if (
          next.artistId &&
          !diceOptions.artists.some(
            (artist) =>
              String(artist.artist_id) === next.artistId &&
              String(artist.company_id) === value
          )
        ) {
          next.artistId = '';
          next.albumKey = '';
        }
        return next;
      }
      if (field === 'artistId') {
        next.artistId = value;
        if (value) {
          const selectedArtist = diceOptions.artists.find(
            (artist) => String(artist.artist_id) === value
          );
          if (selectedArtist) {
            next.companyId = String(selectedArtist.company_id);
          }
        } else {
          next.albumKey = '';
        }
        return next;
      }
      if (field === 'albumKey') {
        next.albumKey = value;
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

  const handleRefreshReports = async () => {
    if (!isAdmin || refreshing) return;
    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/refresh`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Refresh request failed');
      }
      await loadReports();
      if (sliceDimension !== 'time') {
        await fetchSliceDimension(sliceDimension);
      }
      await fetchDiceData();
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh reports database. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `₱ ${formatted}`;
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
        <div className="reports-header-text">
          <h1>{isAdmin ? 'Sales Analytics Dashboard' : 'Popular Albums & Trends'}</h1>
          <p>{isAdmin ? 'Comprehensive OLAP Analysis & Business Intelligence' : 'Discover trending albums and popular artists'}</p>
        </div>
        {isAdmin && (
          <button
            className="btn-refresh"
            onClick={handleRefreshReports}
            disabled={refreshing || loading}
          >
            {refreshing ? 'Refreshing…' : 'Refresh Reports Data'}
          </button>
        )}
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
          sliceData={sliceDimension === 'time' ? [] : sliceData}
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
          companyOptions={diceOptions.companies}
          artistOptions={diceOptions.artists}
          albumOptions={diceOptions.albums}
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

