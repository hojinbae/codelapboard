// window.onload = getCurrentLocation();
//
//
//
//
// const weatherIcons = {
//
//     '01d': 'clear-sky-day.png',
//     '01n': 'clear-sky-night.png',
//     '02d': 'few-clouds-day.png',
//     '02n': 'few-clouds-night.png',
//     '03d': 'scattered-clouds.png',
//     '03n': 'scattered-clouds.png',
//     '04d': 'broken-clouds.png',
//     '04n': 'broken-clouds.png',
//     '09d': 'shower-rain.png',
//     '09n': 'shower-rain.png',
//     '10d': 'rain-day.png',
//     '10n': 'rain-night.png',
//     '11d': 'thunderstorm.png',
//     '11n': 'thunderstorm.png',
//     '13d': 'snow.png',
//     '13n': 'snow.png',
//     '50d': 'mist.png',
//     '50n': 'mist.png'
// };
// const getCurrentLocation = ()=>{
//     navigator.geolocation.getCurrentPosition((position) => {
//         let lat = position.coords.latitude;
//         let lon = position.coords.longitude;
//
//         console.log('현재 위치는 ::: ', lat, lon);
//         getWeatherByCurrentLocation(lat,lon);
//
//     })
// }
// getCurrentLocation()
// const getWeatherByCurrentLocation = async (lat, lon)=>{
//     let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=e4da173a465467c2fe1afdf007ebb1f8&units=metric`;
//     let response = await fetch(url);
//     let data = await response.json();
//     displayWeeklyWeather(data);
//     // setWeather(data);
//     console.log("현재날씨는?", data);
// }
//
// function fahrenheitToCelsius(fahrenheit) {
//     console.log(fahrenheit)
//     return fahrenheit - 273.15;
// }
//
// function displayWeeklyWeather(data) {
//     const weeklyForecast = document.getElementById('weekly-forecast');
//     const dailyForecasts = data.list.filter((item, index) => index % 4 === 0); // 각 날짜의 첫번째 예보만 선택
//
//     // dailyForecasts.forEach(forecast => {
//     for(let i = 0; i < dailyForecasts.length; i++){
//
//         let forecast = dailyForecasts[i];
//         const date = new Date(forecast.dt * 1000);
//         const hours = date.getHours(); // 시간 가져오기
//
//         const timeOfDay = hours >= 12 ? '오후' : '오전'; // 오전과 오후 구분
//         const weather = forecast.weather[0].description;
//         const temperatureFahrenheit = forecast.main.temp;
//         const temperatureCelsius = fahrenheitToCelsius(temperatureFahrenheit); // 화씨를 섭씨로 변환
//         const iconCode = forecast.weather[0].icon;
//         const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
//
//         const forecastItem = document.createElement('div');
//         forecastItem.classList.add('forecast-item');
//
//
//         if(hours>=12) {
//             if(i === 0){
//                 forecastItem.innerHTML = `<strong>${date.toLocaleDateString()}</strong> ${timeOfDay}: 온도: ${temperatureCelsius.toFixed(1)}℃`;
//             }else{
//                 forecastItem.innerHTML = `<strong> ${timeOfDay}</strong>: 온도: ${temperatureCelsius.toFixed(1)}℃`;
//                 forecastItem.style.display="inline-block";
//             }
//
//         }else{
//
//             forecastItem.innerHTML = `<strong>${date.toLocaleDateString()}</strong> ${timeOfDay}: 온도: ${temperatureCelsius.toFixed(1)}℃`;
//             forecastItem.style.display="inline-block";
//         }
//         const weatherIcon = document.createElement('img');
//         weatherIcon.src = iconUrl;
//         weatherIcon.alt = '날씨 아이콘';
//         forecastItem.appendChild(weatherIcon);
//
//         weeklyForecast.appendChild(forecastItem);
//     }
// }