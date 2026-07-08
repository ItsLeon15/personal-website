function updateClock() {
	const clock = document.querySelector("#clock");
	const now = new Date();

	const time = now.toLocaleTimeString();
	const day = now.getDay();

	const humanReadableDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	const dayName = humanReadableDay[day];

	clock.textContent = dayName + " " + time;
}

updateClock();

setInterval(updateClock, 1000 * 30);