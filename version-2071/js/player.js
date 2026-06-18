var hlsModulePromise = null;

function loadHlsModule() {
  if (!hlsModulePromise) {
    hlsModulePromise = import(new URL('./hls.js', import.meta.url).href);
  }
  return hlsModulePromise;
}

async function bindStream(video, source) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.load();
    return;
  }

  var module = await loadHlsModule();
  var Hls = module.H || module.default || window.Hls;
  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video._hls = hls;
    return;
  }

  video.src = source;
  video.load();
}

async function startPlayer(shell) {
  var video = shell.querySelector('video');
  var overlay = shell.querySelector('[data-play-button]');
  var source = shell.getAttribute('data-stream');

  if (!video || !source) {
    return;
  }

  if (!shell.dataset.started) {
    shell.dataset.started = 'true';
    await bindStream(video, source);
  }

  if (overlay) {
    overlay.classList.add('is-hidden');
  }

  video.controls = true;
  var playResult = video.play();
  if (playResult && typeof playResult.catch === 'function') {
    playResult.catch(function () {});
  }
}

document.querySelectorAll('[data-player]').forEach(function (shell) {
  var overlay = shell.querySelector('[data-play-button]');
  var video = shell.querySelector('video');

  if (overlay) {
    overlay.addEventListener('click', function () {
      startPlayer(shell);
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!shell.dataset.started) {
        startPlayer(shell);
      }
    });
  }
});
