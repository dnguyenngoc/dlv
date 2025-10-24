import { useState } from 'react'
import './Sidebar.css'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h3>Filters</h3>
        <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '←' : '→'}
        </button>
      </div>
      {isOpen && (
        <div className="sidebar-content">
          <div className="filter-group">
            <label>Node Type</label>
            <div className="checkbox-group">
              <label>
                <input type="checkbox" defaultChecked />
                Table
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                Transformation
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                Topic
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                View
              </label>
            </div>
          </div>
          <div className="filter-group">
            <label>Edge Type</label>
            <div className="checkbox-group">
              <label>
                <input type="checkbox" defaultChecked />
                Reads
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                Writes
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                Transforms
              </label>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
