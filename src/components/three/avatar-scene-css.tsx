"use client";

import { useEffect, useRef, useState } from "react";
import type { AvatarConfig } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AvatarSceneProps {
  config: AvatarConfig;
}

export function AvatarScene({ config }: AvatarSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotation({
      x: rotation.x + deltaY * 0.5,
      y: rotation.y + deltaX * 0.5,
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setScale(Math.max(0.5, Math.min(2, scale + delta)));
  };

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "default";
    }
    return () => {
      document.body.style.cursor = "default";
    };
  }, [isDragging]);

  const renderHumanoid = () => (
    <div className="avatar-humanoid" style={{ 
      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
      transformStyle: "preserve-3d",
    }}>
      {/* Body */}
      <div
        className="avatar-part body"
        style={{
          background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`,
          width: "80px",
          height: "120px",
          borderRadius: "40px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: `0 10px 40px ${config.primaryColor}40`,
        }}
      />
      {/* Head */}
      <div
        className="avatar-part head"
        style={{
          background: config.primaryColor,
          width: "70px",
          height: "70px",
          borderRadius: config.headShape === "round" ? "50%" : config.headShape === "angular" ? "20%" : "50% 50% 40% 40%",
          position: "absolute",
          top: "calc(50% - 110px)",
          left: "50%",
          transform: "translate(-50%, 0) translateZ(10px)",
          boxShadow: `0 5px 20px ${config.primaryColor}60`,
        }}
      >
        {/* Eyes */}
        <div className="eyes" style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "25px" }}>
          <div
            style={{
              width: config.eyeStyle === "visor" ? "40px" : "12px",
              height: config.eyeStyle === "visor" ? "6px" : "12px",
              background: config.secondaryColor,
              borderRadius: config.eyeStyle === "glowing" ? "50%" : "2px",
              boxShadow: config.eyeStyle === "glowing" ? `0 0 10px ${config.secondaryColor}` : "none",
              position: config.eyeStyle === "visor" ? "absolute" : "relative",
              left: config.eyeStyle === "visor" ? "15px" : "auto",
            }}
          />
          {config.eyeStyle !== "visor" && (
            <div
              style={{
                width: "12px",
                height: "12px",
                background: config.secondaryColor,
                borderRadius: config.eyeStyle === "glowing" ? "50%" : "2px",
                boxShadow: config.eyeStyle === "glowing" ? `0 0 10px ${config.secondaryColor}` : "none",
              }}
            />
          )}
        </div>
        {/* Accessory */}
        {config.accessory === "crown" && (
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "0",
              height: "0",
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderBottom: `20px solid ${config.secondaryColor}`,
            }}
          />
        )}
        {config.accessory === "horns" && (
          <>
            <div
              style={{
                position: "absolute",
                top: "-15px",
                left: "5px",
                width: "0",
                height: "0",
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: `25px solid ${config.secondaryColor}`,
                transform: "rotate(-20deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-15px",
                right: "5px",
                width: "0",
                height: "0",
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: `25px solid ${config.secondaryColor}`,
                transform: "rotate(20deg)",
              }}
            />
          </>
        )}
        {config.accessory === "halo" && (
          <div
            style={{
              position: "absolute",
              top: "-25px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60px",
              height: "60px",
              border: `4px solid ${config.secondaryColor}`,
              borderRadius: "50%",
              boxShadow: `0 0 15px ${config.secondaryColor}`,
            }}
          />
        )}
      </div>
      {/* Arms */}
      <div
        style={{
          background: config.secondaryColor,
          width: "20px",
          height: "80px",
          borderRadius: "10px",
          position: "absolute",
          top: "calc(50% - 30px)",
          left: "calc(50% - 60px)",
          transform: "translateZ(5px) rotate(15deg)",
        }}
      />
      <div
        style={{
          background: config.secondaryColor,
          width: "20px",
          height: "80px",
          borderRadius: "10px",
          position: "absolute",
          top: "calc(50% - 30px)",
          right: "calc(50% - 60px)",
          transform: "translateZ(5px) rotate(-15deg)",
        }}
      />
      {/* Legs */}
      <div
        style={{
          background: config.secondaryColor,
          width: "25px",
          height: "70px",
          borderRadius: "12px",
          position: "absolute",
          top: "calc(50% + 60px)",
          left: "calc(50% - 35px)",
          transform: "translateZ(5px)",
        }}
      />
      <div
        style={{
          background: config.secondaryColor,
          width: "25px",
          height: "70px",
          borderRadius: "12px",
          position: "absolute",
          top: "calc(50% + 60px)",
          right: "calc(50% - 35px)",
          transform: "translateZ(5px)",
        }}
      />
      {/* Particle Effect */}
      {config.particleEffect !== "none" && (
        <div className={`particles particles-${config.particleEffect}`}>
          {[...Array(config.particleEffect === "fire" ? 12 : 8)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                background: config.secondaryColor,
                width: config.particleEffect === "fire" ? "4px" : "3px",
                height: config.particleEffect === "fire" ? "4px" : "3px",
                borderRadius: "50%",
                position: "absolute",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `particle-${config.particleEffect} ${2 + Math.random() * 2}s infinite`,
                animationDelay: `${Math.random() * 2}s`,
                boxShadow: `0 0 ${config.particleEffect === "fire" ? "8px" : "4px"} ${config.secondaryColor}`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderRobot = () => (
    <div className="avatar-robot" style={{ 
      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
      transformStyle: "preserve-3d",
    }}>
      {/* Body */}
      <div
        style={{
          background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`,
          width: "90px",
          height: "110px",
          borderRadius: "8px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: `0 10px 40px ${config.primaryColor}40, inset 0 0 20px rgba(255,255,255,0.1)`,
          border: `2px solid ${config.secondaryColor}40`,
        }}
      />
      {/* Head */}
      <div
        style={{
          background: config.primaryColor,
          width: "75px",
          height: "60px",
          borderRadius: "8px",
          position: "absolute",
          top: "calc(50% - 105px)",
          left: "50%",
          transform: "translate(-50%, 0) translateZ(10px)",
          boxShadow: `0 5px 20px ${config.primaryColor}60`,
          border: `2px solid ${config.secondaryColor}40`,
        }}
      >
        {/* Visor */}
        <div
          style={{
            background: config.secondaryColor,
            width: "55px",
            height: "12px",
            borderRadius: "2px",
            position: "absolute",
            top: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            boxShadow: `0 0 15px ${config.secondaryColor}`,
          }}
        />
        {/* Antenna */}
        <div
          style={{
            background: config.secondaryColor,
            width: "4px",
            height: "25px",
            position: "absolute",
            top: "-25px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              background: config.secondaryColor,
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              position: "absolute",
              top: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: `0 0 10px ${config.secondaryColor}`,
            }}
          />
        </div>
      </div>
      {/* Arms */}
      <div
        style={{
          background: config.secondaryColor,
          width: "18px",
          height: "85px",
          borderRadius: "4px",
          position: "absolute",
          top: "calc(50% - 30px)",
          left: "calc(50% - 65px)",
          transform: "translateZ(5px)",
          border: `1px solid ${config.primaryColor}40`,
        }}
      />
      <div
        style={{
          background: config.secondaryColor,
          width: "18px",
          height: "85px",
          borderRadius: "4px",
          position: "absolute",
          top: "calc(50% - 30px)",
          right: "calc(50% - 65px)",
          transform: "translateZ(5px)",
          border: `1px solid ${config.primaryColor}40`,
        }}
      />
      {/* Legs */}
      <div
        style={{
          background: config.secondaryColor,
          width: "28px",
          height: "75px",
          borderRadius: "4px",
          position: "absolute",
          top: "calc(50% + 55px)",
          left: "calc(50% - 38px)",
          transform: "translateZ(5px)",
          border: `1px solid ${config.primaryColor}40`,
        }}
      />
      <div
        style={{
          background: config.secondaryColor,
          width: "28px",
          height: "75px",
          borderRadius: "4px",
          position: "absolute",
          top: "calc(50% + 55px)",
          right: "calc(50% - 38px)",
          transform: "translateZ(5px)",
          border: `1px solid ${config.primaryColor}40`,
        }}
      />
    </div>
  );

  const renderAnimal = () => (
    <div className="avatar-animal" style={{ 
      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
      transformStyle: "preserve-3d",
    }}>
      {/* Body */}
      <div
        style={{
          background: `radial-gradient(circle, ${config.primaryColor}, ${config.secondaryColor})`,
          width: "100px",
          height: "90px",
          borderRadius: "50%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: `0 10px 40px ${config.primaryColor}40`,
        }}
      />
      {/* Head */}
      <div
        style={{
          background: config.primaryColor,
          width: "75px",
          height: "70px",
          borderRadius: "50%",
          position: "absolute",
          top: "calc(50% - 85px)",
          left: "50%",
          transform: "translate(-50%, 0) translateZ(10px)",
          boxShadow: `0 5px 20px ${config.primaryColor}60`,
        }}
      >
        {/* Ears */}
        <div
          style={{
            width: "0",
            height: "0",
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            borderBottom: `35px solid ${config.secondaryColor}`,
            position: "absolute",
            top: "-25px",
            left: "5px",
            transform: "rotate(-15deg)",
          }}
        />
        <div
          style={{
            width: "0",
            height: "0",
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            borderBottom: `35px solid ${config.secondaryColor}`,
            position: "absolute",
            top: "-25px",
            right: "5px",
            transform: "rotate(15deg)",
          }}
        />
        {/* Eyes */}
        <div style={{ display: "flex", gap: "25px", justifyContent: "center", marginTop: "28px" }}>
          <div
            style={{
              width: "14px",
              height: "14px",
              background: config.secondaryColor,
              borderRadius: "50%",
              boxShadow: `0 0 8px ${config.secondaryColor}`,
            }}
          />
          <div
            style={{
              width: "14px",
              height: "14px",
              background: config.secondaryColor,
              borderRadius: "50%",
              boxShadow: `0 0 8px ${config.secondaryColor}`,
            }}
          />
        </div>
      </div>
      {/* Tail */}
      <div
        style={{
          background: config.secondaryColor,
          width: "15px",
          height: "60px",
          borderRadius: "8px",
          position: "absolute",
          top: "calc(50% + 10px)",
          left: "calc(50% + 60px)",
          transform: "translateZ(-5px) rotate(45deg)",
        }}
      />
    </div>
  );

  const renderAbstract = () => (
    <div className="avatar-abstract" style={{ 
      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${scale})`,
      transformStyle: "preserve-3d",
    }}>
      {/* Core */}
      <div
        style={{
          background: `conic-gradient(from 0deg, ${config.primaryColor}, ${config.secondaryColor}, ${config.primaryColor})`,
          width: "100px",
          height: "100px",
          borderRadius: "30%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(45deg)",
          boxShadow: `0 0 60px ${config.primaryColor}80, inset 0 0 30px ${config.secondaryColor}40`,
          animation: "abstract-rotate 10s linear infinite",
        }}
      />
      {/* Inner glow */}
      <div
        style={{
          background: `radial-gradient(circle, ${config.secondaryColor}, transparent)`,
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) translateZ(20px)",
          boxShadow: `0 0 40px ${config.secondaryColor}`,
          animation: "pulse 2s ease-in-out infinite",
        }}
      />
      {/* Rings */}
      <div
        style={{
          border: `3px solid ${config.secondaryColor}`,
          width: "130px",
          height: "130px",
          borderRadius: "50%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotateX(60deg)",
          boxShadow: `0 0 20px ${config.secondaryColor}`,
          animation: "ring-rotate 8s linear infinite",
        }}
      />
      <div
        style={{
          border: `2px solid ${config.primaryColor}`,
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotateY(60deg)",
          boxShadow: `0 0 15px ${config.primaryColor}`,
          animation: "ring-rotate-reverse 6s linear infinite",
        }}
      />
    </div>
  );

  const renderAvatar = () => {
    switch (config.bodyType) {
      case "robot":
        return renderRobot();
      case "animal":
        return renderAnimal();
      case "abstract":
        return renderAbstract();
      default:
        return renderHumanoid();
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-background/80 to-muted/30 border border-border relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ 
        cursor: isDragging ? "grabbing" : "grab",
        perspective: "1000px",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
        {renderAvatar()}
      </div>
      
      <style jsx>{`
        @keyframes particle-sparkle {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0); }
          50% { opacity: 1; transform: translateY(-20px) scale(1); }
        }
        @keyframes particle-fire {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(0.5); }
        }
        @keyframes particle-aura {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes abstract-rotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes ring-rotate {
          0% { transform: translate(-50%, -50%) rotateX(60deg) rotateZ(0deg); }
          100% { transform: translate(-50%, -50%) rotateX(60deg) rotateZ(360deg); }
        }
        @keyframes ring-rotate-reverse {
          0% { transform: translate(-50%, -50%) rotateY(60deg) rotateZ(0deg); }
          100% { transform: translate(-50%, -50%) rotateY(60deg) rotateZ(-360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) translateZ(20px) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) translateZ(20px) scale(1.1); }
        }
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
