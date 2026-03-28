import { OrdersPage } from "./pages/OrdersPage";

function App() {
  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <header
        style={{
          backgroundColor: "#1d4ed8",
          color: "#fff",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>Groworx</span>
        <span style={{ opacity: 0.7 }}>|</span>
        <span style={{ opacity: 0.9, fontSize: "0.95rem" }}>ERP Integration Dashboard</span>
      </header>
      <main>
        <OrdersPage />
      </main>
    </div>
  );
}

export default App;
