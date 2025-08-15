export default function MainHeader() {
    return (
    // header
        <header className="apple-navbar">
            <nav>
                <ul>
                    {/* 애플로고 */}
                    <li>
                        <a href="#" className="apple-logo" aria-label="Apple"> 
                            <svg width="20" height="20" viewBox="0 0 17 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.218 10.292c-.024-2.347 1.912-3.471 2-3.524-1.09-1.59-2.79-1.809-3.39-1.829-1.44-.146-2.807.847-3.537.847-.73 0-1.866-.827-3.068-.805-1.579.024-3.041.917-3.854 2.337-1.637 2.84-.417 7.033 1.173 9.335.778 1.12 1.705 2.38 2.926 2.336 1.176-.048 1.62-.757 3.043-.757 1.421 0 1.82.757 3.067.73 1.27-.02 2.073-1.14 2.847-2.267.894-1.3 1.261-2.561 1.281-2.625-.03-.012-2.45-.937-2.475-3.468zm-2.32-6.56c.645-.79 1.082-1.89.963-2.992-.93.037-2.06.616-2.73 1.405-.598.695-1.12 1.81-.982 2.87 1.037.08 2.104-.524 2.75-1.283z"/>
                            </svg>
                        </a>
                    </li>

                    {/* 메뉴 항목 */}
                    <li><a href="#">스토어</a></li>
                    <li><a href="#">Mac</a></li>
                    <li><a href="#">iPad</a></li>
                    <li><a href="#">iPhone</a></li>
                    <li><a href="#">Watch</a></li>
                    <li><a href="#">Vision</a></li>
                    <li><a href="#">AirPods</a></li>
                    <li><a href="#">TV 및 홈</a></li>
                    <li><a href="#">엔터테인먼트</a></li>
                    <li><a href="#">악세서리</a></li>
                    <li><a href="#">고객지원</a></li>

                    {/* 검색 아이콘 */}
                    <li>
                        <a href="#" aria-label="Search">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21.53 20.47l-5.73-5.73a7.5 7.5 0 10-1.06 1.06l5.73 5.73a.75.75 0 101.06-1.06zM10.5 17a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"></path>
                            </svg>
                        </a>
                    </li>

                    {/* 장바구니 아이콘 */}
                    <li>
                        <a href="#" aria-label="Shopping Bag">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 7V6a6 6 0 1112 0v1h3a1 1 0 011 1v13a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1h3zm2 0h8V6a4 4 0 10-8 0v1z"></path>
                            </svg>
                        </a>
                    </li>
                </ul>
            </nav>

            {/* 장바구니 아이콘 메뉴바 */}
            {/* <div className="shopping-menu" id="shoppingMenu">
                <h4>장바구니가 비어 있습니다.</h4>
                <p>저장해둔 항목이 있는지 확인하려면 <a href="login.html">로그인</a>하세요</p>
            </div> */}
        </header>
    );
}