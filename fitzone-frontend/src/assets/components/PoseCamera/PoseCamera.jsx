import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import useMotionCounter from './Moves/useMotionCounter'; // useMotionCounter hook'unun doğru yolu
import { Box } from '@mui/material';
const CONNECTED_KEYPOINTS = [
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    ['left_shoulder', 'right_shoulder'],
    ['left_hip', 'right_hip'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle'],
];
// lunge jumingJack squat  pushup plank deadligt  hazır

const PoseCamera = ({ movementType = 'jumpingJack' }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [model, setModel] = useState(null);

    // useMotionCounter'dan hem repCount hem de plankDuration alınıyor
    const { repCount, update, movementPhase, plankDuration } = useMotionCounter({ movementType });

    // Model yükleme Effect'i
    useEffect(() => {
        const loadModel = async () => {
            await tf.setBackend('webgl');
            await tf.ready();
            console.log('TensorFlow backend set to webgl and ready.');
            try {
                const detector = await poseDetection.createDetector(
                    poseDetection.SupportedModels.MoveNet,
                    { modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING }
                );
                setModel(detector);
                console.log('MoveNet model loaded successfully.');
            } catch (error) {
                console.error("Error loading MoveNet model:", error);
            }
        };
        loadModel();

        return () => {
             // Modeli temizle
             if (model) {
                 model.dispose();
                 setModel(null);
                 console.log('MoveNet model disposed.');
             }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // Detection ve Çizim Döngüsü Effect'i
    useEffect(() => {
        let animationFrameId;

        const detect = async () => {
            if (
                model &&
                webcamRef.current &&
                webcamRef.current.video &&
                webcamRef.current.video.readyState === 4
            ) {
                const video = webcamRef.current.video;
                const videoWidth = video.videoWidth;
                const videoHeight = video.videoHeight;

                if (canvasRef.current) {
                    canvasRef.current.width = videoWidth;
                    canvasRef.current.height = videoHeight;
                } else {
                     // Canvas hazır değilse bir sonraki frame'de tekrar dene
                    animationFrameId = requestAnimationFrame(detect);
                    return;
                }


                let poses;
                try {
                     // Pose tespiti yap
                    poses = await model.estimatePoses(video);
                } catch (error) {
                    console.error("Error estimating poses:", error);
                     // Hata durumunda bile döngüyü devam ettir
                    animationFrameId = requestAnimationFrame(detect);
                    return;
                }


                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, videoWidth, videoHeight); // Canvas'ı temizle

                if (poses && poses.length > 0) {
                    // İlk tespit edilen pozu al
                    const primaryPose = poses[0];
                    const keypoints = primaryPose.keypoints;

                    // Keypointleri hook'a göndererek state'leri güncelle
                    if (update && keypoints) {
                        update(keypoints);
                    }

                    // Keypointleri ve bağlantıları çiz
                    const minConfidenceForDrawing = 0.3; // Çizim için minimum güven skoru
                    CONNECTED_KEYPOINTS.forEach(([a, b]) => {
                        const kp1 = keypoints.find(k => k.name === a);
                        const kp2 = keypoints.find(k => k.name === b);

                        if (kp1 && kp2 && kp1.score > minConfidenceForDrawing && kp2.score > minConfidenceForDrawing) {
                            ctx.beginPath();
                            ctx.moveTo(kp1.x, kp1.y);
                            ctx.lineTo(kp2.x, kp2.y);
                            ctx.strokeStyle = 'lime'; // Bağlantı rengi
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    });

                    keypoints.forEach(kp => {
                         // Keypoint noktalarını çiz
                        if (kp.score > minConfidenceForDrawing) {
                            ctx.beginPath();
                            ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI); // Nokta boyutu
                            ctx.fillStyle = 'aqua'; // Nokta rengi
                            ctx.fill();
                        }
                    });

                } else {
                     // Poz tespit edilemediğinde ne yapılacaksa...
                     // İsteğe bağlı: Keypointler kaybolduğunda update(null) çağrılabilir
                     // ancak hook zaten allPointsValid kontrolü yapıyor.
                }
            }

            // Bir sonraki frame için döngüyü devam ettir
            animationFrameId = requestAnimationFrame(detect);
        };

        // Model yüklendiyse ve update fonksiyonu hazırsa detection döngüsünü başlat
        if (model && update) {
            detect();
        }

        // Bileşen unmount edildiğinde animation frame'i temizle
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
         // Hook bağımlılıkları: model yüklendiğinde ve update fonksiyonu değiştiğinde effect yeniden çalışır.
    }, [model, update]);


    // Hangi değeri göstereceğini belirle: Rep sayısı mı yoksa Süre mi?
    const displayValue = movementType === 'plank' ? `${plankDuration} s` : repCount;
    // Hangi etiketi göstereceğini belirle: Reps mi yoksa Time mı?
    const displayLabel = movementType === 'plank' ? 'Time' : 'Reps';

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>

        
        <div style={{ position: 'relative', width: 640, height: 480, margin: 'auto' }}>
            <Webcam
                ref={webcamRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: 'scaleX(-1)', // Kamerayı yatayda aynala
                }}
                width={640}
                height={480}
                videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
            />
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: 'scaleX(-1)', // Canvas'ı kamerayla aynı şekilde aynala
                }}
                width={640}
                height={480}
            />
            {/* Reps veya Time bilgisini gösteren kısım */}
            <div style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '8px 16px',
                borderRadius: '8px',
                zIndex: 10
            }}>
                 {/* Koşullu gösterim: Reps veya Time */}
                {displayLabel}: {displayValue}
            </div>
            {/* Hareket fazını gösteren kısım */}
            <div style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                fontSize: '24px',
                color: 'yellow',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '8px 16px',
                borderRadius: '8px',
                zIndex: 10
            }}>
                Phase: {movementPhase}
            </div>
             {/* İsteğe bağlı: Derinlik bilgisini göstermek isterseniz ekleyebilirsiniz */}
             {/* {movementType !== 'plank' && (
                 <div style={{ ... }}>
                     Depth: {movementDepth.toFixed(1)}%
                 </div>
             )} */}
        </div>
        </Box>
    );
};

export default PoseCamera;