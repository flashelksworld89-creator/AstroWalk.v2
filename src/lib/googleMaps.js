let pending;

export function loadGoogleMaps(key) {
  if (!key) return Promise.reject(new Error('Street View has not been connected yet.'));
  if (window.google?.maps?.StreetViewPanorama) return Promise.resolve(window.google.maps);
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => fail('Street View took too long to load. Check your connection and retry.'), 20000);
    function fail(message) {
      clearTimeout(timer);
      script.remove();
      pending = null;
      reject(new Error(message));
    }
    window.gm_authFailure = () => {
      window.dispatchEvent(new Event('astrowalk-maps-auth-error'));
      fail('Google rejected the Street View connection. Check the key, API access, billing and allowed website domains.');
    };
    window.astroWalkMapsReady = () => {
      clearTimeout(timer);
      if (window.google?.maps?.StreetViewPanorama) resolve(window.google.maps);
      else fail('Google Street View is unavailable.');
    };
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({key, callback:'astroWalkMapsReady', loading:'async', v:'quarterly'})}`;
    script.async = true;
    script.onerror = () => fail('Could not connect to Google Street View. Check your connection and retry.');
    document.head.appendChild(script);
  });
  return pending;
}
