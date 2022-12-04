
import StellarSdk from "stellar-sdk";

// Set up the Stellar client
const server = new StellarSdk.Server("https://horizon.stellar.org");

// Set up the issuer account
const issuerSecretKey = "YOUR_ISSUER_SECRET_KEY";
const issuerAccount = StellarSdk.Keypair.fromSecret(issuerSecretKey);

// Set up the buyer account
const buyerSecretKey = "YOUR_BUYER_SECRET_KEY";
const buyerAccount = StellarSdk.Keypair.fromSecret(buyerSecretKey);

// Set up the NFT asset
const nftAsset = new StellarSdk.Asset("MyNFT", issuerAccount.publicKey());

// Set up the issuer's trustline for the NFT asset
await server.loadAccount(issuerAccount.publicKey())
  .then(issuer => {
    const transaction = new StellarSdk.TransactionBuilder(issuer)
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: nftAsset,
        limit: "1000000"
      }))
      .build();
    transaction.sign(issuerAccount);
    return server.submitTransaction(transaction);
  });

// Create a new NFT token
const nftTokenId = "1";
const nftTokenData = {
  name: "My NFT Token",
  description: "A unique and valuable NFT token.",
  image: "https://example.com/my-nft-token.png"
};
const createTokenTransaction = new StellarSdk.TransactionBuilder(issuer)
  .addOperation(StellarSdk.Operation.manageData({
    name: nftTokenId,
    value: JSON.stringify(nftTokenData)
  }))
  .build();
createTokenTransaction.sign(issuerAccount);
await server.submitTransaction(createTokenTransaction);

// Transfer the NFT token to the buyer's account
const transferTransaction = new StellarSdk.TransactionBuilder(issuer)
  .addOperation(StellarSdk.Operation.payment({
    destination: buyerAccount.publicKey(),
    asset: nftAsset,
    amount: "1"
  }))
  .build();
transferTransaction.sign(issuerAccount);
await server.submitTransaction(transferTransaction);

// Retrieve the NFT token data from the buyer's account
const buyerAccountData = await server.loadAccount(buyerAccount.publicKey())
  .then(account => {
    const nftTokenData = account.data_attr[nftTokenId];
    return JSON.parse(nftTokenData);
  });
console.log(buyerAccountData); // { name: "My NFT Token", ... }
