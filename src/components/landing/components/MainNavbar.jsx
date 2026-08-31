 
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiCpu,
  FiTrendingUp,
  FiWifi,
} from "react-icons/fi";

 

export default function MainNavbar() {
  const [showNavbar, setShowNavbar] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 10) {
        setShowNavbar(true);
        lastScrollY = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY) {
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY) {
        setShowNavbar(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`trading-navbar ${
        showNavbar
          ? "trading-navbar-visible"
          : "trading-navbar-hidden"
      }`}
    >
      <div className="trading-navbar-container">

        {/* BRAND */}
        <Link to="/testnetShart" className="trading-brand">
          <div className="trading-brand-icon">
            <FiActivity />
          </div>

          <div className="trading-brand-text">
            <strong>TRADE</strong>
            <span>LAB</span>
          </div>
        </Link>

        {/* MARKET STATUS */}
        <div className="trading-market-status">
          <span className="status-dot"></span>
          <span>MARKET LIVE</span>
        </div>

        {/* NAVIGATION */}
        <nav className="trading-nav">

          <Link
            to="/testnetShart"
            className={isActive("/testnetShart") ? "active" : ""}
          >
            <FiTrendingUp />
            <span>Trading</span>
          </Link>

          <Link
            to="/signals"
            className={isActive("/signals") ? "active" : ""}
          >
            <FiCpu />
            <span>Signals</span>
          </Link>

          <Link
            to="/backtest"
            className={isActive("/backtest") ? "active" : ""}
          >
            <FiBarChart2 />
            <span>Backtest</span>
          </Link>
          <Link
            to="/NewTestnetShart"
            className={isActive("/NewTestnetShart") ? "active" : ""}
          >
            <FiTrendingUp />
            <span>Trading</span>
          </Link>

          <Link
            to="/NewSignals"
            className={isActive("/NewSignals") ? "active" : ""}
          >
            <FiCpu />
            <span>Signals</span>
          </Link>

          <Link
            to="/NewBacktest"
            className={isActive("/NewBacktest") ? "active" : ""}
          >
            <FiBarChart2 />
            <span>Backtest</span>
          </Link>

        </nav>

        {/* RIGHT SIDE */}
        <div className="trading-navbar-right">

          <div className="connection-status">
            <FiWifi />
            <span>Connected</span>
          </div>

          <div className="trading-time">
            <FiClock />
            <span>LIVE</span>
          </div>

        </div>

      </div>
      <style>
        {`
      
/* =========================================================
   TRADING NAVBAR
========================================================= */

.trading-navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 76px;

  z-index: 9999;

  background:
    linear-gradient(
      180deg,
      rgba(7, 12, 22, 0.98),
      rgba(7, 12, 22, 0.94)
    );

  border-bottom: 1px solid #1e293b;

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  transition:
    transform 0.35s ease,
    opacity 0.25s ease;

  font-family:
    Inter,
    "Segoe UI",
    Arial,
    sans-serif;
}


/* =========================================================
   NAVBAR STATES
========================================================= */

.trading-navbar-visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.trading-navbar-hidden {
  transform: translateY(-110%);
  opacity: 0;
  pointer-events: none;
}


/* =========================================================
   CONTAINER
========================================================= */

.trading-navbar-container {
  width: 100%;
  max-width: 1600px;
  height: 100%;

  margin: 0 auto;
  padding: 0 28px;

  display: flex;
  align-items: center;

  gap: 30px;
}


/* =========================================================
   BRAND
========================================================= */

.trading-brand {
  display: flex;
  align-items: center;
  gap: 11px;

  min-width: 155px;

  text-decoration: none;
  color: white;
}


.trading-brand-icon {
  width: 40px;
  height: 40px;

  border-radius: 11px;

  display: flex;
  align-items: center;
  justify-content: center;

  background:
    linear-gradient(
      135deg,
      #22c55e,
      #16a34a
    );

  color: white;

  box-shadow:
    0 0 22px rgba(34, 197, 94, 0.2);
}


.trading-brand-icon svg {
  width: 22px;
  height: 22px;
  stroke-width: 2;
}


.trading-brand-text {
  display: flex;
  flex-direction: column;

  line-height: 1;
}


.trading-brand-text strong {
  font-size: 17px;
  font-weight: 850;
  letter-spacing: 0.8px;
}


.trading-brand-text span {
  margin-top: 4px;

  font-size: 10px;
  font-weight: 700;

  letter-spacing: 3px;

  color: #64748b;
}


/* =========================================================
   MARKET STATUS
========================================================= */

.trading-market-status {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 8px 12px;

  border: 1px solid rgba(34, 197, 94, 0.15);

  border-radius: 20px;

  background: rgba(34, 197, 94, 0.05);

  color: #86efac;

  font-size: 10px;
  font-weight: 750;

  letter-spacing: 0.7px;

  white-space: nowrap;
}


.status-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #22c55e;

  box-shadow:
    0 0 0 4px rgba(34, 197, 94, 0.08),
    0 0 12px rgba(34, 197, 94, 0.8);

  animation: marketPulse 1.8s infinite;
}


@keyframes marketPulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }

  100% {
    opacity: 1;
  }
}


/* =========================================================
   NAVIGATION
========================================================= */

.trading-nav {
  flex: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;
}


.trading-nav a {
  position: relative;

  display: flex;
  align-items: center;
  gap: 9px;

  padding: 11px 17px;

  border-radius: 9px;

  color: #94a3b8;

  text-decoration: none;

  font-size: 13px;
  font-weight: 650;

  transition:
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}


.trading-nav a svg {
  width: 17px;
  height: 17px;

  stroke-width: 1.8;
}


.trading-nav a:hover {
  color: #f8fafc;

  background: rgba(255, 255, 255, 0.045);

  transform: translateY(-1px);
}


.trading-nav a.active {
  color: #f8fafc;

  background:
    linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.12),
      rgba(34, 197, 94, 0.035)
    );
}


.trading-nav a.active svg {
  color: #22c55e;
}


.trading-nav a.active::after {
  content: "";

  position: absolute;

  left: 18px;
  right: 18px;
  bottom: -10px;

  height: 2px;

  border-radius: 10px;

  background: #22c55e;

  box-shadow:
    0 0 10px rgba(34, 197, 94, 0.55);
}


/* =========================================================
   RIGHT SIDE
========================================================= */

.trading-navbar-right {
  min-width: 155px;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 10px;
}


/* =========================================================
   CONNECTION
========================================================= */

.connection-status {
  display: flex;
  align-items: center;
  gap: 7px;

  padding: 8px 11px;

  border-radius: 8px;

  background: #0d1625;

  border: 1px solid #1e293b;

  color: #64748b;

  font-size: 10px;
  font-weight: 650;

  white-space: nowrap;
}


.connection-status svg {
  width: 14px;
  height: 14px;

  color: #22c55e;

  stroke-width: 2;
}


/* =========================================================
   LIVE
========================================================= */

.trading-time {
  display: flex;
  align-items: center;
  gap: 6px;

  color: #475569;

  font-size: 10px;
  font-weight: 700;
}


.trading-time svg {
  width: 14px;
  height: 14px;
}


/* =========================================================
   LARGE LAPTOP
========================================================= */

@media (max-width: 1250px) {

  .trading-navbar-container {
    padding: 0 20px;
    gap: 18px;
  }

  .trading-market-status {
    display: none;
  }

  .trading-nav a {
    padding: 10px 13px;
  }

}


/* =========================================================
   TABLET
========================================================= */

@media (max-width: 900px) {

  .trading-navbar {
    height: 68px;
  }

  .trading-navbar-container {
    padding: 0 16px;
  }

  .trading-brand {
    min-width: auto;
  }

  .trading-brand-icon {
    width: 36px;
    height: 36px;
  }

  .trading-brand-text strong {
    font-size: 15px;
  }

  .trading-nav {
    gap: 3px;
  }

  .trading-nav a {
    padding: 9px 11px;
  }

  .trading-nav a span {
    display: none;
  }

  .trading-nav a svg {
    width: 19px;
    height: 19px;
  }

  .connection-status span,
  .trading-time {
    display: none;
  }

}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {

  .trading-navbar {
    height: 62px;
  }

  .trading-navbar-container {
    padding: 0 12px;
    gap: 8px;
  }

  .trading-brand {
    gap: 8px;
  }

  .trading-brand-icon {
    width: 34px;
    height: 34px;

    border-radius: 9px;
  }

  .trading-brand-icon svg {
    width: 18px;
    height: 18px;
  }

  .trading-brand-text strong {
    font-size: 13px;
  }

  .trading-brand-text span {
    font-size: 8px;
    letter-spacing: 2px;
  }

  .trading-nav {
    margin-left: auto;
    justify-content: flex-end;
  }

  .trading-nav a {
    width: 38px;
    height: 38px;

    padding: 0;

    justify-content: center;
  }

  .trading-nav a.active::after {
    left: 10px;
    right: 10px;
    bottom: -7px;
  }

  .trading-navbar-right {
    display: none;
  }

}


/* =========================================================
   VERY SMALL MOBILE
========================================================= */

@media (max-width: 380px) {

  .trading-brand-text {
    display: none;
  }

  .trading-nav a {
    width: 34px;
    height: 34px;
  }

}
 
`}
      </style>
    </header>
  );
}
 
