import nacl from 'tweetnacl';
import bs58 from 'bs58';

export const verifySignature = (
  message: string,
  signature: string,
  publicKey: string
): boolean => {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(publicKey);

    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

export const generateNonce = (): string => {
  return Math.floor(Math.random() * 1000000).toString();
}; 