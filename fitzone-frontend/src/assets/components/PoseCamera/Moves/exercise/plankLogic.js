// src/exerciseLogics/plankLogic.js

import { calculateAngle, smoothValue, findPoint } from '../../../../utils/poseUtils';

// Required keypoint names for plank detection
const REQUIRED_POINTS = [
    "left_shoulder", "left_hip", "left_knee",
    "right_shoulder", "right_hip", "right_knee",
];

// Angle thresholds for detecting the plank pose (These may need tuning!)
const PLANK_ANGLE_THRESHOLD = 160; // Hip angle threshold to ENTER the pose (both sides must be > this)
const RECOVERY_THRESHOLD = 155; // Hip angle threshold to EXIT the pose (either side drops < this)

// Length of the history for smoothing the angles
// A higher value means more smoothing but more lag.
const SMOOTHING_HISTORY_LENGTH = 10;

/**
 * Processes the duration tracking logic for a plank exercise.
 * @param {Array<Object>} keypoints - All detected keypoints.
 * @param {Object} currentState - Current movement states from the hook ({ movementPhase, plankDuration, plankStartTimeRef }).
 * @param {Object} config - Configuration (e.g., minScore).
 * @param {Object} historyRef - useRef object for smoothing history.
 * @returns {Object} Object containing state updates to be applied by the main hook ({ nextPhase, newPlankDuration, startTimer, stopTimer, newDepth, error }).
 */
export const checkPlankLogic = (keypoints, currentState, config, historyRef) => {
    const { minScore } = config;
    const { movementPhase, plankDuration, plankStartTimeRef } = currentState;

    // Find required points and check their confidence scores
    const points = REQUIRED_POINTS.map(name => findPoint(keypoints, name));
    const allPointsFoundAndConfident = points.every(p => p && p.score >= minScore);

    let currentIsInPlankPose = false;
    let smoothedLeftAngle = NaN; // Initialize as NaN
    let smoothedRightAngle = NaN; // Initialize as NaN

    // --- Pose Detection and Angle Calculation ---
    if (allPointsFoundAndConfident) {
        const [leftShoulder, leftHip, leftKnee, rightShoulder, rightHip, rightKnee] = points;

        const leftAngle = calculateAngle(leftShoulder, leftHip, leftKnee); // Calculate angle at left hip (Shoulder-Hip-Knee)
        const rightAngle = calculateAngle(rightShoulder, rightHip, rightKnee); // Calculate angle at right hip (Shoulder-Hip-Knee)

        if (!isNaN(leftAngle) && !isNaN(rightAngle)) {
            // Smooth the calculated angles
            smoothedLeftAngle = smoothValue("plank_left_angle", leftAngle, historyRef, SMOOTHING_HISTORY_LENGTH);
            smoothedRightAngle = smoothValue("plank_right_angle", rightAngle, historyRef, SMOOTHING_HISTORY_LENGTH);

            if (!isNaN(smoothedLeftAngle) && !isNaN(smoothedRightAngle)) {
                // Determine if the user is in the plank pose based on smoothed angles and thresholds
                currentIsInPlankPose =
                  smoothedLeftAngle > PLANK_ANGLE_THRESHOLD && // Left hip angle is straight enough
                  smoothedRightAngle > PLANK_ANGLE_THRESHOLD; // Right hip angle is straight enough
            }
        }
    }
    // --- End Pose Detection and Angle Calculation ---


    let nextPhase = movementPhase;
    let newPlankDuration = plankDuration; // Initialize with current state duration
    let startTimer = false; // Signal for the hook to start the timer
    let stopTimer = false; // Signal for the hook to stop the timer

    const now = Date.now();

    // --- Phase Transition and Timer Signaling Logic ---
    if (movementPhase === "initial" || movementPhase === "not_in_pose") {
        if (currentIsInPlankPose) {
            // Transition to 'in_pose' when plank pose is detected
            nextPhase = "in_pose";
            startTimer = true; // Tell the hook to start the timer
            newPlankDuration = 0; // Reset duration on entering pose
            console.log("Plank Logic: Signaling Timer Start"); // Log timer start signal
        } else {
             // If not in pose and in these phases, ensure timer is stopped and duration is 0
             newPlankDuration = 0; // Duration should be 0 when not in pose
             // Only signal stop if the phase was not already initial/not_in_pose
             if (movementPhase !== "initial" && movementPhase !== "not_in_pose") {
                 stopTimer = true; // Tell the hook to stop the timer
                 console.log("Plank Logic: Signaling Timer Stop (Not in pose)"); // Log timer stop signal
             }
        }
    } else if (movementPhase === "in_pose") {
        // Check conditions to exit the plank pose
        const isOutOfPlankPose =
          !allPointsFoundAndConfident || // Exit if keypoints are lost or confidence drops
          isNaN(smoothedLeftAngle) || // Exit if left angle becomes NaN
          smoothedLeftAngle < RECOVERY_THRESHOLD || // Exit if left angle drops below recovery threshold
          isNaN(smoothedRightAngle) || // Exit if right angle becomes NaN
          smoothedRightAngle < RECOVERY_THRESHOLD; // Exit if right angle drops below recovery threshold

        if (isOutOfPlankPose) {
            // Transition to 'not_in_pose' when plank pose is no longer held
            nextPhase = "not_in_pose";
            stopTimer = true; // Tell the hook to stop the timer
             console.log("Plank Logic: Signaling Timer Stop (Exited pose)"); // Log timer stop signal
        } else {
            // If still in 'in_pose', update the duration calculation
            // The actual state update happens in useMotionCounter based on plankStartTimeRef
            // --- FIX: Corrected check for plankStartTimeRef value ---
            if (plankStartTimeRef !== null) { // Check if the start time value is valid (number or 0)
                const elapsedMs = now - plankStartTimeRef; // Calculate elapsed time since start (using the value directly)
                const elapsedSeconds = Math.floor(elapsedMs / 1000);
                newPlankDuration = elapsedSeconds; // Update the duration calculation

                // --- Log the calculated time ---

                // --- End Log ---

           } else {
                // This case shouldn't happen...
                startTimer = true;
                newPlankDuration = 0;

           }
        }
    }
    // --- End Phase Transition and Timer Signaling Logic ---


    // Depth is not typically tracked for plank duration, so keep it 0
    const newDepth = 0; // Or set to 100 when in_pose, 0 otherwise if desired for visualization

    // Return the suggested state updates for the main hook
    // The hook calling this function must use these return values
    // (nextPhase, newPlankDuration, startTimer, stopTimer) to manage its own state and timer.
    return { nextPhase, newPlankDuration, startTimer, stopTimer, newDepth, error: null };
};