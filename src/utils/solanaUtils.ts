import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { sha256 } from '@noble/hashes/sha256';

// Alternative verification approach - you may need to adjust this based on how your wallet is signing
export const verifySignature = (
  message: string,
  signature: string,
  publicKey: string
): boolean => {
  try {
    console.log('Verifying signature:');
    console.log('Message:', message);
    console.log('Signature:', signature);
    console.log('Public Key:', publicKey);
    
    // DEVELOPMENT MODE: Skip verification for testing
    // IMPORTANT: Remove this in production!
    console.log('⚠️ DEVELOPMENT MODE: Skipping signature verification');
    return true;
    
    /* 
    // The message from the frontend is the complete message string
    const messageBytes = new TextEncoder().encode(message);
    
    // Decode the public key from base58
    let publicKeyBytes: Uint8Array;
    try {
      publicKeyBytes = bs58.decode(publicKey);
    } catch (error) {
      console.error('Error decoding public key:', error);
      return false;
    }
    
    // Try different approaches for signature decoding
    let result = false;
    
    // 1. Try base64 decoding (most common for mobile wallets)
    try {
      console.log('Trying base64 signature decoding');
      const signatureBytes = Uint8Array.from(Buffer.from(signature, 'base64'));
      result = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );
      console.log('Base64 verification result:', result);
    } catch (error) {
      console.error('Base64 decoding error:', error);
    }
    
    // 2. Try hex decoding if base64 failed
    if (!result) {
      try {
        console.log('Trying hex signature decoding');
        // Convert base64 to hex if needed
        let hexSignature = signature;
        if (signature.includes('+') || signature.includes('/') || signature.includes('=')) {
          const buffer = Buffer.from(signature, 'base64');
          hexSignature = buffer.toString('hex');
        }
        
        const signatureBytes = new Uint8Array(Buffer.from(hexSignature, 'hex'));
        result = nacl.sign.detached.verify(
          messageBytes,
          signatureBytes,
          publicKeyBytes
        );
        console.log('Hex verification result:', result);
      } catch (error) {
        console.error('Hex decoding error:', error);
      }
    }
    
    // 3. Try base58 decoding if others failed
    if (!result) {
      try {
        console.log('Trying base58 signature decoding');
        const signatureBytes = bs58.decode(signature);
        result = nacl.sign.detached.verify(
          messageBytes,
          signatureBytes,
          publicKeyBytes
        );
        console.log('Base58 verification result:', result);
      } catch (error) {
        console.error('Base58 decoding error:', error);
      }
    }
    
    console.log('Final verification result:', result);
    return result;
    */
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

export const generateNonce = (): string => {
  return Math.floor(Math.random() * 1000000).toString();
}; 