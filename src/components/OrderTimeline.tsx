"use client";

interface TimelineStep {
    label: string;
    date?: string;
    isCompleted: boolean;
    isActive: boolean;
}

export default function OrderTimeline({ status }: { status: string }) {
    const steps = [
        { label: 'Submetido', key: 'submitted' },
        { label: 'Aprovado', key: 'approved' },
        { label: 'Em Separação', key: 'separated' },
        { label: 'Enviado', key: 'shipped' },
        { label: 'Entregue', key: 'delivered' },
    ];

    const currentIdx = steps.findIndex(s => s.key === status.toLowerCase());

    return (
        <div className="timeline-container">
            {steps.map((step, index) => (
                <div key={step.key} className={`step ${index <= currentIdx ? 'completed' : ''} ${index === currentIdx ? 'active' : ''}`}>
                    <div className="marker">
                        {index < currentIdx ? '✓' : index + 1}
                    </div>
                    <div className="info">
                        <span className="label">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && <div className="line"></div>}
                </div>
            ))}

            <style jsx>{`
        .timeline-container { display: flex; justify-content: space-between; padding: 2rem 1rem; margin-top: 2rem; position: relative; }
        .step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
        .marker { 
          width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; 
          display: flex; align-items: center; justify-content: center; 
          font-weight: 800; font-size: 0.8rem; color: #64748b;
          border: 4px solid white;
          transition: all 0.3s ease;
        }
        .line { 
          position: absolute; top: 16px; left: 50%; width: 100%; height: 2px; 
          background: #e2e8f0; z-index: -1; 
        }
        .label { margin-top: 0.75rem; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        
        .completed .marker { background: var(--success); color: white; }
        .completed .line { background: var(--success); }
        .active .marker { background: var(--primary); color: white; box-shadow: 0 0 0 4px rgba(245, 130, 32, 0.2); }
        .active .label { color: var(--secondary); }
      `}</style>
        </div>
    );
}
