import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  number: string;
}

const WhatsAppButton = ({ number }: WhatsAppButtonProps) => {
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-fade-in"
    >
      <MessageCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
    </a>
  );
};

export default WhatsAppButton;
