
const PLAYLIST_URL =
  "https://www.youtube.com/watch?v=OwpONLlbidc&list=PLZ_ZMrhn-RDU";


function getPlaylistId(url) {

  try {

    const parsedUrl = new URL(url);

    return parsedUrl.searchParams.get("list");

  } catch (error) {

    console.error("Invalid YouTube playlist URL");

    return null;
  }
}


const PLAYLIST_ID = getPlaylistId(PLAYLIST_URL);




const playBtn = document.getElementById("play-btn");

const playIcon = document.getElementById("play-icon");

const prevBtn = document.getElementById("prev-btn");

const nextBtn = document.getElementById("next-btn");

const progress = document.getElementById("progress");

const progressContainer =
  document.getElementById("progress-container");

const songTitle =
  document.getElementById("song-title");

const artistName =
  document.getElementById("artist-name");

const currentTimeElement =
  document.getElementById("current-time");

const totalTimeElement =
  document.getElementById("total-time");

const playlistPosition =
  document.getElementById("playlist-position");


// =====================================================
// YOUTUBE PLAYER
// =====================================================

let player = null;

let isPlaying = false;


// =====================================================
// FORMAT TIME
// =====================================================

function formatTime(seconds) {

  if (!seconds || isNaN(seconds)) {
    return "0:00";
  }

  seconds = Math.floor(seconds);

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  return (
    minutes +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}


// =====================================================
// UPDATE SONG INFORMATION
// =====================================================

function updateSongInformation() {

  if (!player) {
    return;
  }

  const videoData = player.getVideoData();

  if (!videoData) {
    return;
  }


  // Song title

  if (videoData.title) {

    songTitle.innerText = videoData.title;

  } else {

    songTitle.innerText = "YouTube Song";
  }


  // Artist / Channel

  if (videoData.author) {

    artistName.innerText = videoData.author;

  } else {

    artistName.innerText = "YouTube";
  }


  // Playlist position

  const playlistIndex =
    player.getPlaylistIndex();

  const playlist =
    player.getPlaylist();


  if (
    playlistIndex !== undefined &&
    playlistIndex !== null &&
    playlist
  ) {

    playlistPosition.innerText =
      `${playlistIndex + 1} / ${playlist.length}`;

  }
}


// =====================================================
// YOUTUBE API READY
// =====================================================

function onYouTubeIframeAPIReady() {

  if (!PLAYLIST_ID) {

    songTitle.innerText =
      "Invalid YouTube Playlist";

    artistName.innerText =
      "Please check your playlist URL";

    return;
  }


  // Create YouTube Player

  player = new YT.Player("youtube-player", {

    height: "1",

    width: "1",

    playerVars: {

      // Playlist

      listType: "playlist",

      list: PLAYLIST_ID,

      // Don't autoplay before user clicks Play

      autoplay: 0,

      // YouTube controls hidden

      controls: 0,

      // Branding

      modestbranding: 1,

      // Enable JS API

      enablejsapi: 1,

      // Start from first video

      index: 0,

      // Loop playlist

      loop: 1,

      // Current site's origin

      origin: window.location.origin
    },


    events: {

      onReady: onPlayerReady,

      onStateChange: onPlayerStateChange,

      onError: onPlayerError
    }

  });

}


// =====================================================
// PLAYER READY
// =====================================================

function onPlayerReady() {

  console.log("YouTube Player Ready");

  updateSongInformation();

  updatePlaylistInfo();

  updateProgress();
}


// =====================================================
// PLAYER STATE CHANGE
// =====================================================

function onPlayerStateChange(event) {

  // PLAYING

  if (event.data === YT.PlayerState.PLAYING) {

    isPlaying = true;

    setPlayIcon(true);

    updateSongInformation();

    updatePlaylistInfo();
  }


  // PAUSED

  else if (event.data === YT.PlayerState.PAUSED) {

    isPlaying = false;

    setPlayIcon(false);
  }


  // ENDED

  else if (event.data === YT.PlayerState.ENDED) {

    isPlaying = false;

    setPlayIcon(false);

    /*
      YouTube playlist normally moves to the next
      video automatically.

      If it doesn't, call nextVideo().
    */

    setTimeout(() => {

      const state = player.getPlayerState();

      if (state === YT.PlayerState.ENDED) {

        nextSong();

      }

    }, 500);
  }


  // BUFFERING

  else if (event.data === YT.PlayerState.BUFFERING) {

    updateSongInformation();

    updatePlaylistInfo();
  }
}


// =====================================================
// PLAYER ERROR
// =====================================================

function onPlayerError(event) {

  console.log(
    "YouTube Player Error:",
    event.data
  );
}


// =====================================================
// PLAY
// =====================================================

function playSong() {

  if (!player) {
    return;
  }

  player.playVideo();

  isPlaying = true;

  setPlayIcon(true);
}


// =====================================================
// PAUSE
// =====================================================

function pauseSong() {

  if (!player) {
    return;
  }

  player.pauseVideo();

  isPlaying = false;

  setPlayIcon(false);
}


// =====================================================
// PLAY / PAUSE BUTTON ICON
// =====================================================

function setPlayIcon(playing) {

  if (playing) {

    playIcon.classList.remove("fa-play");

    playIcon.classList.add("fa-pause");

  } else {

    playIcon.classList.remove("fa-pause");

    playIcon.classList.add("fa-play");
  }
}


// =====================================================
// NEXT SONG
// =====================================================

function nextSong() {

  if (!player) {
    return;
  }

  player.nextVideo();

  isPlaying = true;

  setPlayIcon(true);

  setTimeout(() => {

    updateSongInformation();

    updatePlaylistInfo();

  }, 300);
}


// =====================================================
// PREVIOUS SONG
// =====================================================

function previousSong() {

  if (!player) {
    return;
  }

  player.previousVideo();

  isPlaying = true;

  setPlayIcon(true);

  setTimeout(() => {

    updateSongInformation();

    updatePlaylistInfo();

  }, 300);
}


// =====================================================
// PLAY / PAUSE BUTTON
// =====================================================

playBtn.addEventListener("click", () => {

  if (!player) {
    return;
  }

  if (isPlaying) {

    pauseSong();

  } else {

    playSong();
  }

});


// =====================================================
// NEXT BUTTON
// =====================================================

nextBtn.addEventListener("click", () => {

  nextSong();

});


// =====================================================
// PREVIOUS BUTTON
// =====================================================

prevBtn.addEventListener("click", () => {

  previousSong();

});


// =====================================================
// UPDATE PROGRESS
// =====================================================

function updateProgress() {

  if (!player) {
    return;
  }

  try {

    const duration =
      player.getDuration();

    const currentTime =
      player.getCurrentTime();


    if (duration > 0) {

      const percentage =
        (currentTime / duration) * 100;

      progress.style.width =
        `${percentage}%`;

      currentTimeElement.innerText =
        formatTime(currentTime);

      totalTimeElement.innerText =
        formatTime(duration);
    }

  } catch (error) {

    // Player may not be ready yet

  }
}


// =====================================================
// PROGRESS UPDATE LOOP
// =====================================================

setInterval(() => {

  if (player) {

    updateProgress();

  }

}, 500);


// =====================================================
// SEEK
// =====================================================

progressContainer.addEventListener("click", (event) => {

  if (!player) {
    return;
  }


  const width =
    progressContainer.clientWidth;


  const clickX =
    event.offsetX;


  const duration =
    player.getDuration();


  if (duration > 0) {

    const newTime =
      (clickX / width) * duration;


    player.seekTo(newTime, true);

  }

});


// =====================================================
// UPDATE PLAYLIST INFO
// =====================================================

function updatePlaylistInfo() {

  if (!player) {
    return;
  }


  try {

    const playlist =
      player.getPlaylist();

    const index =
      player.getPlaylistIndex();


    if (
      playlist &&
      index !== undefined &&
      index !== null
    ) {

      playlistPosition.innerText =
        `${index + 1} / ${playlist.length}`;

    }

  } catch (error) {

    console.log(
      "Playlist information not available yet."
    );
  }
}