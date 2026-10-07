import { type JSX } from "react";
import { useNavigate } from "react-router-dom";

function BoasVindas(): JSX.Element {
    const navigate = useNavigate();

    return (
        <main style={{
            minHeight: '88vh',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 20px'
        }}>
            <div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '16px', color: '#111' }}>
                    CUIDE DA SUA <span style={{ color: '#5579da' }}>SAÚDE</span> COM QUEM <span style={{ color: '#5579da' }}>ENTENDE</span>
                </h1>
                <p style={{ fontSize: '1rem', color: '#555', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.7 }}>
                    Bem-vindo à nossa farmácia.
                    Medicamentos, higiene e bem-estar com atendimento próximo, preço justo e entrega rápida.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        backgroundColor: '#5579da',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '14px 36px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Comece agora
                </button>
            </div>
        </main>
    );
}

export default BoasVindas;
