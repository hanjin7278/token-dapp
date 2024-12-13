const { ethers } = require("hardhat");
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

async function main() {
    const wallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY);
    console.log("管理员地址:", await wallet.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 