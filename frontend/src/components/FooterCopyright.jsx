import React from 'react';

const FooterCopyright = () => {
  return (
    <footer style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'rgba(61, 48, 45, 0.95)',
      padding: '12px 20px',
      textAlign: 'center',
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '500',
      zIndex: 1000,
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div>
        <span style={{ fontSize: '0.9rem', marginRight: '4px' }}>©</span>
        {new Date().getFullYear()} Synapso. All rights reserved.
      </div>
      <div style={{ fontSize: '0.8rem', marginTop: '2px', opacity: 0.9 }}>
        Developed by Pranjali Dangi and Pranjal Mourya
      </div>
    </footer>
  );
};

export default FooterCopyright;
