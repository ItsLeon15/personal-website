const LASTFM_API_URL = "https://api.itsleon.io/api/lastfm";
const FALLBACK_ALBUM_IMAGE = "images/fallback-album.webp";

function setFallbackAlbumImage(albumImage) {
	albumImage.onerror = null;
	albumImage.src = FALLBACK_ALBUM_IMAGE;
	albumImage.alt = "Fallback album artwork";
	albumImage.hidden = false;
	albumImage.classList.add("fallback-album");
}

function setLastFmError(message) {
	const lastFm = document.querySelector("#lastfm");
	const lastFmState = document.querySelector("#lastFmState");
	const trackName = document.querySelector("#trackName");
	const trackTime = document.querySelector("#trackTime");
	const artistName = document.querySelector("#artistName");
	const albumImage = document.querySelector("#albumImage");

	if (lastFm) lastFm.dataset.state = "Offline";
	if (lastFmState) lastFmState.textContent = "Offline";
	if (trackName) trackName.textContent = message;
	if (trackTime) trackTime.textContent = "";
	if (artistName) artistName.textContent = "No track info found";
	if (albumImage) setFallbackAlbumImage(albumImage);
}

function renderLastFmTrack(data) {
	const lastFm = document.querySelector("#lastfm");
	const lastFmState = document.querySelector("#lastFmState");
	const trackName = document.querySelector("#trackName");
	const trackTime = document.querySelector("#trackTime");
	const artistName = document.querySelector("#artistName");
	const albumImage = document.querySelector("#albumImage");
	const lastFmProfile = document.querySelector("#lastFmProfile");
	const lastFmLink = document.querySelector("#lastfm-link");

	if (lastFm) lastFm.dataset.state = data.state || "Offline";
	if (lastFmState) lastFmState.textContent = data.statusText || "Offline";
	if (trackName) trackName.textContent = data.trackName || "Unknown track";
	if (trackTime) trackTime.textContent = data.trackTime || "";
	if (artistName) artistName.textContent = data.artistName || "Unknown artist";
	if (lastFmProfile && data.profileUrl) lastFmProfile.href = data.profileUrl;
	if (lastFmLink && data.trackUrl) lastFmLink.href = data.trackUrl;

	if (!albumImage) {
		return;
	}

	albumImage.onerror = function () {
		setFallbackAlbumImage(albumImage);
	};

	if (!data.albumImage) {
		setFallbackAlbumImage(albumImage);
		return;
	}

	albumImage.src = data.albumImage;
	albumImage.alt = `${data.trackName || "Last.fm"} artwork`;
	albumImage.hidden = false;
	albumImage.classList.remove("fallback-album");
}

async function loadLastFm() {
	try {
		const response = await fetch(LASTFM_API_URL, {
			method: "GET",
			headers: {
				"Accept": "application/json",
			},
		});

		if (!response.ok) {
			new Error("Last.fm request failed");
		}

		const data = await response.json();

		renderLastFmTrack(data);
	} catch {
		setLastFmError("API did not respond");
	}
}

loadLastFm().then(r => r);

setInterval(loadLastFm, 60000);