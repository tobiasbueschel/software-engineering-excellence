import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './ChapterList.module.css';

function Chapter({ imageUrl, title, path, description }) {
  const imgUrl = useBaseUrl(imageUrl);

  return (
    <div className={styles.chapterCol}>
      <a href={path} className={styles.chapterCard} target="_self">
        <div className={styles.cardInner}>
          <div className={styles.imageContainer}>
            <img src={imgUrl} alt={title} className={styles.chapterImage} />
            <div className={styles.imageOverlay}>
              <span className={styles.readMore}>Read More →</span>
            </div>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardDescription}>{description}</p>
          </div>
        </div>
      </a>
    </div>
  );
}

export default function ChapterList({ chapters }) {
  const sortedChapters = chapters.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <section className={styles.chapterSection}>
      <div className={styles.chapterGrid}>
        {sortedChapters.map((props, index) => (
          <Chapter key={index} {...props} />
        ))}
      </div>
    </section>
  );
}
