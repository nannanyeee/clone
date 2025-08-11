document.addEventListener("DOMContentLoaded", function(){
    // DOM 요소 접근(정의)
    const header = document.getElementsByIdClassName("header")[0]; //s라서 배열처럼 다수의 값으로 생각 ->
    const nav = document.getElementsByClassName("navigation");
    const nav_ul = document.getElementsByTagName("ul")[0];
    const first_btn = document.getElementsByClassName("btn")[0];

    // DOM 요소 생성(속성)
    let newAttribute = document.createAttribute("style");
    newAttribute.value = "color:black";
    header.setAttibuteNode(newAttribute);

    // DOM 요소 생성(자식 노드)
    let newList = document.createElement("li"); //1. 가상의 공간에 li 생성 
    let newContent = document.createTextNode("새로운 메뉴"); //2. 텍스트 생성  ->element에 text 넣기

    newList.appendChild(newContent); //3. element에 text 넣기
    nav_ul.appendChild(newList); 

    //이벤트 리스너
    first_btn.addEventListener("click", function() {
        alert("버튼이 클릭되었습니다.")
    }) //->add하면 remove까지 
    first_btn.removeEventListener("click", function() {
        alert("버튼이 클릭되었습니다.")
    })

});