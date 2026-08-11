import { useState, useEffect, type FC } from 'react';
import { Settings, Loader2, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Image as ImageIcon, DollarSign, MessageCircle, Receipt, ArrowDownUp } from 'lucide-react';
import type { StoreSettings } from '@/types';
import { supabase } from '@/lib/supabase';
import { LoadingState, ErrorState, Field, inputClass } from './shared';

const SettingsTab: FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [upsellEnabled, setUpsellEnabled] = useState(true);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [pricePackage1, setPricePackage1] = useState('');
  const [pricePackage2, setPricePackage2] = useState('');
  const [pricePackage3, setPricePackage3] = useState('');
  const [priceUnlockRgh, setPriceUnlockRgh] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [invoiceEnabled, setInvoiceEnabled] = useState(true);
  const [postPurchaseOrder, setPostPurchaseOrder] = useState<'upsell_first' | 'invoice_first'>('upsell_first');
  const [tier1Max, setTier1Max] = useState('15');
  const [tier2Max, setTier2Max] = useState('25');
  const [tier3Max, setTier3Max] = useState('30');

  const load = async () => {
    setLoading(true);
    setError(false);
    const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle();
    if (error || !data) {
      setError(true);
    } else {
      setSettings(data);
      setUpsellEnabled(data.upsell_enabled);
      setHeroTitle(data.hero_title);
      setHeroSubtitle(data.hero_subtitle);
      setBadgeText(data.badge_text);
      setBackgroundImageUrl(data.background_image_url || '');
      setPricePackage1(data.price_package_1?.toString() || '120');
      setPricePackage2(data.price_package_2?.toString() || '150');
      setPricePackage3(data.price_package_3?.toString() || '180');
      setPriceUnlockRgh(data.price_unlock_rgh?.toString() || '5');
      setWhatsappEnabled(data.whatsapp_button_enabled ?? false);
      setWhatsappNumber(data.whatsapp_number || '');
      setInvoiceEnabled(data.invoice_screen_enabled ?? true);
      setPostPurchaseOrder(data.post_purchase_order ?? 'upsell_first');
      setTier1Max(data.tier_1_max?.toString() || '15');
      setTier2Max(data.tier_2_max?.toString() || '25');
      setTier3Max(data.tier_3_max?.toString() || '30');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setSaveError(false);
    setSaved(false);
    const { error } = await supabase.from('store_settings').update({
      upsell_enabled: upsellEnabled,
      hero_title: heroTitle.trim(),
      hero_subtitle: heroSubtitle.trim(),
      badge_text: badgeText.trim(),
      background_image_url: backgroundImageUrl.trim() || null,
      price_package_1: parseFloat(pricePackage1) || 120,
      price_package_2: parseFloat(pricePackage2) || 150,
      price_package_3: parseFloat(pricePackage3) || 180,
      price_unlock_rgh: parseFloat(priceUnlockRgh) || 5,
      whatsapp_button_enabled: whatsappEnabled,
      whatsapp_number: whatsappNumber.replace(/\D/g, ''),
      invoice_screen_enabled: invoiceEnabled,
      post_purchase_order: postPurchaseOrder,
      tier_1_max: parseInt(tier1Max) || 15,
      tier_2_max: parseInt(tier2Max) || 25,
      tier_3_max: parseInt(tier3Max) || 30,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);

    setSaving(false);
    if (error) {
      setSaveError(true);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) return <LoadingState text="Carregando configurações..." />;
  if (error || !settings) return <ErrorState text="Erro ao carregar configurações." onRetry={load} />;

  return (
    <div className="space-y-5 max-w-lg">
      {/* Upsell toggle */}
      <section className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-xbox-400" />
          <h2 className="text-lg font-bold text-white">Oferta de Upsell</h2>
        </div>
        <button
          onClick={() => setUpsellEnabled(!upsellEnabled)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 transition-all"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Ativar tela de acessórios</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {upsellEnabled ? 'Clientes verão a oferta de acessórios após o pedido' : 'Clientes irão direto para a tela de sucesso'}
            </p>
          </div>
          {upsellEnabled ? (
            <ToggleRight className="w-10 h-10 text-xbox-400 shrink-0" />
          ) : (
            <ToggleLeft className="w-10 h-10 text-neutral-600 shrink-0" />
          )}
        </button>
      </section>

      {/* Interface texts */}
      <section className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Textos da Interface</h2>
        <div className="space-y-4">
          <Field label="Título Principal">
            <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Monte seu HD de Xbox 360" className={inputClass} />
          </Field>
          <Field label="Subtítulo">
            <input type="text" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Escolha seu console..." className={inputClass} />
          </Field>
          <Field label="Texto da Etiqueta/Badge">
            <input type="text" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="Xbox 360" className={inputClass} />
            <p className="text-xs text-neutral-600 mt-1.5">Aparece na pílula verde no topo do site</p>
          </Field>
        </div>
      </section>

      {/* Background image */}
      <section className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-xbox-400" />
          <h2 className="text-lg font-bold text-white">Imagem de Fundo</h2>
        </div>
        <Field label="URL da Imagem de Fundo" hint="Tamanho recomendado: 1920x1080 pixels (Paisagem) em formato JPG ou WebP de alta compressão">
          <input type="text" value={backgroundImageUrl} onChange={(e) => setBackgroundImageUrl(e.target.value)} placeholder="https://..." className={inputClass} />
        </Field>
        {backgroundImageUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-neutral-800">
            <img src={backgroundImageUrl} alt="Preview do fundo" className="w-full h-32 object-cover" />
          </div>
        )}
      </section>

      {/* Pricing config */}
      <section className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-xbox-400" />
          <h2 className="text-lg font-bold text-white">Configurações de Preço</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pacote 1 — Limite de jogos">
              <input type="number" value={tier1Max} onChange={(e) => setTier1Max(e.target.value)} placeholder="15" className={inputClass} />
            </Field>
            <Field label="Pacote 1 — Preço">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-semibold">R$</span>
                <input type="number" step="0.01" value={pricePackage1} onChange={(e) => setPricePackage1(e.target.value)} placeholder="120.00" className={inputClass + ' pl-10'} />
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pacote 2 — Limite de jogos">
              <input type="number" value={tier2Max} onChange={(e) => setTier2Max(e.target.value)} placeholder="25" className={inputClass} />
            </Field>
            <Field label="Pacote 2 — Preço">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-semibold">R$</span>
                <input type="number" step="0.01" value={pricePackage2} onChange={(e) => setPricePackage2(e.target.value)} placeholder="150.00" className={inputClass + ' pl-10'} />
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pacote 3 — Limite de jogos">
              <input type="number" value={tier3Max} onChange={(e) => setTier3Max(e.target.value)} placeholder="30" className={inputClass} />
            </Field>
            <Field label="Pacote 3 — Preço">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-semibold">R$</span>
                <input type="number" step="0.01" value={pricePackage3} onChange={(e) => setPricePackage3(e.target.value)} placeholder="180.00" className={inputClass + ' pl-10'} />
              </div>
            </Field>
          </div>
          <Field label="Taxa de Desbloqueio RGH" hint="Cobrada apenas quando o console ainda é original (bloqueado)">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-semibold">R$</span>
              <input type="number" step="0.01" value={priceUnlockRgh} onChange={(e) => setPriceUnlockRgh(e.target.value)} placeholder="5.00" className={inputClass + ' pl-10'} />
            </div>
          </Field>
        </div>
      </section>

      {/* Post-purchase order config */}
      <section className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ArrowDownUp className="w-5 h-5 text-xbox-400" />
          <h2 className="text-lg font-bold text-white">Ordem das Telas Pós-Compra</h2>
        </div>
        <Field label="Sequência de telas após finalizar o pedido" hint="Telas desativadas nos toggles acima/below serão puladas automaticamente">
          <select
            value={postPurchaseOrder}
            onChange={(e) => setPostPurchaseOrder(e.target.value as 'upsell_first' | 'invoice_first')}
            className={inputClass}
          >
            <option value="upsell_first">Upsell {'->'} Fatura</option>
            <option value="invoice_first">Fatura {'->'} Upsell</option>
          </select>
        </Field>
      </section>

      {/* WhatsApp + Invoice config */}
      <section className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-xbox-400" />
          <h2 className="text-lg font-bold text-white">Controles de Conversão</h2>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => setWhatsappEnabled(!whatsappEnabled)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 transition-all"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Ativar Botão Flutuante de WhatsApp</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {whatsappEnabled ? 'Botão de suporte visível em todas as etapas' : 'Botão de suporte desativado'}
              </p>
            </div>
            {whatsappEnabled ? (
              <ToggleRight className="w-10 h-10 text-xbox-400 shrink-0" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-neutral-600 shrink-0" />
            )}
          </button>
          <Field label="Número do WhatsApp para Suporte" hint="Apenas números, com DDI e DDD (ex: 5511999999999). Só funciona se o toggle acima estiver ativo.">
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="5511999999999"
              disabled={!whatsappEnabled}
              className={inputClass + ' disabled:opacity-50 disabled:cursor-not-allowed'}
            />
          </Field>
          <button
            onClick={() => setInvoiceEnabled(!invoiceEnabled)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-800/50 border border-neutral-800 hover:border-neutral-700 transition-all"
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-neutral-400" />
                <p className="text-sm font-semibold text-white">Exibir Fatura/Resumo no Final do Pedido</p>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {invoiceEnabled ? 'Cliente verá o resumo do pedido na tela de sucesso' : 'Apenas mensagem de agradecimento na tela final'}
              </p>
            </div>
            {invoiceEnabled ? (
              <ToggleRight className="w-10 h-10 text-xbox-400 shrink-0" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-neutral-600 shrink-0" />
            )}
          </button>
        </div>
      </section>

      {/* Save button + feedback */}
      {saveError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> Erro ao salvar. Tente novamente.
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-xbox-500/10 border border-xbox-500/30 text-xbox-400 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Configurações salvas com sucesso!
        </div>
      )}
      <button
        onClick={save}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-xbox-500 text-white font-semibold hover:bg-xbox-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Salvar Configurações
      </button>
    </div>
  );
};

export default SettingsTab;
