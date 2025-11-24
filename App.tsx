import React, { useState, useEffect } from 'react';
import { DesktopView } from './components/DesktopView';
import { MobileView } from './components/MobileView';

function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    // If no hash, default to edit (Desktop)
    if (!window.location.hash) {
        window.location.hash = '#/edit';
    }

    const onHashChange = () => {
      setRoute(window.location.hash);
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const renderRoute = () => {
    if (route.startsWith('#/print')) {
        return <MobileView />;
    }
    // Default to Desktop View
    return <DesktopView />;
  };

  return (
    <>
      {renderRoute()}
    </>
  );
}

export default App;