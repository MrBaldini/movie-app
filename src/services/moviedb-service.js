import format from 'date-fns/format';

export default class MovieDbService {
  apiKey = process.env.REACT_APP_UNSPLASH_KEY;

  url = process.env.REACT_APP_UNSPLASH_URL;

  getSessionId = async () => {
    const guestSessionId = await fetch(`${this.url}/authentication/guest_session/new?api_key=${this.apiKey}`);
    guestSessionId.json().then((obj) => localStorage.setItem('guestSessionId', obj.guest_session_id));
  };

  checkGuestSession = async () => {
    if (localStorage.getItem('guestSessionId') === null) {
      await this.getSessionId();
    }
  };

  getGenresList = async () => {
    const response = await fetch(`${this.url}/genre/movie/list?api_key=${this.apiKey}&language=en-US`);

    if (!response.ok) {
      throw new Error(`Could not fetch, something went wrong, recieved '${response.status}'.`);
    }

    let genresList;
    await response.json().then((obj) => {
      genresList = obj.genres;
    });

    return genresList;
  };

  static getOverview = (prop) => {
    const wordsArray = prop.overview.split(' ');
    const overview = wordsArray.map((word, i = 0) => {
      if (prop.title.length > 24) {
        if (i < 20) return word;
      } else if (prop.title.length <= 24) {
        if (i < 30) return word;
      }
      if (i === 30) return '...';
      i++;
      return '';
    }, []);
    if (overview.join(' ').trim() === '') return 'No data.';
    return overview.join(' ').trim();
  };

  static getPosterUrl = (prop) => {
    const url = prop.poster_path;
    if (url !== null) {
      return `https://image.tmdb.org/t/p/original${prop.poster_path}`;
    }
    return null;
  };

  static getDate = (prop) => {
    if (prop.release_date === '') {
      return 'No data';
    }
    return format(new Date(prop.release_date), 'PP');
  };

  static getId = (prop) => {
    if (prop.id === '') {
      return 1;
    }
    return prop.id;
  };

  async searchMovie(movie, page = 1) {
    const response = await fetch(
      `${this.url}/search/movie?api_key=${this.apiKey}&language=en-US&query=${movie}&page=${page}&include_adult=false`
    );

    if (!response.ok) {
      throw new Error(`Could not fetch ${movie}, received ${response.status}`);
    }

    const body = await response.json();
    return body;
  }

  async rateTheMovie(movieId, rate) {
    const setRate = JSON.stringify({ value: rate });
    localStorage.setItem(movieId, rate);

    const response = await fetch(
      `${this.url}/movie/${movieId}/rating?api_key=${this.apiKey}&guest_session_id=${localStorage.getItem(
        'guestSessionId'
      )}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: setRate,
      }
    );

    if (!response.ok) {
      throw new Error(`Could not fetch this movie rate, received ${response.status}`);
    }
  }

  async getRatedMovies(page) {
    const response = await fetch(
      `${this.url}/guest_session/${localStorage.getItem('guestSessionId')}/rated/movies?api_key=${
        this.apiKey
      }&language=en-US&sort_by=created_at.asc&page=${page}`
    );

    if (response.status === 401) {
      this.getSessionId();
      throw new Error('Authentication failed. Session id was refreshed. Please try fetch again.');
    }

    if (!response.ok) {
      throw new Error(`Could not fetch this session id, received ${response.status}`);
    }

    const body = await response.json();
    return body;
  }

  async getMoviesData(inputValue, pageNum, menu) {
    let page;
    if (menu === 'search') {
      page = this.searchMovie(inputValue, pageNum);
    } else {
      page = this.getRatedMovies(pageNum);
    }

    const movies = [];
    const data = {};
    const notFoundAlert = 'Movie is not found. Please try another request.';
    const ratedListEmpty = 'Rated list is empty, please rate one movie at least.';
    let totalPages;

    await page
      .then((obj) => {
        if (menu === 'rated') {
          totalPages = obj.total_pages * 20;
        } else {
          totalPages = obj.total_pages;
        }

        return obj.results;
      })
      .then((arr) => {
        if (arr[0] === undefined && menu === 'search') throw new Error(notFoundAlert);
        if (arr[0] === undefined && menu === 'rated') throw new Error(ratedListEmpty);

        arr.forEach((prop, i = 0) => {
          if (i < 20) {
            const posterUrl = MovieDbService.getPosterUrl(prop);
            const title = prop.title;
            const date = MovieDbService.getDate(prop);
            const overview = MovieDbService.getOverview(prop);
            const id = MovieDbService.getId(prop);
            const rating = prop.vote_average.toFixed(1);
            const genreIds = prop.genre_ids;
            const movie = {
              posterUrl,
              title,
              date,
              overview,
              id,
              rating,
              genreIds,
            };
            movies.push(movie);
          }
        });
      })
      .catch((err) => {
        if (err.message === notFoundAlert) data.notFoundAlert = true;
        if (err.message === ratedListEmpty) data.ratedListEmpty = true;
        if (err.message !== notFoundAlert) data.error = true;
        return err;
      });

    data.movies = movies;
    data.totalPages = totalPages;
    return data;
  }
}
