import { OrdersPage } from "./pages/OrdersPage";

function App() {
  return (
    <div className="page-wrapper">
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          <div className="navbar-logo-mark" aria-hidden="true">Gx</div>
          <span className="navbar-brand">Groworx</span>
          <span className="navbar-divider" aria-hidden="true">|</span>
          <span className="navbar-subtitle">ERP Integration Dashboard</span>
        </div>
      </nav>
      <main style={{ flex: 1 }}>
        <OrdersPage />
      </main>
    </div>
  );
}

export default App;
