export default function mainContents() {
    return (
        <>
        {/* main */}
        <main>
            <div className="image-container">
                <img src="/image/hero_iphone_family__fuz5j2v5xx6y_medium_2x.jpg" class="main_image" />
                <div className="text-overlay">
                    <h2 className="headline">iPhone</h2>
                    <p className="subhead">iPhone 16 라인업을 만나볼까요?</p>
                    <div className="cta-links">
                        <a className="button-primary" href="#">더 알아보기</a>
                        <a className="button-tertiary" href="#">쇼핑하기</a>
                    </div>
                    <div className="subhead">
                        <span>Apple Intelligence를 위한 탄생.</span>
                        <p>Apple Intelligence, 현재 한국어로 서비스 중<sup>1</sup></p>
                    </div>
                </div>
            </div>

            <div className="image-container">
                <img src="/image/hero_macbook_air_avail__fpm99qgohx2e_mediumtall_2x.jpg" class="main_image" />
                <div className="text-overlay">
                    <h2 className="headline">MacBook Air</h2>
                    <p className="subhead">하늘빛 새 컬러.</p>
                    <p className="subhead">M4 칩 탑재로 성능도 하늘 높이.</p>
                    <div className="cta-links">
                        <a className="button-primary" href="#">더 알아보기</a>
                        <a className="button-tertiary" href="#">구입하기</a>
                    </div>
                    <div className="subhead">
                        <span>Apple Intelligence를 위한 탄생.</span>
                        <p>Apple Intelligence, 현재 한국어로 서비스 중<sup>1</sup></p>
                    </div>
                </div>
            </div>

            <div className="image-container">
                <img src="/image/hero_apple_watch_series_10_avail_lte__esu66gaw6dci_medium_2x.jpg" class="main_image" />
                <div className="text-overlay">
                    <img src="/image/hero_logo_apple_watch_series_10__dla4dkv1wfue_small_2x.png" class="watch_logo" />
                    <p className="subhead">얇아진 두께. 더 커진 존재감.</p>
                    <div className="cta-links">
                        <a className="button-primary" href="#">더 알아보기</a>
                        <a className="button-tertiary" href="#">구입하기</a>
                    </div>
                </div>
            </div>
        </main>

        </>
    );
}