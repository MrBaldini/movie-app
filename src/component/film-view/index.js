import React from 'react';
import { Typography, Image, Empty, Rate, Progress } from 'antd';

import { GenresListConsumer } from '../genres-list-context';

import emptyPoster from './plenka.png';
import './film-view.css';

const FilmView = ({ item, onRateChange }) => {
  const { Title, Text } = Typography;
  const { posterUrl, title, date, overview, id, rating, genreIds } = item;
  const posterSrc = !posterUrl ? emptyPoster : posterUrl;
  const description =
    overview === 'No data.' ? <Empty className="description__empty" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : overview;
  let rateColor;

  if (rating < 3) {
    rateColor = '#E90000';
  } else if (rating < 5) {
    rateColor = '#E97E00';
  } else if (rating < 7) {
    rateColor = '#E9D100';
  } else {
    rateColor = '#66E900';
  }

  return (
    <GenresListConsumer>
      {(genresList) => {
        const genreList = [];
        genresList.forEach((genre) => {
          let name;
          for (let i = 0; i < genreIds.length; i++) {
            if (genreIds[i] === genre.id) {
              name = genre.name;
              genreList.push(
                <Text key={genre.id} className="genre" code>
                  {name}
                </Text>
              );
            }
          }
        });

        return (
          <React.Fragment>
            <Image width={183} height={281} src={posterSrc} />
            <div className="film__about">
              <div className="about__header">
                <Title className="header__title" level={5}>
                  {title}
                </Title>
                <Progress
                  className="header__rate"
                  type="circle"
                  percent={0}
                  trailColor={rateColor}
                  format={() => rating}
                  size={36}
                />
              </div>
              <Text className="about__date" type="secondary">
                {date}
              </Text>
              <div className="about__genre">{genreList}</div>
              <Text className="about__description">{description}</Text>
              <Rate
                className="rate"
                allowHalf
                count={10}
                value={+localStorage.getItem(id)}
                onChange={(value) => onRateChange(+id, +value)}
              />
            </div>
          </React.Fragment>
        );
      }}
    </GenresListConsumer>
  );
};

export default FilmView;
