import React, { useEffect, useRef } from 'react';

interface GeoGebraBoardProps {
  onReady: () => void;
}

const GeoGebraBoard: React.FC<GeoGebraBoardProps> = ({ onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appletRef = useRef<any>(null);

  useEffect(() => {
    if (appletRef.current) return;

    const initGGB = () => {
      if (window.GGBApplet) {
        const parameters = {
          "id": "ggbApplet",
          "width": 1200, 
          "height": 800,
          "showToolBar": true,
          "borderColor": null,
          "showMenuBar": false,
          "showAlgebraInput": true,
          "showResetIcon": true,
          "enableLabelDrags": true,
          "enableShiftDragZoom": true,
          "enableRightClick": true,
          "capturingThreshold": null,
          "showLogging": false,
          "useBrowserForJS": false,
          "perspective": "Geometry", 
          "appName": "geometry",
          "appletOnLoad": () => {
            console.log("GeoGebra Loaded");
            if (window.ggbApplet) {
              window.ggbApplet.setGridVisible(true);
              window.ggbApplet.setAxesVisible(true, true);
            }
            onReady();
          }
        };

        const applet = new window.GGBApplet(parameters, '5.0');
        appletRef.current = applet;
        
        if (containerRef.current) {
          applet.inject(containerRef.current.id);
        }
      } else {
        setTimeout(initGGB, 500);
      }
    };

    initGGB();

  }, [onReady]);

  return (
    <div className="w-full h-full relative bg-slate-50 min-h-[600px] border border-teal-100 rounded-lg overflow-hidden">
      <div 
        id="ggb-element" 
        ref={containerRef} 
        className="absolute inset-0 z-10"
      />
      
      <div className="absolute inset-0 flex items-center justify-center text-slate-300 pointer-events-none z-0">
        <span className="font-bold text-4xl opacity-20 tracking-widest">GEOGEBRA</span>
      </div>
    </div>
  );
};

export default GeoGebraBoard;
