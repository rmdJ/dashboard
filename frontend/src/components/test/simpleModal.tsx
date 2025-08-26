import { useState } from "react";
import { Button } from "@/components/ui/button";

export const SimpleModalTest = () => {
  const [isOpen, setIsOpen] = useState(false);

  console.log("SimpleModalTest render - isOpen:", isOpen);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Ouvrir Modal Simple
      </Button>
      
      {isOpen && (
        <div 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '8px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '400px',
              width: '90%'
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              Modal Simple
            </h2>
            <p style={{ marginBottom: '24px' }}>
              Cette modal fonctionne indépendamment !
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};