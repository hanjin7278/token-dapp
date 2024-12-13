import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TokenABI from './contracts/Token.json';
import './App.css';

/**
 * @title MTK代币DApp前端应用
 * @dev 实现代币购买、铸造等功能的用户界面
 */
function App() {
  // 状态变量
  const [account, setAccount] = useState(''); // 当前连接的钱包地址
  const [balance, setBalance] = useState('0'); // 代币余额
  const [contract, setContract] = useState(null); // 代币合约实例
  const [amount, setAmount] = useState(''); // 铸造数量输入
  const [buyAmount, setBuyAmount] = useState(''); // 购买数量输入
  const [loading, setLoading] = useState(false); // 加载状态
  const [tokenPrice, setTokenPrice] = useState('0'); // 代币价格

  // 合约地址 - 请替换为实际部署的地址
  const CONTRACT_ADDRESS = '您部署的合约地址';

  // 当合约实例或账户发生变化时更新余额和代币价格
  useEffect(() => {
    if (contract && account) {
      updateBalance();
      updateTokenPrice();
    }
  }, [contract, account]);

  /**
   * 更新当前账户的代币余额
   */
  const updateBalance = async () => {
    try {
      const bal = await contract.balanceOf(account);
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error("获取余额失败:", error);
    }
  };

  /**
   * 更新代币价格
   */
  const updateTokenPrice = async () => {
    try {
      const price = await contract.tokenPrice();
      setTokenPrice(ethers.formatEther(price));
    } catch (error) {
      console.error("获取代币价格失败:", error);
    }
  };

  /**
   * 连接MetaMask钱包
   */
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        setAccount(accounts[0]);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TokenABI.abi,
          signer
        );
        setContract(tokenContract);
      } catch (error) {
        console.error("连接钱包失败:", error);
      }
    } else {
      alert("请安装 MetaMask 钱包!");
    }
  };

  /**
   * 断开钱包连接
   */
  const disconnectWallet = () => {
    setAccount('');
    setContract(null);
    setBalance('0');
    setTokenPrice('0');
  };

  /**
   * 购买代币
   */
  const buyTokens = async () => {
    if (!buyAmount) return;
    setLoading(true);
    try {
      const ethAmount = (parseFloat(buyAmount) * parseFloat(tokenPrice)).toString();
      const tx = await contract.buyTokens({
        value: ethers.parseEther(ethAmount)
      });
      await tx.wait();
      updateBalance();
      alert("购买成功！");
      setBuyAmount(''); // 清空输入框
    } catch (error) {
      console.error("购买代币失败:", error);
      alert("购买失败，请检查您的余额或网络连接");
    }
    setLoading(false);
  };

  /**
   * 铸造代币（仅管理员）
   */
  const mintTokens = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      const tx = await contract.mint(account, ethers.parseEther(amount));
      await tx.wait();
      updateBalance();
      alert("铸造成功！");
      setAmount(''); // 清空输入框
    } catch (error) {
      console.error("铸造代币失败:", error);
      alert("铸造失败，请确认您是否有管理员权限");
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <div className="container">
        <h1>MTK 代币应用</h1>
        
        <div className="wallet-section">
          {!account ? (
            <button className="connect-button" onClick={connectWallet}>
              连接钱包
            </button>
          ) : (
            <>
              <div className="account-info">
                <span>当前账户: {`${account.substring(0,6)}...${account.substring(38)}`}</span>
                <button className="disconnect-button" onClick={disconnectWallet}>
                  断开连接
                </button>
              </div>
              <div className="balance-display">
                当前余额: {balance} MTK
              </div>
            </>
          )}
        </div>

        <div className="action-section">
          <div className="action-card">
            <h2>购买代币</h2>
            <p>当前价格: {tokenPrice} ETH/代币</p>
            <input
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="请输入购买数量"
              disabled={!account}
            />
            <button 
              onClick={buyTokens}
              disabled={loading || !account || !buyAmount}
            >
              {loading ? '处理中...' : '购买代币'}
            </button>
          </div>

          <div className="action-card">
            <h2>铸造代币</h2>
            <p>仅管理员可用</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入铸造数量"
              disabled={!account}
            />
            <button 
              onClick={mintTokens}
              disabled={loading || !account || !amount}
            >
              {loading ? '处理中...' : '铸造代币'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 