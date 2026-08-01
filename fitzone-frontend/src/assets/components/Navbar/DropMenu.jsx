import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Stack, useMediaQuery } from "@mui/material";

const backdropVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const dropVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
    borderRadius: "50%",
    x: "50%",
    y: "-50%",
  },
  visible: {
    scale: 30,
    opacity: 1,
    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
    x: "50%",
    y: "-50%",
    transition: {
      type: "spring",
      duration: 0.9,
      bounce: 0.25,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.5 },
  },
};

const menuVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DropMenu = ({ open, handleClose }) => {
  const isMobile = useMediaQuery("(max-width:768px)");

  const navItems = [
    { label: "Profil", to: "/profile" },
    { label: "Workout Ekle", to: "/add-workout" },
    { label: "Çıkış", action: handleClose },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Arka plan damlası */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropVariants}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "100px",
              height: "100px",
              background: "linear-gradient(135deg, #FF8C00, #FF6347)",
              zIndex: 2000,
              transform: "translate(50%, -50%)",
              pointerEvents: "none",
            }}
          />

          {/* Karanlık arka plan */}
          <motion.div
            className="backdrop"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariant}
            onClick={handleClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 2090,
            }}
          />

          {/* Menü içeriği */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "100%",
              height: "100%",
              zIndex: 2100,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              textAlign: "center",
              padding: isMobile ? "0 20px" : "0",
            }}
          >
            <Stack spacing={4} alignItems="center">
              {navItems.map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                  {item.to ? (
                    <Link
                      to={item.to}
                      onClick={handleClose}
                      style={{
                        color: "white",
                        fontSize: "1.4rem",
                        textDecoration: "none",
                        borderBottom: "2px solid rgba(255,255,255,0.2)",
                        paddingBottom: "8px",
                        transition: "all 0.3s ease",
                        display: "inline-block",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        fontSize: "1.4rem",
                        cursor: "pointer",
                        borderBottom: "2px solid rgba(255,255,255,0.2)",
                        paddingBottom: "8px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    >
                      {item.label}
                    </button>
                  )}
                </motion.div>
              ))}
            </Stack>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DropMenu;
