import { useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import MarketPage from './pages/MarketPage';
import ArchivePage from './pages/ArchivePage';

function RouteViewport() {
  const { pathname, hash } = useLocation();
  // Outcome selection changes only the query and keeps the reader's place in the field.
  useLayoutEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return (
    <div className="min-h-screen bg-wall text-paper">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/markets/:chainId/:marketId" element={<MarketPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RouteViewport />
    </BrowserRouter>
  );
}
export default App;
