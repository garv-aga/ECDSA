import { useState } from "react";
import server from "./server";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import * as secp from "ethereum-cryptography/secp256k1";

function hashMeassage(message) {
  return keccak256(utf8ToBytes(message));
}

function HashTransaction(transaction) {
  return hashMeassage(JSON.stringify(transaction));
}

function signTransaction(transactionHash, privateKey) {
  return secp.sign(transactionHash, privateKey, {recovered: true});
}

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const transaction = {
        sender: address,
        amount: parseInt(sendAmount),
        recipient
      }

      transaction.transactionHash = toHex(HashTransaction(transaction));
      const [signature, recoveryBit] = await signTransaction(transaction.transactionHash, privateKey);
      transaction.signature = toHex(signature);
      transaction.recoveryBit = recoveryBit;

      const {
        data: { balance },
      } = await server.post(`send`, transaction);
      setBalance(balance);
    } catch (ex) {
      alert(ex);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
