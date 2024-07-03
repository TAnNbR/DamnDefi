const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Backdoor', function () {
    let deployer, users, player;
    let masterCopy, walletFactory, token, walletRegistry;

    const AMOUNT_TOKENS_DISTRIBUTED = 40n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, alice, bob, charlie, david, player] = await ethers.getSigners();
        users = [alice.address, bob.address, charlie.address, david.address]

        // Deploy Gnosis Safe master copy and factory contracts
        masterCopy = await (await ethers.getContractFactory('GnosisSafe', deployer)).deploy();
        walletFactory = await (await ethers.getContractFactory('GnosisSafeProxyFactory', deployer)).deploy();
        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();
        console.log("deloy GnosisSafe......");
        console.log("deloy GnosisSafeProxyFactory......");
        console.log("deloy DamnValuableToken......");

        // Deploy the registry
        walletRegistry = await (await ethers.getContractFactory('WalletRegistry', deployer)).deploy(
            masterCopy.address,
            walletFactory.address,
            token.address,
            users
        );
        expect(await walletRegistry.owner()).to.eq(deployer.address);

        console.log();
        console.log("GnosisSafe been deployed!");
        console.log("GnosisSafeProxyFactory been deployed!");
        console.log("DamnValuableToken been deployed!");
        console.log();
        
        for (let i = 0; i < users.length; i++) {
            // Users are registered as beneficiaries
            expect(
                await walletRegistry.beneficiaries(users[i])
            ).to.be.true;
            
            // User cannot add beneficiaries
            await walletRegistry.connect(
                await ethers.getSigner(users[i])
            ).addBeneficiary(users[i]);

            console.log("user",i,"has been initialized!");
        }

        // Transfer tokens to be distributed to the registry
        await token.transfer(walletRegistry.address, AMOUNT_TOKENS_DISTRIBUTED);
        
    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        
    });

    after(async function () {
        
        for (let i = 0; i < users.length; i++) {
            let wallet = await walletRegistry.wallets(users[i]);
            
            console.log("user",i,"'s wallet address: ",wallet);

            let isBeneficiary = await walletRegistry.beneficiaries(users[i]);
            console.log("user",i,"is beneficiary: ",isBeneficiary);
            console.log();
        }

        // Player must own all tokens
        console.log("attacker's address: ",player.address);
        let attackerBalance = await token.balanceOf(player.address);
        console.log("attacker's balance: ",attackerBalance.toString());
        
    });
});