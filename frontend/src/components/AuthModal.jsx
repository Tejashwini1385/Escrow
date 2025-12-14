// import React, { useState, useEffect } from "react";
// import "./AuthModal.css";
// import { apiUrl } from "../services/api";
// import { socket } from "../socket";

// /**
//  * AuthModal.jsx — upgraded enforcement for signup password >= 6 chars
//  */
// export default function AuthModal({ initialTab = "login", onClose, onLogin }) {
//   const [tab, setTab] = useState(initialTab);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     setTab(initialTab || "login");
//   }, [initialTab]);

//   const emailTrimmed = email.trim();
//   const showGmailSuggestion = emailTrimmed.length > 0 && !emailTrimmed.includes("@");
//   function applyGmailSuggestion() {
//     setEmail(`${emailTrimmed}@gmail.com`);
//   }

//   function scorePassword(pw) {
//     if (!pw) return 0;
//     let score = 0;
//     if (pw.length >= 8) score += 2;
//     else if (pw.length >= 5) score += 1;
//     if (/[a-z]/.test(pw)) score += 1;
//     if (/[A-Z]/.test(pw)) score += 1;
//     if (/[0-9]/.test(pw)) score += 1;
//     if (/[^A-Za-z0-9]/.test(pw)) score += 1;
//     return Math.min(Math.max(score, 0), 6);
//   }
//   function labelForScore(s) {
//     if (s <= 2) return "Weak";
//     if (s <= 4) return "Medium";
//     return "Strong";
//   }
//   const pwScore = scorePassword(password);
//   const pwLabel = labelForScore(pwScore);
//   const pwPercent = Math.round((pwScore / 6) * 100);

//   const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
//   const signupPwTooShort = password.length > 0 && password.length < 6;

//   // persist + socket join
//   async function doLocalLogin(userObj) {
//     localStorage.setItem("user", JSON.stringify(userObj));
//     try {
//       socket.connect();
//       socket.emit("join", { email: userObj.email });
//     } catch (e) {}
//     onLogin && onLogin(userObj);
//     onClose && onClose();
//   }

//   async function handleLogin(e) {
//     e?.preventDefault();
//     if (!email || !password) return alert("Enter email & password");
//     setLoading(true);
//     try {
//       const res = await fetch(apiUrl("/api/auth/login"), {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });
//       const json = await res.json();
//       if (!res.ok) return alert(json.error || "Login failed");
//       const user = { id: json.id || json._id || json.userId, email };
//      doLocalLogin(user);
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleSignup(e) {
//     e?.preventDefault();
//     // client-side guard (redundant but explicit)
//     if (!email || !password) return alert("Missing fields");
//     if (password.length < 6) return alert("Password must be at least 6 characters");
//     if (password !== confirm) return alert("Passwords do not match");

//     setLoading(true);
//     try {
//       const res = await fetch(apiUrl("/api/auth/register"), {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });
//       const json = await res.json();
//       if (!res.ok) return alert(json.error || "Register failed");

//       if (json.token || json.id || json._id) {
//         const user = { id: json.id || json._id, email };
//         doLocalLogin(user);
//         return;
//       }

//       const loginRes = await fetch(apiUrl("/api/auth/login"), {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });
//       const loginJson = await loginRes.json();
//       if (!loginRes.ok) {
//         alert("Registered! Please login. (Auto-login failed)");
//         setTab("login");
//         setPassword("");
//         setConfirm("");
//         return;
//       }

//       const user = { id: loginJson.id || loginJson._id || loginJson.userId, email };
//       doLocalLogin(user);
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Prevent Enter-submission on signup when pw is too short
//   function handleSignupKeyDown(e) {
//     if (e.key === "Enter" && signupPwTooShort) {
//       e.preventDefault();
//     }
//   }

//   return (
//     <div className="auth-backdrop" onMouseDown={onClose}>
//       <div className="auth-modal" onMouseDown={(e) => e.stopPropagation()}>
//         <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

//         <div className="auth-top">
//           <div className="auth-tabs">
//             <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Login</button>
//             <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Sign Up</button>
//           </div>
//         </div>

//         <div className="auth-body">
//           <div className="auth-header">
//             <h3 className="auth-title">{tab === "login" ? "Log into Stock Broker Client" : "Create your account"}</h3>
//           </div>

//           <div className="auth-scroll-area">
//             {tab === "login" ? (
//               <form className="auth-form" onSubmit={handleLogin}>
//                 <label className="auth-label">
//                   Email
//                   <input
//                     type="email"
//                     className="auth-input"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     autoComplete="email"
//                     aria-describedby="email-hint"
//                   />
//                 </label>

//                 {showGmailSuggestion && (
//                   <div id="email-hint" className="auth-email-hint">
//                     Looks like you haven't added a domain —{" "}
//                     <button type="button" className="link-btn" onClick={applyGmailSuggestion} aria-label="Use Gmail suggestion">
//                       use {emailTrimmed}@gmail.com
//                     </button>
//                   </div>
//                 )}

//                 {!emailLooksValid && emailTrimmed.length > 0 && (
//                   <div className="auth-email-warning" role="alert">Email looks unusual — make sure it's correct.</div>
//                 )}

//                 <label className="auth-label">
//                   Password
//                   <div className="auth-pass-row">
//                     <input
//                       className="auth-input"
//                       type={showPassword ? "text" : "password"}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                       autoComplete="current-password"
//                       aria-describedby="pw-strength"
//                       minLength={6} // hint to browser & mobile keyboards
//                     />
//                     <button type="button" className="auth-eye" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
//                       {showPassword ? "👁️" : "👁️‍🗨️"}
//                     </button>
//                   </div>
//                 </label>

//                 <div id="pw-strength" className="auth-pw-strength" aria-live="polite">
//                   <div className="auth-pw-row">
//                     <div className="auth-pw-meter" aria-hidden="true">
//                       <div className="auth-pw-fill" style={{ width: `${pwPercent}%` }} />
//                     </div>
//                     <div className="auth-pw-label">{pwLabel}</div>
//                   </div>
//                   <div className="auth-pw-hint">Use at least 8 characters, mix upper/lowercase, digits and symbols for a strong password.</div>
//                 </div>

//                 <div className="auth-submit-wrap">
//                   <button className="auth-cta" type="submit" disabled={loading}>
//                     {loading ? "Signing in..." : "Login"}
//                   </button>
//                 </div>
//               </form>
//             ) : (
//               <form className="auth-form" onSubmit={handleSignup} onKeyDown={handleSignupKeyDown}>
//                 <label className="auth-label">
//                   Email
//                   <input
//                     type="email"
//                     className="auth-input"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     autoComplete="email"
//                     aria-describedby="email-hint-signup"
//                   />
//                 </label>

//                 {showGmailSuggestion && (
//                   <div id="email-hint-signup" className="auth-email-hint">
//                     Quick tip — click to fill with Gmail:{" "}
//                     <button type="button" className="link-btn" onClick={applyGmailSuggestion} aria-label="Use Gmail suggestion">
//                       {emailTrimmed}@gmail.com
//                     </button>
//                   </div>
//                 )}

//                 {!emailLooksValid && emailTrimmed.length > 0 && (
//                   <div className="auth-email-warning" role="alert">Email looks unusual — make sure it's correct.</div>
//                 )}

//                 <label className="auth-label">
//                   Password
//                   <div className="auth-pass-row">
//                     <input
//                       className="auth-input"
//                       type={showPassword ? "text" : "password"}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                       autoComplete="new-password"
//                       aria-describedby="pw-strength-signup"
//                       minLength={6} // browser hint
//                     />
//                     <button type="button" className="auth-eye" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
//                       {showPassword ? "👁️" : "👁️‍🗨️"}
//                     </button>
//                   </div>
//                 </label>

//                 {signupPwTooShort && (
//                   <div className="auth-email-warning" role="alert">Password must be at least 6 characters long.</div>
//                 )}

//                 <label className="auth-label">
//                   Confirm Password
//                   <input
//                     className="auth-input"
//                     type={showPassword ? "text" : "password"}
//                     value={confirm}
//                     onChange={(e) => setConfirm(e.target.value)}
//                     required
//                     autoComplete="new-password"
//                   />
//                 </label>

//                 <div id="pw-strength-signup" className="auth-pw-strength" aria-live="polite">
//                   <div className="auth-pw-row">
//                     <div className="auth-pw-meter" aria-hidden="true">
//                       <div className="auth-pw-fill" style={{ width: `${pwPercent}%` }} />
//                     </div>
//                     <div className="auth-pw-label">{pwLabel}</div>
//                   </div>
//                   <div className="auth-pw-hint">Strong password increases account security — aim for "Strong".</div>
//                 </div>

//                 <div className="auth-submit-wrap">
//                   <button
//                     className="auth-cta"
//                     type="submit"
//                     disabled={loading || signupPwTooShort}
//                     title={signupPwTooShort ? "Password must be at least 6 characters" : undefined}
//                   >
//                     {loading ? "Signing up..." : "Create account"}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>

//           <div className="auth-footer">
//             {tab === "login" ? (
//               <div className="auth-switch">Don’t have an account? <button className="link-btn" onClick={() => setTab("signup")}>Sign Up</button></div>
//             ) : (
//               <div className="auth-switch">Already registered? <button className="link-btn" onClick={() => setTab("login")}>Login</button></div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import "./AuthModal.css";
import { apiUrl } from "../services/api";
import { socket } from "../socket";

/**
 * AuthModal.jsx — signup DOES NOT auto-login
 */
export default function AuthModal({ initialTab = "login", onClose, onLogin }) {
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTab(initialTab || "login");
  }, [initialTab]);

  // LOGIN ONLY
  async function doLocalLogin(userObj) {
    localStorage.setItem("user", JSON.stringify(userObj));
    try {
      socket.connect();
      socket.emit("join", { email: userObj.email });
    } catch {}
    onLogin?.(userObj);
    onClose?.();
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) return alert("Enter email & password");

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) return alert(json.error || "Login failed");

      doLocalLogin({ id: json.id || json._id, email });
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (!email || !password) return alert("Missing fields");
    if (password.length < 6) return alert("Password must be at least 6 characters");
    if (password !== confirm) return alert("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) return alert(json.error || "Register failed");

      // 🚫 NO AUTO LOGIN
      alert("Account created successfully. Please login.");
      setTab("login");
      setPassword("");
      setConfirm("");
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`auth-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => setTab("signup")}
          >
            Sign Up
          </button>
        </div>

        {tab === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <input
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button className="auth-cta" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignup}>
            <input
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <input
              className="auth-input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm Password"
            />
            <button className="auth-cta" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


