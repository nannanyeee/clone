export default function Login() {
    return (
        <>
            <div>
                <h1>더욱 빠르게 결제하시려면 로그인하세요.</h1>
                <form action="/login" method="post">
                    <p>Apple Store에 로그인하세요</p>
                    <input 
                        type="text" 
                        placeholder="이메일 또는 전화번호" 
                        class="login-input"
                    />
                </form>
                <div>
                    <input 
                        type="checkbox" 
                        style="transform: scale(1.5);" 
                        id="rememberMe" 
                        name="rememberMe"
                    />
                    <label for="rememberMe">계정 저장</label>
                </div>
                <div className="help-links">
                    <a href="/forgot-password">암호를 잊으셨습니까?</a>
                    <br />
                    <a href="/forgot-id">Apple 계정 생성</a>
                </div>
            </div>

            {/* footer */}
            <footer>
                <hr/>
                <p>도움이 더 필요하신가요? 지금 채팅하기 또는 080-330-8877 번호로 문의하세요.</p>

            </footer>
        </>
    );

}