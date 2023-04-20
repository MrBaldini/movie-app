import { Component } from 'react';
import { Spin } from 'antd';

import FilmView from '../film-view';

import './item.css';

export default class Item extends Component {
  render() {
    const { item, loading, onRateChange } = this.props;
    const { error } = item;

    const spinner = loading ? <Spin size="large" className="spinner" /> : null;
    const content = !loading && !error ? <FilmView item={item} onRateChange={onRateChange} /> : null;

    return (
      <div className="film">
        {spinner}
        {content}
      </div>
    );
  }
}
