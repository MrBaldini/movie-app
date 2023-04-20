import React from 'react';
import { Input } from 'antd';
import { debounce } from 'lodash';

import './search-panel.css';

export default class SearchPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.inputRef.current.focus();
  }

  debouncedSearch = debounce((value) => {
    const { onSearch, page } = this.props;
    onSearch(value, page);
  }, 1000);

  onChange = (e) => {
    const { value } = e.target;
    this.setState({ value });
    if (e.target.value.trim() === '') return;
    this.debouncedSearch(value);
  };

  render() {
    const { value } = this.state;
    return (
      <Input
        ref={this.inputRef}
        type="text"
        className="input"
        placeholder="Type to search..."
        allowClear={true}
        onChange={this.onChange}
        value={value}
      />
    );
  }
}
