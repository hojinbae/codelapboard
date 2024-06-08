// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// const navigate = useNavigate();
// import axios from 'axios';
$(document).ready(function chatBotInit() {

    setTimeout(function() {
        // 여기에 실행할 코드 작성

    const chatContainer = $('.chat-container');
    const chatBody = $('.chat-body');
    let CATEGORY_STATUS = 1;
    let level1_category = 1;
    let ttsEnabled = false;
    const data = {
        'level1': [
            {
                'name': '중부',
                'number': 1,
                'message': '<br>아래에서 주제를 선택해주세요:<p>',
                'level2': [
                    {
                        'name': '경기',
                        'number': 1,
                        'message': '<br> 상세정보를 보여드립니다.<p>'
                    },
                    {
                        'name': '서울',
                        'number': 2,
                        'message': '<br> 상세정보를 보여드립니다.<p>'
                    },
                    {
                        'name': '인천',
                        'number': 3,
                        'message': '<br>상세정보를 보여드립니다.<p>'
                    },
                    {
                        'name': '상위메뉴',
                        'number': 0,
                        'message': '<br> 상위 메뉴로 이동합니다. </p>'
                    }
                ]
            },
            {
                'name': '남부',
                'number': 2,
                'message': '<br>아래에서 주제를 선택해주세요:<p>',
                'level2': [
                    {
                        'name': '전라북도',
                        'number': 1,
                        'message': '<br> 상세정보를 보여드립니다.<p>'
                    },
                    {
                        'name': '경상북도',
                        'number': 2,
                        'message': '<br> 상세정보를 보여드립니다.<p>'
                    },
                    {
                        'name': '광주',
                        'number': 3,
                        'message': '<br> 상세정보를 보여드립니다.<p>'
                    },
                    {
                        'name': '상위메뉴',
                        'number': 0,
                        'message': '<br> 상위 메뉴로 이동합니다. </p>'
                    }
                ]
            }
        ]
    };

    // STT (음성 인식) 추가
    function startSpeechRecognition() {
        // 웹 음성 인식을 시작합니다.
        // 브라우저가 지원하는 내장 웹 API
        const recognition = new webkitSpeechRecognition();

        // 언어를 한국어로 설정합니다.
        recognition.lang = 'ko-KR';

        // 인식 결과가 나오면 실행될 동작을 정의합니다.
        recognition.onresult = function(event) {
            // 첫 번째 결과의 첫 번째 대안에서 전사를 추출합니다.
            const result = event.results[0][0].transcript;
            const resultWithoutSpaces = result.replace(/\s/g, '');

            // 추출된 텍스트를 sendMessage 함수로 전송합니다.
            sendMessage(resultWithoutSpaces);
        }

        // 음성 인식을 시작합니다.
        // 음성이 없으면 자동으로 recognition.stop()이 호출된다.
        recognition.start();
    }

    function textToSpeech(message){
        const speech = new SpeechSynthesisUtterance();
        speech.text=message;
        window.speechSynthesis.speak(speech);
    }
    function phoneTextToSpeech(message){
        // HTML 태그를 제거하기 위해 임시적으로 DOM을 생성합니다.
        // const temporaryElement = $('<div></div>').html(message);
        //
        // // p 태그를 모두 찾아내어 제거합니다.
        // temporaryElement.find('p').remove();
        //
        // // br 태그를 모두 찾아내어 제거합니다.
        // temporaryElement.find('br').remove();

        // innerText를 사용하여 HTML 태그를 제거한 텍스트를 가져옵니다.
        // const cleanedMessage = temporaryElement.text();
        const cleanedMessage = message.replace(/<[^>]*>/g,'')
        textToSpeech(cleanedMessage)
    }

    // 메세지를 화면에 추가
    function appendMessage(sender, message) {
        let styleCode
        // alert(sender)
        if(sender ==="<br>Chatbot" || sender==="Chatbot" || sender==="Chatbot<br>"){
            styleCode="margin-left: 0"
            // alert(styleCode)
        }else{
            styleCode="margin-left:0; text-align: right; width:100%"
        }
        // alert(message)

        const messageElement = $('<div style="text-align: left"></div>').html(`<p style="${styleCode}"><strong>${sender}:</strong> ${message}`);
        chatContainer.append(messageElement);
        chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
        if(ttsEnabled){
            phoneTextToSpeech(message)
        }


        console.log(message)
    }

    // 초기 환영 메세지 출력
    function showWelcomeMessage() {

        let message = '<br>코드랩 쇼핑몰에 오신 것을 환영합니다.' +
            '<br>저희 쇼핑몰은 신발, 의류 전문몰입니다.' +
            '<br>아래 주제에 대해서 문의해주세요.<p style="margin-left: 0">';

        // 데이터 객체에서 카테고리 정보를 가져와서 메시지에 추가
        data.level1.forEach(function (category) {
            message += ` ${category.number}. ${category.name}<br>`;
        });

        appendMessage('<br>Chatbot', message);
        // textToSpeech(message)
    }

    function findByKeyword(found, userMessage) {
        for (const category of data.level1) {
            if (found)
                break;
            if (category.name.includes(userMessage)) {
                found = true;
                appendMessage('Chatbot', category.message);
                showSubCategories(category); // 수정된 부분
                CATEGORY_STATUS = 2;
                level1_category = category.number;

            } else {
                for (const subCategory of category.level2) {
                    if (found)
                        break;
                    if (userMessage.includes(subCategory.name)) {
                        found = true;
                        appendMessage('Chatbot', subCategory.message);
                        showSubCategories(category)
                        // alert(category)
                    } else if (userMessage === '상위메뉴' || userMessage === '상위 메뉴') {
                        found = true;
                        showWelcomeMessage();
                        break;
                    }
                }
            }
        }
        return found;
    }

    async function findByNumber(userMessage) {
        // 상위 카테고리에 대한 처리
        if (CATEGORY_STATUS === 1) {
            level1_category = parseInt(userMessage);
            // !isNaN(level1_category): 숫자인 조건
            // level1_category >= 1 && level1_category <= data.level1.length: 숫자가 카테고리 메뉴 갯수 범위에 드는 조건
            if (!isNaN(level1_category) && level1_category >= 1 && level1_category <= data.level1.length) {
                const category = data.level1[level1_category - 1];
                showSubCategories(category);

                CATEGORY_STATUS = 2;
            } else {
                // 다른 키워드에 대한 기본 응답
                // alert(userMessage)
                // const response = await axios.get('http://localhost:3000/findcode');
                // const result = response.data;



                setTimeout(function () {
                    appendMessage('Chatbot', '안녕하세요! 다른 도움이 필요하신가요?<br>');
                }, 500);
            }
        }
        // 최종 메세지에 대한 처리
        else if (CATEGORY_STATUS === 2) {
            const selectedCategory = parseInt(userMessage);
            const subCategories = data.level1[level1_category - 1].level2;
            if (!isNaN(selectedCategory) && selectedCategory >= 1 && selectedCategory <= subCategories.length) {
                const category = subCategories[selectedCategory - 1];
                // 별도의 서브카테고리 메세지를 출력하는 메소드 대신,
                // 해당 카테고리에서 정의된 메세지를 그대로 출력
                // category.message.push("<a href='/festival'>이동하기</a>")
                appendMessage('Chatbot', category.message+"<a href='/festival'>이동하기</Link>");
                // appendMessage("Chatbot","<a href='/festival'>이동하기</a>")
                CATEGORY_STATUS = 2;
                // alert(category.message)
                showSubCategories(data.level1[level1_category - 1]);
            } else if (userMessage === '0') {
                showWelcomeMessage(); // 딕셔너리 구조 레벨에 맞는 메세지를 출력하기 때문에 하위 조건을 더 간단히 한다.
                CATEGORY_STATUS = 1;
            } else {
                // 다른 키워드에 대한 기본 응답
                appendMessage('<br>Chatbot', '<br>죄송합니다. 입력하신 정보로는 처리할 수 없습니다.<br>');
            }
        }
    }

// 사용자 메시지 처리 및 응답
    function sendMessage(userMessage) {
        appendMessage('User', userMessage);

        let found = false;
        // 상위 및 하위 카테고리를 찾았는지 유무를 저장하는 상태변수
        // 해당 상위 카테고리를 찾지 못했을 경우 다른 안내 메세지 처리를 위한 용도

        // 키워드 검색 방식
        found = findByKeyword(found, userMessage);

        // 메뉴 번호 검색 방식
        if (!found){
            findByNumber(userMessage);

        }

        // if (!found) {
        //     // 다른 키워드에 대한 기본 응답
        //     appendMessage('Chatbot', '죄송합니다. 입력하신 정보로는 처리할 수 없습니다.<br>');
        // }

        userInput.val('');
    }


    // 하위 카테고리 출력
    function showSubCategories(category) {
        setTimeout(function () {
            let message = '<br>';
            for (let i = 0; i < category.level2.length; i++) {
                message += `${category.level2[i].number}.  ${category.level2[i].name}<br>`;
                // chatContainer.append(`${category.level2[i].number}. ${category.level2[i].name}<br>`);

            }
            // chatContainer.append(`<div style="text-align:left"> ${message}</div>`);
            appendMessage("Chatbot",message)
            // alert(message)
            if(ttsEnabled){
                phoneTextToSpeech(message)
            }
            //chatContainer 에 하나의 메세지로 갱신한다
            //하나의 메세지에 대해 음성 서비스를 제공한다.
            chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
        }, 500);

        // for (let i = 0; i < category.level2.length; i++) {
        //     chatContainer.append(`${category.level2[i].number}. ${category.level2[i].name}<br>`);
        // }
        // chatContainer.scrollTop(chatContainer.prop('scrollHeight'));
    }
    // 초기 환영 메시지 출력
    showWelcomeMessage();

    // let chatBody = document.getElementsByClassName('chat-body')

    // 입력창과 전송 버튼 생성
    let inputContainer = $('<div id="input-container"></div>').appendTo(chatBody);
    let userInput = $('<input type="text" id="user-input" placeholder="메시지를 입력하세요">').appendTo(inputContainer);
    let sendBtn = $('<button id="send-btn">전송</button>').appendTo(inputContainer);
    let speechBtn = $('<button id="speech-btn">음성 입력</button>').appendTo(inputContainer); // 음성 입력 버튼 추가
    let ttsCheckboxContainer = $('<div id="tts-checkbox-container"></div>').appendTo(inputContainer);
    let ttsLabel = $('<label for="tts-radio">TTS On/Off:</label>').appendTo(ttsCheckboxContainer);
    let ttsCheckbox = $('<input type="checkbox" id="tts-checkbox" name="tts" value="tts-on">').appendTo(ttsCheckboxContainer);
    // 전송 버튼 클릭 이벤트
    sendBtn.click(function () {
        const userMessage = userInput.val();
        sendMessage(userMessage);
    });

    // 엔터 키 입력 이벤트
    userInput.keypress(function (event) {
        if (event.which === 13) {
            const userMessage = userInput.val();
            sendMessage(userMessage);
        }
    });

    // 음성 입력 버튼 클릭 이벤트
    speechBtn.click(function() {
        startSpeechRecognition();
    });

    ttsCheckbox.change(function() {
        ttsEnabled = $('#tts-checkbox').prop('checked');
        console.log('TTS Enabled:', ttsEnabled);
    });
    }, 1000);
});
