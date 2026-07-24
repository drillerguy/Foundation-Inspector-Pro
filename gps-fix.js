(() => {
  let fallbackTimer = null;
  let lastFixTime = 0;
  const locate = document.getElementById('locate');
  if (!locate || !navigator.geolocation || typeof updateGPS !== 'function') return;

  function showStatus(text) {
    let el = document.getElementById('gpsStatus');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gpsStatus';
      el.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:40;background:#fff;padding:7px 9px;border-radius:9px;box-shadow:0 2px 10px #0003;font:12px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      document.body.appendChild(el);
    }
    el.textContent = text;
  }

  function onFix(p) {
    lastFixTime = Date.now();
    updateGPS(p);
    showStatus(`GPS updated ${new Date().toLocaleTimeString()} · ±${Math.round(p.coords.accuracy)} ft`);
  }

  function onError(e) {
    if (typeof geoError === 'function') geoError(e);
    showStatus(`GPS error: ${e.message || e.code}`);
  }

  function stopTracking() {
    if (window.watchId != null) {
      navigator.geolocation.clearWatch(window.watchId);
      window.watchId = null;
    }
    if (fallbackTimer) {
      clearInterval(fallbackTimer);
      fallbackTimer = null;
    }
    locate.textContent = 'Start Blue Dot';
    showStatus('GPS stopped');
  }

  function startTracking() {
    stopTracking();
    locate.textContent = 'Stop Blue Dot';
    showStatus('Starting GPS…');

    navigator.geolocation.getCurrentPosition(onFix, onError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000
    });

    window.watchId = navigator.geolocation.watchPosition(onFix, onError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000
    });

    fallbackTimer = setInterval(() => {
      if (Date.now() - lastFixTime > 4000) {
        navigator.geolocation.getCurrentPosition(onFix, onError, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000
        });
      }
    }, 5000);
  }

  locate.onclick = () => {
    if (window.watchId != null || fallbackTimer) stopTracking();
    else startTracking();
  };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && locate.textContent === 'Stop Blue Dot') startTracking();
  });

  showStatus('GPS fix loaded');
})();