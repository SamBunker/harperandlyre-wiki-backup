import { Route, Routes } from "react-router-dom";
import { Nav } from "./components/Nav";
import { Sidebar } from "./components/Sidebar";
import { PageList } from "./pages/PageList";
import { WikiPage } from "./pages/WikiPage";
import { EditPage } from "./pages/EditPage";
import { NewPage } from "./pages/NewPage";
import { History } from "./pages/History";
import { CategoryPage } from "./pages/CategoryPage";
import { SearchResults } from "./pages/SearchResults";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Nav />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<PageList />} />
            <Route path="/new" element={<NewPage />} />
            <Route path="/wiki/:slug" element={<WikiPage />} />
            <Route path="/wiki/:slug/edit" element={<EditPage />} />
            <Route path="/wiki/:slug/history" element={<History />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
