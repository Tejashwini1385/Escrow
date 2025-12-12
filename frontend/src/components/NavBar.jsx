// import React from "react";
// import "./NavBar.css";

// /* tiny base64 logo placeholder — replace with your own if you want */
// const LOGO_BASE64 = "https://img0-placeit-net.s3-accelerate.amazonaws.com/uploads/stage/stage_image/17999/optimized_product_thumb_stage.jpg";

// export default function NavBar({
//   user,
//   onShowLogin,
//   onShowRegister,
//   onShowFAQ,
//   onLogout,
//   brand = "Stock Broker Client",
//   showRegisterOnHome = true,
// }) {
//   return (
//     <header className="nb-root">
//       <div className="nb-inner">
//         <div className="nb-left">
//           <img src={LOGO_BASE64} alt="logo" className="nb-logo" />
//           <div className="nb-title">
            
//             <div className="nb-name">{brand}</div>
//             <div className="nb-tag">Live-like prices</div>
//           </div>
//         </div>

        

//         <div className="nb-actions">
//           {user ? (
//             <>
//               <div className="nb-user">Hi, {user.email}</div>
//               <button className="nb-btn nb-btn-outline" onClick={onLogout}>Logout</button>
//             </>
//           ) : (
//             <>
//              <button className="nb-btn nb-btn-outline" onClick={onShowFAQ}>FAQ</button>
//               <button className="nb-btn nb-btn-outline" onClick={onShowLogin}>Login</button>
//               {showRegisterOnHome && (
//                 <button className="nb-btn nb-btn-primary" onClick={onShowRegister}>Sign up</button>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }
import React from "react";
import "./NavBar.css";

/* tiny base64 logo placeholder — replace with your own if you want */
const LOGO_BASE64 =
  "https://img0-placeit-net.s3-accelerate.amazonaws.com/uploads/stage/stage_image/17999/optimized_product_thumb_stage.jpg";

export default function NavBar({
  user,
  onShowLogin,
  onShowRegister,
  onShowFAQ,
  onLogout,
  brand = "Stock Broker Client",
  showRegisterOnHome = true,
}) {
  return (
    <header className="nb-root">
      <div className="nb-inner">
        <div className="nb-left">
          <img src={LOGO_BASE64} alt="logo" className="nb-logo" />
          <div className="nb-title">
            <div className="nb-name">{brand}</div>
            <div className="nb-tag">Live-like prices</div>
          </div>
        </div>

        <div className="nb-actions">
          {user ? (
            <>
              <div className="nb-user">Hi, {user.email}</div>
              <button className="nb-btn nb-btn-outline" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nb-btn nb-btn-outline" onClick={onShowFAQ}>
                FAQ
              </button>

              {/* OPEN LOGIN TAB */}
              <button
                className="nb-btn nb-btn-outline"
                onClick={() => onShowLogin("login")}
              >
                Login
              </button>

              {/* OPEN SIGNUP TAB */}
              {showRegisterOnHome && (
                <button
                  className="nb-btn nb-btn-primary"
                  onClick={() => onShowRegister("signup")}
                >
                  Sign up
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
