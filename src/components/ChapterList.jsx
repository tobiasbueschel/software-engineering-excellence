import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

function Chapter({ imageUrl, title, path, description }) {
  const imgUrl = useBaseUrl(imageUrl);

  return (
    <div className="col col--4" style={{ marginBottom: '1rem' }}>
      <div className="card shadow--lw" style={{ height: '100%' }}>
        <div className="card__image text--center">
          <a className="text--center" href={path} target="_self">
            <img src={imgUrl} alt={title} width="80%" height="200" />
          </a>
        </div>
        <div className="card__body">
          <h4>{title}</h4>
          <small>{description}</small>
        </div>
        <div className="card__footer">
          <a href={path} className="button button--primary button--block">
            Read
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ChapterList({ chapters }) {
  const sortedChapters = chapters.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <section>
      <div className="container">
        <div className="row">
          {sortedChapters.map((props, index) => (
            <Chapter key={index} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
