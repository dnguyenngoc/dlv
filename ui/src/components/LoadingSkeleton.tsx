import React from 'react'
import './LoadingSkeleton.css'

interface LoadingSkeletonProps {
  count?: number
  className?: string
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 6,
  className = ''
}) => {
  return (
    <div className={`skeleton-grid ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-header">
            <div className="skeleton-icon" />
            <div className="skeleton-info">
              <div className="skeleton-title" />
              <div className="skeleton-subtitle" />
            </div>
            <div className="skeleton-status" />
          </div>
          <div className="skeleton-actions">
            <div className="skeleton-button" />
            <div className="skeleton-button" />
            <div className="skeleton-button" />
            <div className="skeleton-button" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingSkeleton
