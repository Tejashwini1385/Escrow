// // import React, { useEffect, useState } from "react";
// // import NavBar from "./components/NavBar";
// // import AuthModal from "./components/AuthModal";
// // import Dashboard from "./components/Dashboard";
// // import { socket } from "./socket";
// // import "./global.css"; // you can create for body styles (optional)

// // export default function App(){
// //   const [user, setUser] = useState(null);
// //   const [showAuth, setShowAuth] = useState(false);
// //   const [showFAQ, setShowFAQ] = useState(false);

// //   useEffect(() => {
// //     const raw = localStorage.getItem("user");
// //     if (raw) {
// //       try {
// //         const u = JSON.parse(raw);
// //         setUser(u);
// //         try { socket.connect(); socket.emit("join", { email: u.email }); } catch {}
// //       } catch { localStorage.removeItem("user"); }
// //     }
// //   }, []);

// //   function handleLogout(){
// //     localStorage.removeItem("user");
// //     try { socket.disconnect(); } catch {}
// //     setUser(null);
// //   }

// //   return (
// //     <>
// //       <NavBar
// //         user={user}
// //         onShowLogin={()=>setShowAuth(true)}
// //         onShowRegister={()=>setShowAuth(true)}
// //         onShowFAQ={()=>setShowFAQ(true)}
// //         onLogout={handleLogout}
// //         brand="Stock Broker Client"
// //         showRegisterOnHome={!user}
// //       />

// //       {!user ? (
// //         <div style={{ maxWidth:1200, margin:"28px auto", padding:"18px" }}>
// //           {/* Simple landing and prompt */}
// //           <h1>Stock Broker Client — Demo</h1>
// //           <p>Welcome — use Login / Sign up in the nav to open the auth popup.</p>
// //           <p>After login you will see the dashboard where you can subscribe to stocks and receive simulated live prices.</p>
// //         </div>
// //       ) : (
// //         <Dashboard user={user} onLogout={handleLogout} />
// //       )}

// //       {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onLogin={(u)=>{ setUser(u); setShowAuth(false); }} />}

// //       {/* FAQ modal */}
// //       {showFAQ && (
// //         <div style={{ position:"fixed", inset:0, background:"rgba(2,6,23,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1200 }}>
// //           <div style={{ width:720, maxWidth:"95%", background:"#fff", borderRadius:10, padding:20 }}>
// //             <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
// //               <h3 style={{ margin:0 }}>FAQ</h3>
// //               <button onClick={()=>setShowFAQ(false)}>✕</button>
// //             </div>
// //             <div style={{ marginTop:12 }}>
// //               <p><strong>Access</strong> — Use Sign Up to register (demo). Login saves a demo user in localStorage.</p>
// //               <p><strong>Prices</strong> — Prices are simulated server-side every second and pushed via WebSockets. This is deliberate for the hiring assignment.</p>
// //               <p><strong>Submit</strong> — Provide a GitHub link or zip to the company. I can help prepare a README for submission.</p>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }
// import React, { useEffect, useState } from "react";
// import NavBar from "./components/NavBar";
// import AuthModal from "./components/AuthModal";
// import Home from "./components/Home";         // <-- import Home
// import Dashboard from "./components/Dashboard";
// import { socket } from "./socket";
// import "./global.css";

// export default function App(){
//   const [user, setUser] = useState(null);
//   const [showAuth, setShowAuth] = useState(false);
//   const [showFAQ, setShowFAQ] = useState(false);

//   useEffect(() => {
//     const raw = localStorage.getItem("user");
//     if (raw) {
//       try {
//         const u = JSON.parse(raw);
//         setUser(u);
//         try { socket.connect(); socket.emit("join", { email: u.email }); } catch {}
//       } catch { localStorage.removeItem("user"); }
//     }
//   }, []);

//   function handleLogout(){
//     localStorage.removeItem("user");
//     try { socket.disconnect(); } catch {}
//     setUser(null);
//   }

//   return (
//     <>
//       <NavBar
//         user={user}
//         onShowLogin={()=>setShowAuth(true)}
//         onShowRegister={()=>setShowAuth(true)}
//         onShowFAQ={()=>setShowFAQ(true)}
//         onLogout={handleLogout}
//         brand="Stock Broker Client"
//         showRegisterOnHome={!user}
//       />

//       {!user ? (
//         // RENDER THE HOME COMPONENT WHEN NOT LOGGED IN
//         <Home onShowRegister={() => setShowAuth(true)} />
//       ) : (
//         <Dashboard user={user} onLogout={handleLogout} />
//       )}

//       {showAuth && (
//         <AuthModal
//           onClose={() => setShowAuth(false)}
//           onLogin={(u) => {
//             setUser(u);
//             setShowAuth(false);
//           }}
//         />
//       )}

//       {showFAQ && (
//         <div style={{ position:"fixed", inset:0, background:"rgba(2,6,23,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1200 }}>
//           <div style={{ width:720, maxWidth:"95%", background:"#fff", borderRadius:10, padding:20 }}>
//             <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//               <h3 style={{ margin:0 }}>FAQ</h3>
//               <button onClick={()=>setShowFAQ(false)}>✕</button>
//             </div>
//             <div style={{ marginTop:12 }}>
//               <p><strong>Access</strong> — Use Sign Up to register.</p>
//               <p><strong>Prices</strong> — Prices are simulated server-side every second and pushed via WebSockets. This is deliberate for the hiring assignment.</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import React, { useState } from "react";
import NavBar from "./components/NavBar";
import AuthModal from "./components/AuthModal";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import { socket } from "./socket";
import "./global.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState("login");
  const [showFAQ, setShowFAQ] = useState(false);

  // LOGOUT
  function handleLogout() {
    localStorage.removeItem("user");
    try {
      socket.disconnect();
    } catch {}
    setUser(null);
  }

  // OPEN AUTH MODAL
  function handleShowAuth(tab = "login") {
    setAuthInitialTab(tab);
    setShowAuth(true);
  }

  return (
    <>
      <NavBar
        user={user}
        onShowLogin={(tab) => handleShowAuth(tab)}
        onShowRegister={(tab) => handleShowAuth(tab)}
        onShowFAQ={() => setShowFAQ(true)}
        onLogout={handleLogout}
        brand="Stock Broker Client"
        showRegisterOnHome={!user}
      />

      {/* HOME OR DASHBOARD */}
      {!user ? (
        <Home onShowRegister={() => handleShowAuth("signup")} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}

      {/* AUTH MODAL */}
      {showAuth && (
        <AuthModal
          initialTab={authInitialTab}
          onClose={() => setShowAuth(false)}
          onLogin={(u) => {
            // ✅ store ONLY after successful login
            localStorage.setItem("user", JSON.stringify(u));
            setUser(u);
            setShowAuth(false);
          }}
        />
      )}

      {/* FAQ MODAL */}
      {showFAQ && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              width: 720,
              maxWidth: "95%",
              background: "#fff",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>FAQ</h3>
              <button onClick={() => setShowFAQ(false)}>✕</button>
            </div>

            <div style={{ marginTop: 12 }}>
              <p>
                <strong>Access</strong> — Use Sign Up to register.
              </p>
              <p>
                <strong>Prices</strong> — Prices are simulated server-side every
                second and pushed via WebSockets.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
