export const metadata = { title: "About — Cipher Lab" };

export default function About() {
  return (
    <div className="card mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">About Cipher Lab</h1>
      <p className="text-soft">Cipher Lab is an educational tool for learning how classical ciphers work. You can encrypt and decrypt text, then replay every step: which letter was processed, which numbers were used, and why the result came out that way.</p>
      <ul className="list-disc space-y-1 pl-5 text-soft">
        <li>Everything runs locally in your browser. Your text is never sent anywhere.</li>
        <li>Twelve ciphers: Caesar, Atbash, Affine, Vigenère, Autokey, Beaufort, Playfair, Hill, Rail Fence, Columnar Transposition, ROT13 and Bacon&apos;s cipher.</li>
        <li>Each cipher states clearly how it treats case, spaces, digits and punctuation.</li>
      </ul>
      <p className="rounded-xl border border-line bg-black/20 p-3 text-sm">These classical ciphers are designed for learning and historical study. They are not secure for protecting modern sensitive information. Use modern, well-reviewed cryptography (such as AES-GCM or ChaCha20-Poly1305 via a trusted library) for real data.</p>
    </div>
  );
}
