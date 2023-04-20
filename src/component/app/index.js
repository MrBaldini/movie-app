import React from 'react';
import { Alert, Menu } from 'antd';

import MovieDbService from '../../services/moviedb-service';
import CheckNetworkState from '../check-network-state';
import AppHeader from '../app-header';
import ItemsList from '../items-list';
import { GenresListProvider } from '../genres-list-context';
import './app.css';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      moviesData: [],
      page: 1,
      network: true,
      menu: 'search',
    };
  }

  movieDbService = new MovieDbService();

  async componentDidMount() {
    await this.movieDbService.checkGuestSession();
    const genresList = await this.movieDbService.getGenresList();

    this.setState({
      genresList,
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    const { inputValue, page, menu } = this.state;

    if (prevState.menu !== menu && menu !== 'rated') {
      this.setStateToDefault();
      return;
    }

    if (prevState.inputValue !== inputValue || prevState.page !== page || prevState.menu !== menu) {
      const data = await this.movieDbService.getMoviesData(inputValue, page, menu);
      const { movies, totalPages, notFoundAlert = false, ratedListEmpty = false, error = false } = data;
      this.setState({
        totalPages,
        moviesData: movies,
        notFoundAlert,
        ratedListEmpty,
        error,
        loading: false,
        switchPage: false,
      });
    }
  }

  setStateToDefault = () => {
    this.setState({
      moviesData: [],
      page: 1,
      notFoundAlert: false,
      error: false,
      loading: false,
    });
  };

  onSearch = (inputValue) => {
    this.setState({
      inputValue,
      moviesData: [{ id: 0 }],
      loading: true,
      page: 1,
    });
  };

  onGetPage = (page) => {
    this.setState({
      page,
      loading: true,
      switchPage: true,
    });
  };

  onNetworkState = (boolean) => {
    this.setState({
      network: boolean,
    });
  };

  onMenuSelect = ({ key }) => {
    if (this.state.menu === key) return;

    this.setState({
      inputValue: '',
      moviesData: [{ id: 0 }],
      menu: key,
      loading: true,
      page: 1,
    });
  };

  onRateChange = async (movieId, rate) => {
    await this.movieDbService.rateTheMovie(movieId, rate);
    this.setState({
      rated: 1,
    });
  };

  render() {
    const {
      moviesData,
      totalPages,
      page,
      loading,
      switchPage,
      network,
      notFoundAlert,
      ratedListEmpty,
      error,
      menu,
      genresList,
    } = this.state;

    const search =
      menu === 'search' ? (
        <React.Fragment>
          <AppHeader onSearch={this.onSearch} />
          <ItemsList
            movies={moviesData}
            totalPages={totalPages}
            currPage={page}
            onGetPage={this.onGetPage}
            loading={loading}
            switchPage={switchPage}
            notFoundAlert={notFoundAlert}
            error={error}
            onRateChange={this.onRateChange}
          />
        </React.Fragment>
      ) : null;
    const rated =
      menu === 'rated' ? (
        <React.Fragment>
          <ItemsList
            movies={moviesData}
            totalPages={totalPages}
            currPage={page}
            onGetPage={this.onGetPage}
            loading={loading}
            switchPage={switchPage}
            ratedListEmpty={ratedListEmpty}
            error={error}
            onRateChange={this.onRateChange}
          />
        </React.Fragment>
      ) : null;

    if (!network) {
      return (
        <Alert
          message="Упс, что-то с сетью!"
          description="Проверьте интернет-соединение и повторите попытку."
          type="error"
          className="network-alert"
        />
      );
    }

    return (
      <GenresListProvider value={genresList}>
        <div className="app">
          <Menu
            className="menu"
            mode="horizontal"
            items={[
              {
                label: 'Search',
                key: 'search',
              },
              {
                label: 'Rated',
                key: 'rated',
              },
            ]}
            defaultSelectedKeys="search"
            onClick={this.onMenuSelect}
          />
          <CheckNetworkState onNetworkState={this.onNetworkState} />
          {search}
          {rated}
        </div>
      </GenresListProvider>
    );
  }
}
