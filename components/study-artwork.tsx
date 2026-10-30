/** Hình trang trí bằng CSS, không phải bài học hay số liệu mẫu. */
export function StudyArtwork() {
  return (
    <div className="study-artwork reveal" aria-hidden="true">
      <div className="art-sun" />
      <div className="art-window">
        <span />
        <span />
        <span />
      </div>
      <div className="art-cloud art-cloud-one" />
      <div className="art-cloud art-cloud-two" />
      <div className="art-branch">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="art-table" />
      <div className="art-book art-book-back">
        <span className="art-book-title">ENG</span>
        <small>ENGLISH LANGUAGE</small>
      </div>
      <div className="art-book art-book-front">
        <span className="art-book-title">A</span>
        <small>MỖI NGÀY MỘT CHÚT</small>
        <div className="art-book-line" />
      </div>
      <div className="art-open-book">
        <span className="text-sm font-bold">Hello</span>
        <span className="text-sm font-bold">World</span>
      </div>
      <div className="art-teacup">
        <span />
      </div>
      <div className="art-caption">
        <span className="art-seal text-lg font-bold">EN</span>
        <span>
          Một ngôn ngữ mới.
          <br />
          <strong>Một thế giới rộng hơn.</strong>
        </span>
      </div>
    </div>
  );
}
