//src/app/whitepaper/page.tsx

import React from 'react';

const Whitepaper = () => {
  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <iframe
        src="/Defy_Overview.pdf" // Correct path to the PDF file
        style={{ width: '100%', height: '100%', border: 'none' }}
        frameBorder="0"
        title="Whitepaper"
      />
    </div>
  );
};

export default Whitepaper;
