const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "04e2033d682f122bb4284485685514480ef6dd39c9e60b115a6a38715a51a2749b491e5ba130e5da77ce4cd0a09c2110795cd1f65f9c5df639007960af63066d94": 100, //Private Key - 3bbaca3b8fa0a47e94cc83b7ea6ddca406c3db15ecef462126aa4d90ff40cc94
  "046b50a1f94f078a9c08f574784da7a46a3aa52286edc433dc88cee97413331b217ad0ff6f75f1fafc267ea9e0d550e51837be8d5b96eb6e012ecaa2b4f09de76f": 50, //Private Key - 0769db3d5a40322a1b6d0799818ad2695a3aeec24e8aec2ec72b000da514f679
  "044ffb49259a52f610a688b3895814d614af7db6f1db54f5e8d09f1a73e700d3700b08c26785e166e576d8f4c2f302773227b36a889b5b697bcacb1b8500844b19": 75, //Private Key - b048eec9c95109c2f6cf5bfda0dbb7034c28e7a3f82a7c95f197b35f7c0b995b
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, transactionHash, signature, recoveryBit } = req.body;

  publicKey = secp.recoverPublicKey(hexToBytes(transactionHash), hexToBytes(signature), recoveryBit);

  if (sender !== toHex(publicKey)) {
    res.status(409).send({ message: "Sender is not the signer" });
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
