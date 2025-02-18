// /src/components/WordSelectionModal.jsx
import React from 'react';


const WordSelectionModal = ({ wordOptions, onWordSelected }) => {
  return (
    <div className="word-selection-modal">
      <h3>Select a word to draw</h3>
      <ul>
        {wordOptions.map((word, index) => (
          <li key={index} onClick={() => onWordSelected(word)}>
            {word}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WordSelectionModal;
