import React from 'react';

const ReportsSummaryCards = ({ isAdmin, totalRevenue, totalOrders, totalUnits, companyCount, artistCount }) => (
  <div className="summary-cards">
    {isAdmin && (
      <div className="summary-card purple">
        <div className="card-icon"></div>
        <div className="card-content">
          <h3>Total Revenue</h3>
          <p className="card-value">{totalRevenue}</p>
        </div>
      </div>
    )}
    <div className="summary-card blue">
      <div className="card-icon"></div>
      <div className="card-content">
        <h3>{isAdmin ? 'Total Orders' : 'Orders Processed'}</h3>
        <p className="card-value">{totalOrders}</p>
      </div>
    </div>
    <div className="summary-card green">
      <div className="card-icon"></div>
      <div className="card-content">
        <h3>Albums Sold</h3>
        <p className="card-value">{totalUnits}</p>
      </div>
    </div>
    <div className="summary-card orange">
      <div className="card-icon"></div>
      <div className="card-content">
        <h3>Active Companies</h3>
        <p className="card-value">{companyCount}</p>
      </div>
    </div>
    {!isAdmin && (
      <div className="summary-card purple">
        <div className="card-icon"></div>
        <div className="card-content">
          <h3>Top Artists</h3>
          <p className="card-value">{artistCount}</p>
        </div>
      </div>
    )}
  </div>
);

export default ReportsSummaryCards;

