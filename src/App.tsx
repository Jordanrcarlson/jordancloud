import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Albums } from './pages/Albums';
import { AlbumView } from './pages/AlbumView';
import { Personal } from './pages/Personal';
import { Deleted } from './pages/Deleted';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="albums" element={<Albums />} />
          <Route path="albums/:id" element={<AlbumView />} />
          <Route path="personal" element={<Personal />} />
          <Route path="deleted" element={<Deleted />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;