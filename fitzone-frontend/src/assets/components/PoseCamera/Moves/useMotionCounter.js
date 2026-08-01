// src/hooks/useMotionCounter.js

import { useState, useCallback, useRef } from "react";

// Hareket mantık modüllerini içe aktar
import { checkSquatLogic } from './exercise/squatLogic';
import { checkPushupLogic } from './exercise/pushupLogic';
import { checkLungeLogic } from './exercise/lungeLogic';
import { checkPlankLogic } from './exercise/plankLogic';
import { checkJumpingJackLogic } from './exercise/jumpingJackLogic';
import { checkDeadliftLogic } from './exercise/deadliftLogic';
import { checkBicepsCurlLogic } from './exercise/bicepsCurlLogic';
import { checkBurpeeLogic } from './exercise/burpeeLogic';

// MOVEMENT_KEYPOINTS listesi burada durabilir, sadece genel bilgi amaçlı.
const MOVEMENT_KEYPOINTS = {
 // ... (Diğer hareketlerin keypoint'leri)
 plank: [
 "left_shoulder", "left_hip", "left_knee",
 "right_shoulder", "right_hip", "right_knee",
 ],
 // ...
};

const useMotionCounter = ({
 movementType = "squat",
 angleThreshold = 170, // Primarily used for exercises like Pushup (overrides default UP threshold)
 minScore = 0.1,
 cooldownDuration = 300, // Cooldown duration in milliseconds (not used in logic functions yet)
}) => {
 const [repCount, setRepCount] = useState(0);
 const [movementPhase, setMovementPhase] = useState("Bekleme");
 const [movementDepth, setMovementDepth] = useState(0);

 // --- Plank Timer State and Ref ---
 const [plankDuration, setPlankDuration] = useState(0); // State to display duration
 const plankStartTimeRef = useRef(null); // Ref to store the timestamp when the plank started
 // --- End Plank Timer State and Ref ---

 const angleHistoryRef = useRef({}); // Ref for angle smoothing history
 const lastRepTimeRef = useRef(0); // Ref for rep cooldown timestamp
 const COOLDOWN_DURATION_MS = 300; // Cooldown period in milliseconds


 const update = useCallback(
  (keypoints) => {
   // This function is called with new keypoints from PoseCamera on each frame.

   let logicResult = null;

   // Prepare current state and config to pass to exercise logic
   const currentState = {
    movementPhase,
    // Pass current plankDuration state and the ref's current value
    plankDuration,
    lastRepTime: lastRepTimeRef.current,
    plankStartTimeRef: plankStartTimeRef.current,
   };

   const config = {
    minScore,
    angleThreshold,
    cooldownDuration,
   };

   // Call the specific logic function based on movement type
   switch (movementType) {
    case "Squat":
     logicResult = checkSquatLogic(keypoints, currentState, config, angleHistoryRef);
     break;
    case "Push-up":
     logicResult = checkPushupLogic(keypoints, currentState, config, angleHistoryRef);
     break;
    case "lunge":
     logicResult = checkLungeLogic(keypoints, currentState, config, angleHistoryRef);
     break;
    case "plank":
     // checkPlankLogic returns signals like startTimer, stopTimer, and optionally newPlankDuration.
     logicResult = checkPlankLogic(keypoints, currentState, config, angleHistoryRef);
     break;
    case "jumpingJack":
     logicResult = checkJumpingJackLogic(keypoints, currentState, config, angleHistoryRef);
     break;
    case "deadlift":
     logicResult = checkDeadliftLogic(keypoints, currentState, config, angleHistoryRef);
     break;
     case "bicepsCurl":
     logicResult = checkBicepsCurlLogic(keypoints, currentState, config, angleHistoryRef);
     break;
     case "Burpee":
      logicResult = checkBurpeeLogic(keypoints, currentState, config, angleHistoryRef);
      break;
    default:
     logicResult = { nextPhase: 'Bekleme', newDepth: 0, error: "Unknown movement type" };
     break;
   }

   // --- Update State based on Logic Result ---
   if (logicResult) {

    // Update Phase
    if (logicResult.nextPhase !== undefined && logicResult.nextPhase !== movementPhase) {
     setMovementPhase(logicResult.nextPhase);
    }

    // Update Rep Count (only if repIncreased signal is given AND cooldown is over)
    if (logicResult.repIncreased) {
     const now = Date.now();
     if (now > lastRepTimeRef.current + COOLDOWN_DURATION_MS) {
      setRepCount(prev => prev + 1);
      lastRepTimeRef.current = now; // Update last rep time for cooldown
     }
    }

    // Update Depth (for exercises like Pushup/Squat)
    if (logicResult.newDepth !== undefined && logicResult.newDepth !== movementDepth) {
     setMovementDepth(logicResult.newDepth);
    }

    // --- Plank Specific Timer Logic ---
    if (movementType === 'plank') {
     // If logic signals to start the timer AND the timer is not already running
     if (logicResult.startTimer && plankStartTimeRef.current === null) {
      plankStartTimeRef.current = Date.now(); // Set the start timestamp
     }
     // If logic signals to stop the timer AND the timer is currently running
     if (logicResult.stopTimer && plankStartTimeRef.current !== null) {
      plankStartTimeRef.current = null; // Clear the start timestamp, stopping the timer
     }

     // If the timer is running (start timestamp is set)
     if (plankStartTimeRef.current !== null) {
      const elapsedMs = Date.now() - plankStartTimeRef.current; // Calculate elapsed milliseconds
      const elapsedSeconds = Math.floor(elapsedMs / 1000); // Convert to whole seconds
      // Only update state if the duration has changed (prevents unnecessary re-renders)
      // This comparison uses the current plankDuration state, requiring it in dependencies
      if (elapsedSeconds !== plankDuration) {
       setPlankDuration(elapsedSeconds); // Update the plank duration state
      }
     }
     // This 'else if' block might handle specific cases where logic provides duration
     // even if the timer isn't technically 'started' according to plankStartTimeRef.current
     else if (logicResult.newPlankDuration !== undefined && logicResult.newPlankDuration !== plankDuration) {
      setPlankDuration(logicResult.newPlankDuration);
     }
    }
    // --- End Plank Specific Timer Logic ---


    // Error handling (optional)
    if (logicResult.error) {
     // console.error(`${movementType} Logic Error: ${logicResult.error}`);
    }
   }

   // --- Cleanup for Non-Plank Movements ---
   // If the movement type is not plank, reset the plank timer state and ref.
   if (
    movementType !== "plank" &&
    (plankDuration > 0 || plankStartTimeRef.current !== null) // Check if timer was active
   ) {
    setPlankDuration(0);
    plankStartTimeRef.current = null;
   }
   // --- End Cleanup ---
  },
  // --- CORRECTED DEPENDENCY ARRAY ---
  [
   movementType,
   movementPhase, // Used in currentState
   movementDepth, // Used in currentState and comparison
   minScore, // Used in config
   angleThreshold, // Used in config
   plankDuration, 
   cooldownDuration,

   // Removed: lastRepTimeRef, plankStartTimeRef (refs don't need to be dependencies)
   // Removed: COOLDOWN_DURATION_MS (constant outside hook)
   // Removed: findPoint (not used directly in hook update logic)
   // Logic functions (checkPlankLogic etc.) are imported constants, not dependencies
  ]
 );

 // Return the state and the update function for the component to use
 return { repCount, update, movementPhase, plankDuration, movementDepth };
};

export default useMotionCounter;