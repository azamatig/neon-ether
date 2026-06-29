import React, { useEffect, useState } from "react";

interface WeatherOverlayProps {
  weather: "clear" | "rain" | "snow" | "storm" | "heat" | "smog";
}

export default function WeatherOverlay({ weather }: WeatherOverlayProps) {
  const [lightningFlash, setLightningFlash] = useState(false);

  // Storm lightning flash loop
  useEffect(() => {
    if (weather !== "storm") {
      setLightningFlash(false);
      return;
    }

    const triggerFlash = () => {
      setLightningFlash(true);
      setTimeout(() => setLightningFlash(false), 80);
      
      // Double flash chance
      if (Math.random() < 0.4) {
        setTimeout(() => {
          setLightningFlash(true);
          setTimeout(() => setLightningFlash(false), 50);
        }, 180);
      }
    };

    const interval = setInterval(() => {
      if (Math.random() < 0.25) {
        triggerFlash();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [weather]);

  if (weather === "clear" || !weather) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Dynamic Inline Style Sheet for high-performance keyframe animations */}
      <style>{`
        @keyframes rainFall {
          0% { transform: translateY(-100px) rotate(15deg); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(100vh) rotate(15deg); opacity: 0; }
        }
        @keyframes snowDrift {
          0% { transform: translateY(-50px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh) translateX(80px) rotate(360deg); opacity: 0; }
        }
        @keyframes stormRain {
          0% { transform: translateY(-120px) rotate(22deg); opacity: 0; }
          5% { opacity: 0.6; }
          95% { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(22deg); opacity: 0; }
        }
        @keyframes heatWobble {
          0% { transform: translateY(100%) scaleX(1); opacity: 0; }
          50% { opacity: 0.15; transform: translateY(50%) scaleX(1.1) skewX(4deg); }
          100% { transform: translateY(-10%) scaleX(0.9); opacity: 0; }
        }
        @keyframes smogDrift {
          0% { transform: translateX(-100px) translateY(0px) scale(1); opacity: 0; }
          20% { opacity: 0.22; }
          80% { opacity: 0.22; }
          100% { transform: translateX(100vw) translateY(50px) scale(1.3); opacity: 0; }
        }
        .weather-rain-drop {
          position: absolute;
          background: linear-gradient(transparent, rgba(34, 211, 238, 0.4));
          width: 1px;
          height: 60px;
          animation: rainFall 1.2s linear infinite;
        }
        .weather-snow-flake {
          position: absolute;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          animation: snowDrift 4.5s linear infinite;
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
        }
        .weather-storm-drop {
          position: absolute;
          background: linear-gradient(transparent, rgba(168, 85, 247, 0.55));
          width: 1.5px;
          height: 80px;
          animation: stormRain 0.8s linear infinite;
        }
        .weather-heat-wave {
          position: absolute;
          background: linear-gradient(to top, rgba(249, 115, 22, 0.08), transparent);
          border-radius: 30%;
          filter: blur(12px);
          animation: heatWobble 6s ease-in infinite;
        }
        .weather-smog-cloud {
          position: absolute;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(20px);
          animation: smogDrift 15s linear infinite;
        }
      `}</style>

      {/* Lightning Flash Overlay */}
      {weather === "storm" && (
        <div
          className={`absolute inset-0 bg-white transition-opacity duration-75 pointer-events-none z-30 ${
            lightningFlash ? "opacity-25" : "opacity-0"
          }`}
        />
      )}

      {/* RAIN EFFECT */}
      {weather === "rain" && (
        <>
          {[...Array(40)].map((_, i) => (
            <div
              key={`rain-${i}`}
              className="weather-rain-drop"
              style={{
                left: `${(i * 2.7) % 100}%`,
                top: `${-60 - (i * 12) % 150}px`,
                animationDelay: `${(i * 0.15) % 2}s`,
                animationDuration: `${0.9 + (i % 5) * 0.12}s`,
              }}
            />
          ))}
          {/* Subtle cyan vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(8,47,73,0.15)_100%)]" />
        </>
      )}

      {/* SNOW EFFECT */}
      {weather === "snow" && (
        <>
          {[...Array(25)].map((_, i) => {
            const size = 2 + (i % 4);
            return (
              <div
                key={`snow-${i}`}
                className="weather-snow-flake"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${(i * 4.3) % 100}%`,
                  top: `${-20 - (i * 18) % 120}px`,
                  animationDelay: `${(i * 0.3) % 4}s`,
                  animationDuration: `${3.5 + (i % 4) * 0.6}s`,
                }}
              />
            );
          })}
          {/* Cold slate vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(15,23,42,0.2)_100%)]" />
        </>
      )}

      {/* MAGNETIC STORM EFFECT */}
      {weather === "storm" && (
        <>
          {[...Array(55)].map((_, i) => (
            <div
              key={`storm-${i}`}
              className="weather-storm-drop"
              style={{
                left: `${(i * 2.1) % 100}%`,
                top: `${-80 - (i * 11) % 180}px`,
                animationDelay: `${(i * 0.08) % 1.5}s`,
                animationDuration: `${0.65 + (i % 6) * 0.08}s`,
              }}
            />
          ))}
          {/* Dark purple atmospheric glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(88,28,135,0.1)_100%)]" />
        </>
      )}

      {/* HEATWAVE EFFECT */}
      {weather === "heat" && (
        <>
          {[...Array(8)].map((_, i) => {
            const width = 120 + (i % 3) * 60;
            return (
              <div
                key={`heat-${i}`}
                className="weather-heat-wave"
                style={{
                  width: `${width}px`,
                  height: `${width * 1.5}px`,
                  left: `${10 + (i * 14) % 80}%`,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: `${5 + (i % 3) * 1.5}s`,
                }}
              />
            );
          })}
          {/* Hot amber/orange vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(120,53,4,0.12)_100%)] border border-amber-500/5" />
        </>
      )}

      {/* TOXIC SMOG EFFECT */}
      {weather === "smog" && (
        <>
          {[...Array(6)].map((_, i) => {
            const size = 180 + (i % 3) * 90;
            return (
              <div
                key={`smog-${i}`}
                className="weather-smog-cloud"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  top: `${(i * 15) % 65}%`,
                  animationDelay: `${i * 2}s`,
                  animationDuration: `${12 + (i % 3) * 4}s`,
                }}
              />
            );
          })}
          {/* Toxic green atmospheric haze */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(6,95,70,0.08)_100%)]" />
        </>
      )}
    </div>
  );
}
