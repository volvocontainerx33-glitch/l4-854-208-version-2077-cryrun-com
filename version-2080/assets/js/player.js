(function () {
  function initializeHlsPlayer(video) {
    var source = video.getAttribute('data-m3u8');
    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          console.warn('HLS playback error:', data.type, data.details);
        }
      });
      video._hlsInstance = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }
  }

  function bindPlayOverlay(frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }

    function setPlayingState() {
      frame.classList.toggle('is-playing', !video.paused && !video.ended);
    }

    button.addEventListener('click', function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function (error) {
          console.warn('Video play was prevented:', error);
        });
      }
    });

    video.addEventListener('play', setPlayingState);
    video.addEventListener('pause', setPlayingState);
    video.addEventListener('ended', setPlayingState);
    setPlayingState();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var videos = document.querySelectorAll('video[data-m3u8]');
    videos.forEach(initializeHlsPlayer);

    var frames = document.querySelectorAll('.video-frame');
    frames.forEach(bindPlayOverlay);
  });
})();
