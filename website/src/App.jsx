import { useState } from 'react'
import './index.css'

function App() {
  const [copied, setCopied] = useState(false);
  const contractAddress = "0xA9B4a901400e959CF51a89Ed928e5aDb151bD395";
  const pancakeSwapLink = `https://pancakeswap.finance/swap?outputCurrency=${contractAddress}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Navigation */}
      <nav style={{ padding: '20px 0', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-color)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '900', fontSize: '1.5rem', color: 'var(--primary-color)' }}>
            CJP <span style={{ color: 'var(--text-color)' }}>COIN</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#about">About</a>
            <a href="#tokenomics">Tokenomics</a>
            <a href={pancakeSwapLink} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>Buy Now</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <img 
          src="/logo.png" 
          alt="The Cockroach Janta Party Logo" 
          className="animate-float"
          style={{ width: '100%', maxWidth: '350px', marginBottom: '30px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} 
        />
        <h1 className="title">
          THE COCKROACH <br/>
          <span className="text-gradient">JANTA PARTY</span>
        </h1>
        <p className="subtitle">
          The most resilient meme coin on the Binance Smart Chain. We will outlive everyone. 🪳
        </p>
        
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto 40px', padding: '20px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Official Contract Address (BSC)</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <code style={{ background: 'var(--bg-color-light)', padding: '10px 15px', borderRadius: '8px', fontSize: '1rem', wordBreak: 'break-all' }}>
              {contractAddress}
            </code>
            <button onClick={copyToClipboard} className="btn" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 20px' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={pancakeSwapLink} target="_blank" rel="noreferrer" className="btn btn-primary">
            Buy on PancakeSwap
          </a>
          <a href="#tokenomics" className="btn btn-secondary">
            View Tokenomics
          </a>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="container" style={{ padding: '80px 20px' }}>
        <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2 className="title" style={{ textAlign: 'left', fontSize: '3rem' }}>Why <span className="text-gradient">CJP?</span></h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-muted)' }}>
              Cockroaches are known for one thing: survival. They can survive nuclear fallout, and they can definitely survive the bear market. 
            </p>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              The Cockroach Janta Party is not just a meme; it's a movement. With a hardcoded deflationary mechanism, every single trade makes the remaining supply more valuable. 
            </p>
          </div>
          <div style={{ flex: '1', minWidth: '300px', textAlign: 'center' }}>
             <div style={{ fontSize: '5rem' }}>💪🪳🚀</div>
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section id="tokenomics" className="container" style={{ padding: '80px 20px' }}>
        <h2 className="title">Tokenomics</h2>
        <p className="subtitle">Fixed supply. Deflationary burn. No hidden taxes.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '50px' }}>
          
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--primary-color)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>1% Auto Burn 🔥</h3>
            <p style={{ color: 'var(--text-muted)' }}>1% of every single buy, sell, and transfer is automatically destroyed forever. The supply constantly shrinks.</p>
          </div>
          
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--secondary-color)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>0% Hidden Tax 💰</h3>
            <p style={{ color: 'var(--text-muted)' }}>No dev taxes, no marketing taxes hidden in the contract. What you trade is what you get (minus the 1% burn).</p>
          </div>
          
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--accent-color)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>1000 Billion Fixed 🔒</h3>
            <p style={{ color: 'var(--text-muted)' }}>No mint function. The initial supply of 1000 Billion can never be increased, only decreased via the burn.</p>
          </div>

        </div>

        <div className="glass-panel" style={{ marginTop: '50px' }}>
          <h3 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '30px' }}>Initial Distribution</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Community & Public</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>40%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Liquidity Pool</span>
              <span style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>25%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Marketing</span>
              <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>15%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Team</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>10%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Burn Reserve</span>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>10%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-color-light)', padding: '40px 20px', textAlign: 'center', marginTop: '60px', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Join the Party</h2>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
            {/* Replace # with actual links once user creates them */}
            <a href="#" className="btn" style={{ background: '#1DA1F2', color: 'white' }}>Twitter / X</a>
            <a href="#" className="btn" style={{ background: '#0088cc', color: 'white' }}>Telegram</a>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            Disclaimer: Cryptocurrency trading involves high risk. CJP is a meme coin created for entertainment purposes only and holds no intrinsic value. Invest at your own risk.
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: '20px' }}>
            &copy; {new Date().getFullYear()} The Cockroach Janta Party. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}

export default App
