const solanaWeb3 = require("@solana/web3.js");
const bs58 = require("bs58");

// Configuration
const PRIVATE_KEY_STRING =
  "2RjLGpnn7kcDDrSkjvgEkyvjKxZ2SGjeZKbZ7n3SbPz1DM2rYzqo6S9kzTAjhMiyFJKPYju4UGJ6i7rW3isHKCzh";
const RECIPIENT_ADDRESS_STRING = "A7rqWKWCo6ykAcFQcu7oeqVm18YgP3jmwCdc5F7iVEiT";
const AMOUNT_TO_SEND_SOL = 4; // Amount in SOL

async function sendSolanaTransaction() {
  try {
    console.log("Starting Solana transaction...\n");

    // Connect to Solana Devnet
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("devnet"),
      "confirmed"
    );

    // Decode the private key
    const privateKeyBytes = bs58.default.decode(PRIVATE_KEY_STRING);
    const senderKeypair = solanaWeb3.Keypair.fromSecretKey(privateKeyBytes);

    // Convert recipient address string to PublicKey
    const recipientPublicKey = new solanaWeb3.PublicKey(
      RECIPIENT_ADDRESS_STRING
    );

    // Get sender's balance
    const senderBalanceLamports = await connection.getBalance(
      senderKeypair.publicKey
    );

    console.log(`Sender address: ${senderKeypair.publicKey.toBase58()}`);
    
    const senderBalanceSOL =
      senderBalanceLamports / solanaWeb3.LAMPORTS_PER_SOL;
    console.log(`Sender balance: ${senderBalanceSOL} SOL`);

    // Calculate amount in lamports
    const amountLamports = AMOUNT_TO_SEND_SOL * solanaWeb3.LAMPORTS_PER_SOL;

    // Create a transaction
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amountLamports,
      })
    );

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;

    // Sign transaction
    transaction.sign(senderKeypair);

    // Send transaction
    console.log(
      `Sending ${AMOUNT_TO_SEND_SOL} SOL from ${senderKeypair.publicKey.toBase58()} to ${RECIPIENT_ADDRESS_STRING}...`
    );
    const signature = await connection.sendRawTransaction(
      transaction.serialize()
    );

    console.log("\n✓ Transaction sent successfully!");
    console.log("Transaction Signature:", signature);
    console.log(
      `View on Solscan: https://solscan.io/tx/${signature}?cluster=devnet`
    );

    return signature;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

// Run the Solana transaction
sendSolanaTransaction()
  .then(() => {
    console.log("\nSolana transaction completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nSolana transaction failed:", error.message);
    process.exit(1);
  });
