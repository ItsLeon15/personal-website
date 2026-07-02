const LASTFM_USERNAME = "Leon1273";
const LASTFM_API_KEY = "9161fb4c155dd1fb01a0396c328bd1ea";

function updateClock() {
	const clock = document.querySelector("#clock");
	const now = new Date();

	clock.textContent = "Current time: " + now.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getLargestLastFmImage(images) {
	if (!Array.isArray(images)) {
		return null;
	}

	const usableImages = images
		.map((image) => image["#text"])
		.filter(Boolean);

	return usableImages.at(-1) ?? null;
}

function formatTrackLength(duration) {
	const milliseconds = Number(duration);

	if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
		return null;
	}

	const totalSeconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function setLastFmError(message) {
	const lastFmState = document.querySelector("#lastFmState");
	const trackName = document.querySelector("#trackName");
	const trackTime = document.querySelector("#trackTime");
	const artistName = document.querySelector("#artistName");
	const albumImage = document.querySelector("#albumImage");

	lastFmState.textContent = "offline";
	trackName.textContent = message;
	trackTime.textContent = null;
	artistName.textContent = "could not load scrobbles";
	albumImage.removeAttribute("src");
	albumImage.hidden = true;
}

async function getLastFmTrackLength(track) {
	const artist = track.artist?.["#text"];
	const trackName = track.name;

	if (!artist || !trackName) {
		return null;
	}

	const url = new URL("https://ws.audioscrobbler.com/2.0/");

	url.searchParams.set("method", "track.getInfo");
	url.searchParams.set("artist", artist);
	url.searchParams.set("track", trackName);
	url.searchParams.set("username", LASTFM_USERNAME);
	url.searchParams.set("api_key", LASTFM_API_KEY);
	url.searchParams.set("format", "json");
	url.searchParams.set("autocorrect", "1");

	const response = await fetch(url.toString());

	if (!response.ok) {
		return null;
	}

	const data = await response.json();

	return formatTrackLength(data?.track?.duration);
}

const FALLBACK_ALBUM_IMAGE = "images/fallback-album.webp";

function setFallbackAlbumImage(albumImage) {
	albumImage.onerror = null;
	albumImage.src = FALLBACK_ALBUM_IMAGE;
	albumImage.alt = "Fallback album artwork";
	albumImage.hidden = false;
	albumImage.classList.add("fallback-album");
}

function renderLastFmTrack(track, trackLength) {
	const lastFmState = document.querySelector("#lastFmState");
	const trackName = document.querySelector("#trackName");
	const trackTime = document.querySelector("#trackTime");
	const artistName = document.querySelector("#artistName");
	const albumImage = document.querySelector("#albumImage");
	const lastFmProfile = document.querySelector("#lastFmProfile");
	const lastFmLink = document.querySelector("#lastfm-link");

	const isNowPlaying = track["@attr"]?.nowplaying === "true";
	const imageUrl = getLargestLastFmImage(track.image);
	const trackUrl = track.url || `https://www.last.fm/user/${LASTFM_USERNAME}`;

	lastFmState.textContent = isNowPlaying ? "now playing" : "most recent song";
	trackName.textContent = track.name || "Unknown track";
	trackTime.textContent = trackLength ? `${trackLength}` : null;
	artistName.textContent = track.artist?.["#text"] || "Unknown artist";
	lastFmProfile.href = `https://www.last.fm/user/${LASTFM_USERNAME}`;
	lastFmLink.href = trackUrl;

	albumImage.onerror = function () {
		setFallbackAlbumImage(albumImage);
	};

	if (imageUrl) {
		if (imageUrl === "https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png") {
			setFallbackAlbumImage(albumImage);
			return;
		}

		albumImage.src = imageUrl;
		albumImage.alt = `${trackName.textContent} artwork`;
		albumImage.hidden = false;
		albumImage.classList.remove("fallback-album");
	} else {
		setFallbackAlbumImage(albumImage);
	}
}

async function loadLastFm() {
	if (!LASTFM_USERNAME || !LASTFM_API_KEY) {
		setLastFmError("set your Last.fm details");
		return;
	}

	const url = new URL("https://ws.audioscrobbler.com/2.0/");

	url.searchParams.set("method", "user.getrecenttracks");
	url.searchParams.set("user", LASTFM_USERNAME);
	url.searchParams.set("api_key", LASTFM_API_KEY);
	url.searchParams.set("format", "json");
	url.searchParams.set("limit", "1");

	try {
		const response = await fetch(url.toString());

		if (!response.ok) {
			new Error("Last.fm request failed");
		}

		const data = await response.json();
		const track = data?.recenttracks?.track?.[0];

		if (!track) {
			setLastFmError("no recent tracks found");
			return;
		}

		const trackLength = await getLastFmTrackLength(track);

		renderLastFmTrack(track, trackLength);
	} catch {
		setLastFmError("last.fm did not respond");
	}
}

updateClock();
loadLastFm();

setInterval(updateClock, 1000 * 30);
setInterval(loadLastFm, 1000 * 60);