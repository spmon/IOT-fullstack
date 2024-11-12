import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import './styles.scss';

const TableComponent = () => {
  const [data, setData] = useState([]);  // Dữ liệu từ backend
  const [totalItems, setTotalItems] = useState(0);  // Tổng số bản ghi
  const [currentPage, setCurrentPage] = useState(0);  // Trang hiện tại
  const [itemsPerPage, setItemsPerPage] = useState(25);  // Số lượng bản ghi mỗi trang
  const [searchTerm, setSearchTerm] = useState('');  // Điều kiện tìm kiếm
  const [sortConfig, setSortConfig] = useState({ key: 'ID', direction: 'ASC' });  // Cấu hình sắp xếp

  // Hàm fetch dữ liệu từ backend
  const fetchData = (page, itemsPerPage, searchTerm, sortConfig) => {
    const queryParams = new URLSearchParams({
      page: page + 1,  // Phân trang bắt đầu từ trang 1
      limit: itemsPerPage,
      search: searchTerm,
      sortKey: sortConfig.key,
      sortDirection: sortConfig.direction,
    });

    fetch(`http://localhost:5000/api/sensor?${queryParams.toString()}`)
      .then(response => response.json())
      .then(responseData => {
        setData(responseData.data);
        setTotalItems(responseData.total);  // Cập nhật tổng số bản ghi để tính toán phân trang
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  // Gọi fetchData khi có thay đổi về trang hiện tại, số lượng bản ghi mỗi trang, điều kiện tìm kiếm hoặc cấu hình sắp xếp
  useEffect(() => {
    fetchData(currentPage, itemsPerPage, searchTerm, sortConfig);
  }, [currentPage, itemsPerPage, searchTerm, sortConfig]);

  // Xử lý khi người dùng click vào tiêu đề cột để sắp xếp
  const handleSort = (columnKey) => {
    let direction = 'ASC';
    if (sortConfig.key === columnKey && sortConfig.direction === 'ASC') {
      direction = 'DESC';
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Xử lý khi người dùng thay đổi trang
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Xử lý khi người dùng thay đổi số lượng bản ghi mỗi trang
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0);  // Reset về trang đầu khi thay đổi số lượng bản ghi mỗi trang
  };

  return (
    <div className="table-container">
      <div className="table-title">Dữ liệu cảm biến</div>
      {/* Thanh tìm kiếm */}
      <input
        type="date"
        placeholder="Tìm kiếm theo ngày"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      {/* Bảng dữ liệu */}
      <table className="table">
        <thead className="table-header">
          <tr>
            <th onClick={() => handleSort('ID')}>ID {sortConfig.key === 'ID' ? (sortConfig.direction === 'ASC' ? '🔼' : '🔽') : ''}</th>
            <th onClick={() => handleSort('temperature')}>Temperature (℃) {sortConfig.key === 'temperature' ? (sortConfig.direction === 'ASC' ? '🔼' : '🔽') : ''}</th>
            <th onClick={() => handleSort('humidity')}>Humidity (%) {sortConfig.key === 'humidity' ? (sortConfig.direction === 'ASC' ? '🔼' : '🔽') : ''}</th>
            <th onClick={() => handleSort('light')}>Light (lux) {sortConfig.key === 'light' ? (sortConfig.direction === 'ASC' ? '🔼' : '🔽') : ''}</th>
            <th onClick={() => handleSort('Datesave')}>Timestamp {sortConfig.key === 'Datesave' ? (sortConfig.direction === 'ASC' ? '🔼' : '🔽') : ''}</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.ID}>
              <td>{item.ID}</td>
              <td>{item.temperature}</td>
              <td>{item.humidity}</td>
              <td>{item.light}</td>
              <td>{item.Datesave}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Điều khiển số lượng bản ghi mỗi trang */}
      <div className="pagination-controls">
        <label htmlFor="items-per-page">Số bản ghi mỗi trang:</label>
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

      {/* Điều khiển phân trang */}
      <ReactPaginate
        previousLabel={'Previous'}
        nextLabel={'Next'}
        breakLabel={'...'}
        pageCount={Math.ceil(totalItems / itemsPerPage)}  // Tính tổng số trang
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />
    </div>
  );
};

export default TableComponent;
