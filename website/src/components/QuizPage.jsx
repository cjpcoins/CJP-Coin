import { useState } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';

// You will replace this with the actual deployed address later
const AIRDROP_CONTRACT_ADDRESS = "0x1ADAb32DbD361185A1209827BdB6E4E4Ac3441A0"; 
const AIRDROP_ABI = [
  "function claim() external"
];

const QuizPage = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState('');
  
  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      question: "What is the fixed total supply of The Cockroach Janta Party (CJP)?",
      options: ["1 Million", "100 Billion", "1,000 Billion (1 Trillion)", "Unlimited"],
      answer: "1,000 Billion (1 Trillion)"
    },
    {
      question: "What makes CJP a 'deflationary' token?",
      options: ["The developer prints more coins", "A 1% auto-burn on every transaction", "It is locked forever", "There is no tax"],
      answer: "A 1% auto-burn on every transaction"
    },
    {
      question: "Why was the Cockroach chosen as the mascot?",
      options: ["Because they are gross", "To represent surviving any market condition (Bull or Bear!)", "Because it sounds funny", "No reason"],
      answer: "To represent surviving any market condition (Bull or Bear!)"
    }
  ];

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
      } catch (error) {
        console.error("User rejected request");
      }
    } else {
      alert("Please install MetaMask to claim the airdrop!");
    }
  };

  const handleAnswerClick = (selectedOption) => {
    if (selectedOption === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
    
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowResults(true);
    }
  };

  const claimReward = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      setIsClaiming(true);
      setClaimStatus('Waiting for transaction approval...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, AIRDROP_ABI, signer);
      
      const tx = await contract.claim();
      setClaimStatus('Transaction sent! Waiting for confirmation...');
      
      await tx.wait();
      
      setClaimStatus('Success! 10,000 CJP has been sent to your wallet! (Minus 1% burn tax)');
    } catch (error) {
      console.error(error);
      if (error.reason && error.reason.includes("24 hours")) {
         setClaimStatus('Error: You have already claimed in the last 24 hours!');
      } else if (error.reason && error.reason.includes("empty")) {
         setClaimStatus('Error: The Daily 50M pool is currently empty. Try again tomorrow!');
      } else {
         setClaimStatus('Transaction failed or was rejected. Make sure you have enough BNB to pay the gas fee.');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="container" style={{ padding: '80px 20px', minHeight: '80vh', textAlign: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(to right, var(--primary-color), white, var(--secondary-color))' }}></div>
        
        <h1 className="title" style={{ fontSize: '3rem', marginTop: '20px' }}>
          Daily CJP <span className="text-gradient">Airdrop</span>
        </h1>
        <p className="subtitle" style={{ marginBottom: '40px' }}>
          Answer 3 simple questions to prove you are a true Janta Party member and claim <strong style={{ color: 'var(--secondary-color)' }}>10,000 CJP</strong>! (Limit 1 per wallet every 24 hours).
        </p>

        {!walletAddress ? (
          <button onClick={connectWallet} className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1.2rem' }}>
            Connect Wallet to Start
          </button>
        ) : (
          <div style={{ display: 'inline-block', padding: '10px 20px', borderRadius: '50px', background: 'rgba(19, 136, 8, 0.1)', border: '1px solid var(--secondary-color)', color: 'var(--secondary-color)', marginBottom: '30px' }}>
            Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
          </div>
        )}

        {walletAddress && !showResults && (
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '30px', borderRadius: '20px', textAlign: 'left' }}>
            <div style={{ color: 'var(--primary-color)', fontSize: '0.9rem', marginBottom: '15px', fontWeight: 'bold' }}>
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{questions[currentQuestion].question}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  style={{ 
                    textAlign: 'left', padding: '15px 20px', borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'white', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.1rem'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.background = 'rgba(255, 153, 51, 0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {showResults && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: 'rgba(0,0,0,0.4)', padding: '40px', borderRadius: '20px' }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Quiz Completed!</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: 'var(--text-muted)' }}>Your Score: <strong style={{color: 'white'}}>{score} / {questions.length}</strong></p>
            
            {score === questions.length ? (
              <div>
                <p style={{ color: 'var(--secondary-color)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '30px' }}>🎉 Perfect Score! You are eligible to claim.</p>
                
                <button 
                  onClick={claimReward}
                  disabled={isClaiming}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '20px', fontSize: '1.2rem', opacity: isClaiming ? 0.5 : 1 }}
                >
                  {isClaiming ? 'Processing Transaction...' : 'Claim 10,000 CJP Now!'}
                </button>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '20px' }}>
                  * Requires a standard ~0.03 BNB network gas fee.<br/>A 1% burn tax applies automatically.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ color: '#ef4444', fontSize: '1.2rem', marginBottom: '30px' }}>Oops! You need a perfect score to claim the daily reward.</p>
                <button 
                  onClick={() => {
                    setCurrentQuestion(0);
                    setScore(0);
                    setShowResults(false);
                  }}
                  className="btn"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  Try Again
                </button>
              </div>
            )}
            
            {claimStatus && (
              <div style={{ marginTop: '30px', padding: '15px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1rem', color: claimStatus.includes('Error') ? '#ef4444' : 'var(--secondary-color)' }}>
                {claimStatus}
              </div>
            )}
          </motion.div>
        )}

      </motion.div>
    </div>
  );
};

export default QuizPage;
