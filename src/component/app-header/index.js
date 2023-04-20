import SearchPanel from '../search-panel';
import './app-header.css';

const AppHeader = ({ onSearch }) => {
  return (
    <div>
      <SearchPanel onSearch={onSearch} />
    </div>
  );
};

export default AppHeader;
