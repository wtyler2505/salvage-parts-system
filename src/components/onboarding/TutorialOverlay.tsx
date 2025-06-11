import React, { useEffect, useState } from 'react';

interface Step { selector: string; text: string; }

const steps: Step[] = [
  { selector: '#panel-PartsManager', text: 'Manage salvage parts here.' },
  { selector: '#panel-EnhancedScene', text: 'Interact with your model in the viewer.' },
  { selector: '#panel-TimelinePanel', text: 'Edit animation keyframes on the timeline.' },
  { selector: '#panel-PropertyPanel', text: 'Change properties of selected objects.' }
];

const TutorialOverlay: React.FC = () => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tutorialSeen')) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const el = document.querySelector(steps[step].selector) as HTMLElement | null;
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [step, visible]);

  if (!visible || !rect) return null;

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('tutorialSeen', 'true');
      setVisible(false);
    }
  };

  const skip = () => {
    localStorage.setItem('tutorialSeen', 'true');
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="absolute border-4 border-yellow-400 rounded pointer-events-none"
        style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      />
      <div
        className="absolute bg-white rounded shadow p-4 pointer-events-auto"
        style={{ top: rect.bottom + 10, left: rect.left }}
      >
        <p className="text-sm mb-2">{steps[step].text}</p>
        <div className="text-right space-x-2">
          <button onClick={skip} className="text-sm px-2 py-1 bg-gray-200 rounded">Skip</button>
          <button onClick={next} className="text-sm px-2 py-1 bg-blue-600 text-white rounded">
            {step === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
