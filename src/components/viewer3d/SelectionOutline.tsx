import React from 'react';
import { Outlines } from '@react-three/drei';
import { useViewerStore } from '../../stores/useViewerStore';

const SelectionOutline: React.FC = () => {
  const { selectionState } = useViewerStore();

  if (selectionState.selectedParts.length === 0 && !selectionState.hoveredPart) {
    return null;
  }

  return (
    <>
      {/* Selection outlines would be rendered here */}
      {/* In a real implementation, this would be integrated with the PartModel components */}
    </>
  );
};

export default SelectionOutline;