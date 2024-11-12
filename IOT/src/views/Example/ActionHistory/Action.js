import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import './Action.scss';

const Action = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('ASC');

  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/light-history?page=${currentPage + 1}&limit=${itemsPerPage}&search=${searchTerm}&sortKey=${sortKey}&sortDirection=${sortDirection}`
      );
      const result = await response.json();
      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error fetching light history:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchTerm, sortKey, sortDirection]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Nếu bạn muốn reset về trang đầu khi tìm kiếm
  };

  // Xử lý khi người dùng sắp xếp
  const handleSort = (key) => {
    const newDirection = sortKey === key && sortDirection === 'ASC' ? 'DESC' : 'ASC';
    setSortKey(key);
    setSortDirection(newDirection);
    
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0); // Reset về trang đầu khi thay đổi số lượng bản ghi
  };

  return (
    <div className="table-container">
      <div className="table-title">Action History</div>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-bar"
      />

      <table className="table">
        <thead className="table-header">
          <tr>
            <th onClick={() => handleSort('id')}>ID</th>
            <th onClick={() => handleSort('light_name')}>Device</th>
            <th onClick={() => handleSort('state')}>Action</th>
            <th onClick={() => handleSort('timestamp')}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.light_name}</td>
              <td>{row.state ? 'On' : 'Off'}</td>
              <td>{row.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-controls">
        <label htmlFor="items-per-page">Rows per page:</label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="items-per-page-select"
        >
          <option value={5}>05</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>
      </div>

      <ReactPaginate
        previousLabel={'Previous'}
        nextLabel={'Next'}
        breakLabel={'...'}
        pageCount={totalPages}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />
    </div>
  );
};

export default Action;
