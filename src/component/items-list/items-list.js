import React, { Component } from 'react';
import { Alert, Pagination } from 'antd';

import Item from '../item';

import './items-list.css';

export default class ItemsList extends Component {
  state = {
    update: false,
  };

  render() {
    const {
      movies,
      totalPages,
      currPage,
      loading,
      switchPage,
      notFoundAlert,
      ratedListEmpty,
      error,
      onGetPage,
      onRateChange,
    } = this.props;

    const switchHidden = loading && !switchPage ? 'hidden' : 'pagination';
    const pagination = movies[0] ? (
      <Pagination
        current={currPage}
        className={switchHidden}
        total={totalPages}
        defaultPageSize={20}
        onChange={(page) => onGetPage(page)}
        showSizeChanger={false}
      />
    ) : null;

    if (notFoundAlert) {
      return (
        <Alert
          className="alert"
          message="Упс, мы ничего не нашли!"
          description="По вашему запросу ничего нет, попробуйте ввести что-то другое."
          type="info"
        />
      );
    }
    if (ratedListEmpty) {
      return (
        <Alert
          className="alert"
          message="Упс, ваш рейтинг-лист пуст!"
          description="Оцените хотя бы один фильм, чтобы он отобразился тут."
          type="info"
        />
      );
    }
    if (error) {
      return (
        <Alert
          className="alert"
          message="Что-то пошло не так"
          description="Проверьте соединение с сетью или повторите позднее."
          type="error"
        />
      );
    }

    const moviesList = movies.map((item) => {
      const { id } = item;
      return (
        <li key={id}>
          <Item item={item} loading={loading} onRateChange={onRateChange} />
        </li>
      );
    });

    return (
      <React.Fragment>
        <ul className="items-list">{moviesList}</ul>
        {pagination}
      </React.Fragment>
    );
  }
}
