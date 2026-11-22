export default function ValidationModal({ validationData, myId, onValidate, validatorName }) {
    const isAttacker = validationData.attackerId === myId;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel animate-fade-in">
                <h2 className="modal-title">Oral grammar required!</h2>

                <div className="prompt-box">
                    <span className="prompt-label">Target Combination:</span>
                    <br />
                    <h3 className="prompt-sentence">{validationData.subject} + {validationData.pastParticiple}</h3>
                </div>

                {isAttacker ? (
                    <div className="attacker-view">
                        <p><strong>Speak the sentence out loud!</strong></p>
                        <p className="subtitle">Waiting for Teacher/Opponent to validate your grammar...</p>
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div className="validator-view">
                        <p>Did the attacker say the sentence correctly?</p>
                        <div className="action-row" style={{ justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn danger" onClick={() => onValidate(false)}>
                                👎 Grammar Wrong (Dud)
                            </button>
                            <button className="btn success" onClick={() => onValidate(true)}>
                                👍 Grammar Correct
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
