import React, { useRef, useEffect, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const Map = ({ center, zoom, onClick, markers = [], setLoadError }) => {
  const ref = useRef();
  const [map, setMap] = useState();
  const [leafletActive, setLeafletActive] = useState(false);
  const leafletRef = useRef();

  useEffect(() => {
    if (ref.current && !map && window.google && window.google.maps) {
      setMap(new window.google.maps.Map(ref.current, {
        center,
        zoom,
      }));
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);

      // small delay to allow google to render error overlay if auth/billing issue
      const t = setTimeout(() => {
        const err = document.querySelector('.gm-err-container, .gm-err-message');
        if (err) {
          console.error('Google Maps auth/billing error detected.');
          setLoadError && setLoadError(true);
          // activate Leaflet fallback
          setLeafletActive(true);
        }
      }, 600);

      return () => clearTimeout(t);
    }
  }, [map, center, zoom, setLoadError]);

  useEffect(() => {
    if (map && onClick) {
      const listener = map.addListener('click', onClick);
      return () => listener.remove();
    }
  }, [map, onClick]);

  useEffect(() => {
    if (map) {
      // remove existing markers if any by clearing map overlays isn't trivial; create new markers only
      markers.forEach(marker => {
        new window.google.maps.Marker({
          position: marker.position,
          map,
          title: marker.title,
        });
      });
    }
  }, [map, markers]);

  // --- Leaflet fallback: dynamically load CSS/JS and render map when leafletActive is true ---
  useEffect(() => {
    if (!leafletActive) return;

    const L_GLOBAL = 'L';
    const ensureLeaflet = () => {
      return new Promise((resolve, reject) => {
        if (window[L_GLOBAL]) return resolve(window[L_GLOBAL]);

        // load CSS
        if (!document.querySelector('#leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // load script
        if (!document.querySelector('#leaflet-js')) {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          script.onload = () => resolve(window[L_GLOBAL]);
          script.onerror = () => reject(new Error('Failed to load Leaflet'));
          document.body.appendChild(script);
        } else {
          // script already present but L might not be ready yet
          const check = setInterval(() => {
            if (window[L_GLOBAL]) {
              clearInterval(check);
              resolve(window[L_GLOBAL]);
            }
          }, 50);
        }
      });
    };

    let leafletMap;
    ensureLeaflet().then((L) => {
      // create container for leaflet
      if (!leafletRef.current) {
        leafletRef.current = document.createElement('div');
        leafletRef.current.style.width = '100%';
        leafletRef.current.style.height = '400px';
        if (ref.current) {
          // replace google map container with leaflet container
          ref.current.innerHTML = '';
          ref.current.appendChild(leafletRef.current);
        }
      }

      leafletMap = L.map(leafletRef.current).setView([center.lat, center.lng], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap);

      // add markers
      markers.forEach(m => {
        L.marker([m.position.lat, m.position.lng]).addTo(leafletMap).bindPopup(m.title || '');
      });
    }).catch(err => {
      console.error('Leaflet fallback failed', err);
    });

    return () => {
      if (leafletMap && leafletMap.remove) leafletMap.remove();
    };
  }, [leafletActive, center, zoom, markers]);

  return <div ref={ref} style={{ height: '400px', width: '100%' }} />;
};

const MapWrapper = ({ apiKey, center, zoom, onClick, markers }) => {
  const [loadError, setLoadError] = useState(false);

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return <div>Loading map...</div>;
      case Status.FAILURE:
        return <div className="text-red-600">Error loading Google Maps script. Check your API key.</div>;
      case Status.SUCCESS:
        if (!apiKey) {
          return <div className="text-red-600">Missing Google Maps API key. Set VITE_GOOGLE_MAPS_API_KEY in client/.env</div>;
        }
        if (loadError) {
          return (
            <div className="text-red-700">
              <p>Google Maps failed to load correctly (authentication/billing or referer issue).</p>
              <p className="mt-2">Checklist:</p>
              <ul className="list-disc ml-5">
                <li>Ensure API key is correct and present in <strong>client/.env</strong> as <code>VITE_GOOGLE_MAPS_API_KEY</code>.</li>
                <li>Enable Maps JavaScript API and billing in Google Cloud Console.</li>
                <li>If using HTTP localhost during development, either remove referrer restrictions or add <strong>http://localhost</strong> to allowed referrers.</li>
              </ul>
            </div>
          );
        }

        return <Map center={center} zoom={zoom} onClick={onClick} markers={markers} setLoadError={setLoadError} />;
    }
  };

  return (
    <Wrapper apiKey={apiKey} render={render}>
      {/* When Google fails, Map will setLoadError(true) and we render a Leaflet fallback inside Map component */}
    </Wrapper>
  );
};

export default MapWrapper;
