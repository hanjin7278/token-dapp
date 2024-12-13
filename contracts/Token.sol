// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Token
 * @dev 实现一个可购买和铸造的ERC20代币
 * 继承自OpenZeppelin的ERC20和Ownable合约
 */
contract Token is ERC20, Ownable {
    // 代币价格，1 token = 0.001 ether
    uint256 public tokenPrice = 0.001 ether;
    
    /**
     * @dev 构造函数
     * @param name 代币名称
     * @param symbol 代币符号
     * 初始铸造1,000,000代币给合约部署者
     */
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol) 
        Ownable(msg.sender)
    {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /**
     * @dev 铸造新代币
     * @param to 接收代币的地址
     * @param amount 铸造数量
     * 只有合约拥有者可以调用此函数
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev 购买代币
     * 用户发送ETH来购买代币
     * 代币数量 = ETH数量 * (1/代币价格)
     */
    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 tokenAmount = (msg.value * 1000) / tokenPrice;
        require(balanceOf(owner()) >= tokenAmount, "Insufficient tokens in contract");
        _transfer(owner(), msg.sender, tokenAmount);
    }
    
    /**
     * @dev 设置代币价格
     * @param newPrice 新的代币价格
     * 只有合约拥有者可以调用此函数
     */
    function setTokenPrice(uint256 newPrice) public onlyOwner {
        require(newPrice > 0, "Price must be greater than 0");
        tokenPrice = newPrice;
    }
    
    /**
     * @dev 提取合约中的ETH
     * 只有合约拥有者可以调用此函数
     */
    function withdrawETH() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
} 