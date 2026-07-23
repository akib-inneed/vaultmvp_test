'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Compressor from 'compressorjs';
import { createItem } from '../actions';
import { BottomNav } from '@/components/vault/BottomNav';

type SaveState = 'idle' | 'saving' | 'success' | 'error';
type PhotoStage = 'none' | 'preview' | 'confirmed';

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.7,
      maxWidth: 1200,
      maxHeight: 1200,
      success(result) {
        const compressed = new File([result], file.name, { type: result.type });
        resolve(compressed);
      },
      error(err) {
        reject(err);
      },
    });
  });
}

interface PetDetailsState {
  species: string;
  breed: string;
  age: string;
  vet_name: string;
  vet_phone: string;
  feeding_schedule: string;
  medications: string;
  special_care: string;
  personality_notes: string;
}

const EMPTY_PET_DETAILS: PetDetailsState = {
  species: '', breed: '', age: '', vet_name: '', vet_phone: '',
  feeding_schedule: '', medications: '', special_care: '', personality_notes: '',
};

export default function NewItemPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [photoStage, setPhotoStage] = useState<PhotoStage>('none');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [description, setDescription] = useState('');
  const [dictateHint, setDictateHint] = useState(false);
  const [itemType, setItemType] = useState<'item' | 'pet'>('item');
  const [itemName, setItemName] = useState('');
  const [petDetails, setPetDetails] = useState<PetDetailsState>(EMPTY_PET_DETAILS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const pending = sessionStorage.getItem('vault_pending_image');
    if (!pending || !fileInputRef.current) return;
    sessionStorage.removeItem('vault_pending_image');
    setPreview(pending);
    setPhotoStage('preview');
    const [header, data] = pending.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const file = new File([bytes], 'photo.jpg', { type: mime });
    setPendingFile(file);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Photo must be under 10 MB.');
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPendingFile(file);
    setPhotoStage('preview');
  }

  async function handleConfirmPhoto() {
    if (!pendingFile) return;
    try {
      const compressed = await compressImage(pendingFile);
      const dt = new DataTransfer();
      dt.items.add(compressed);
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
      setPendingFile(compressed);
      setPhotoStage('confirmed');
    } catch {
      const dt = new DataTransfer();
      dt.items.add(pendingFile);
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
      setPhotoStage('confirmed');
    }
  }

  function handleRetakePhoto() {
    setPreview(null);
    setPendingFile(null);
    setPhotoStage('none');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => fileInputRef.current?.click(), 100);
  }

  function handleRemovePhoto() {
    setPreview(null);
    setPendingFile(null);
    setPhotoStage('none');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDictateTap() {
    // Focus the textarea to open the keyboard
    if (descriptionRef.current) {
      descriptionRef.current.focus();
      // Place cursor at end
      const len = descriptionRef.current.value.length;
      descriptionRef.current.setSelectionRange(len, len);
    }
    // Show hint
    setDictateHint(true);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setDictateHint(false), 4000);
  }

  function updatePetDetail(field: keyof PetDetailsState, value: string) {
    setPetDetails((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(formData: FormData) {
    if (saveState === 'saving') return;

    if (pendingFile && photoStage !== 'none') {
      try {
        const file = photoStage === 'confirmed' ? pendingFile : await compressImage(pendingFile);
        formData.set('photo', file);
      } catch {
        formData.set('photo', pendingFile);
      }
    }

    formData.set('item_type', itemType);
    if (itemType === 'pet') {
      const filtered = Object.fromEntries(
        Object.entries(petDetails).filter(([, v]) => v.trim() !== '')
      );
      formData.set('pet_details', JSON.stringify(filtered));
    }

    setSaveState('saving');
    setError(null);
    try {
      const result = await createItem(formData);
      if (result?.error) {
        setError(result.error);
        setSaveState('error');
        setTimeout(() => setSaveState('idle'), 100);
      } else if (result?.success && result.itemId) {
        setSaveState('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch {
      setError('Something went wrong. Try again.');
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 100);
    }
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Nav */}
      <nav className="border-b border-ink/10 bg-cream/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="text-ink/40 hover:text-ink transition">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <span className="font-serif text-lg font-semibold text-ink">Add item</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <form action={handleSubmit} className="space-y-8">

          {/* Type selector */}
          <div>
            <p className="font-mono text-[10px] text-teal/70 tracking-[0.2em] uppercase mb-2">Type</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setItemType('item')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-sans font-medium transition min-h-[44px] ${
                  itemType === 'item'
                    ? 'bg-teal text-cream'
                    : 'bg-jungle text-ink/50 border border-ink/15 hover:border-teal/30'
                }`}
              >
                Item
              </button>
              <button
                type="button"
                onClick={() => setItemType('pet')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-sans font-medium transition min-h-[44px] flex items-center justify-center gap-2 ${
                  itemType === 'pet'
                    ? 'bg-teal text-cream'
                    : 'bg-jungle text-ink/50 border border-ink/15 hover:border-teal/30'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M5.5 2C4.67 2 4 2.9 4 4s.67 2 1.5 2S7 5.1 7 4s-.67-2-1.5-2zM10.5 2C9.67 2 9 2.9 9 4s.67 2 1.5 2S12 5.1 12 4s-.67-2-1.5-2zM3 6.5C2.17 6.5 1.5 7.4 1.5 8.5S2.17 10.5 3 10.5 4.5 9.6 4.5 8.5 3.83 6.5 3 6.5zM13 6.5c-.83 0-1.5.9-1.5 2s.67 2 1.5 2 1.5-.9 1.5-2-.67-2-1.5-2zM8 7c-1.66 0-3 1.79-3 4 0 1.1.45 2 1 2 .35 0 .68-.25 1-.67.32.42.65.67 1 .67s.68-.25 1-.67c.32.42.65.67 1 .67.55 0 1-.9 1-2 0-2.21-1.34-4-3-4z" fill="currentColor"/>
                </svg>
                Pet
              </button>
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <p className="font-mono text-[10px] text-teal/70 tracking-[0.2em] uppercase mb-1">Step 1</p>
            <p className="font-serif text-xl font-semibold text-ink mb-3">
              {itemType === 'pet' && itemName ? `Add a photo of ${itemName}` : itemType === 'pet' ? 'Pet Photo' : 'Item Image'}
              {' '}<span className="text-ink/30 font-normal text-sm font-sans">(optional)</span>
            </p>

            {photoStage === 'none' && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-44 sm:h-64 rounded-2xl border-2 border-dashed border-ink/15 bg-jungle hover:border-teal/40 hover:bg-teal/5 transition overflow-hidden relative flex items-center justify-center group"
              >
                <div className="text-center px-6">
                  <div className="w-14 h-14 rounded-full bg-ink/5 flex items-center justify-center mx-auto mb-3 group-hover:bg-teal/10 transition">
                    <svg width="26" height="22" viewBox="0 0 26 22" fill="none" className="text-ink/30 group-hover:text-teal transition">
                      <rect x="1" y="5" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="13" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M9 5l1.5-3h5L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="21" cy="9" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                  <p className="text-sm text-ink/40 font-sans">Tap to photograph item</p>
                  <p className="text-xs text-ink/25 font-sans mt-1">JPEG, PNG, WebP · up to 10 MB</p>
                </div>
              </button>
            )}

            {(photoStage === 'preview' || photoStage === 'confirmed') && preview && (
              <div>
                <div className="w-full h-44 sm:h-64 rounded-2xl overflow-hidden relative bg-jet">
                  <Image
                    src={preview}
                    alt="Item preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {photoStage === 'preview' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleRetakePhoto}
                      className="flex-1 py-2.5 px-4 text-sm text-ink/50 border border-ink/15 rounded-xl hover:bg-ink/5 font-sans transition min-h-[44px]"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPhoto}
                      className="flex-1 py-2.5 px-4 text-sm bg-teal text-cream rounded-xl hover:bg-teal/90 font-sans font-medium transition min-h-[44px]"
                    >
                      Use this photo
                    </button>
                  </div>
                )}
                {photoStage === 'confirmed' && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="mt-2 text-xs text-ink/40 hover:text-vault-red font-sans transition"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Item / Pet name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5 font-sans">
              {itemType === 'pet' ? "Pet's name" : 'Item name'} <span className="text-vault-red">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={200}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-jet text-ink placeholder-ink/35 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
              placeholder={itemType === 'pet' ? "e.g. Luna, Max, Bella" : "e.g. Gold bangles, 1962 Gibson guitar, Grandmother's ring"}
            />
          </div>

          {/* Description / Care notes with dictation helper */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-ink mb-1.5 font-sans">
              {itemType === 'pet' ? 'Care notes' : 'Description'} <span className="text-ink/40 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                ref={descriptionRef}
                id="description"
                name="description"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-ink/20 bg-jet text-ink placeholder-ink/35 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition resize-none"
                placeholder="Describe it in your own words — why it matters, what to do with it, anything they should know."
              />
              <button
                type="button"
                onClick={handleDictateTap}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-ink/10"
                aria-label="Tap to dictate"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-ink/40">
                  <rect x="6" y="1" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 8a6 6 0 0012 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {dictateHint && (
              <p className="text-xs text-ink/50 font-sans mt-1.5 animate-fade-in">
                Use the 🎤 key on your keyboard to dictate
              </p>
            )}
          </div>

          {/* Pet details section */}
          {itemType === 'pet' && (
            <div className="bg-jungle rounded-2xl border border-ink/10 p-5 space-y-4">
              <p className="font-serif text-lg font-semibold text-ink">Pet details</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Species</label>
                  <input
                    type="text"
                    value={petDetails.species}
                    onChange={(e) => updatePetDetail('species', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                    placeholder="Dog, Cat, Bird..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Breed</label>
                  <input
                    type="text"
                    value={petDetails.breed}
                    onChange={(e) => updatePetDetail('breed', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                    placeholder="Golden Retriever..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Age</label>
                <input
                  type="text"
                  value={petDetails.age}
                  onChange={(e) => updatePetDetail('age', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                  placeholder="3 years old"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Vet name</label>
                  <input
                    type="text"
                    value={petDetails.vet_name}
                    onChange={(e) => updatePetDetail('vet_name', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                    placeholder="Dr. Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Vet phone</label>
                  <input
                    type="tel"
                    value={petDetails.vet_phone}
                    onChange={(e) => updatePetDetail('vet_phone', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Feeding schedule</label>
                <textarea
                  value={petDetails.feeding_schedule}
                  onChange={(e) => updatePetDetail('feeding_schedule', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition resize-none"
                  placeholder="Twice daily, 1 cup morning and evening..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Medications</label>
                <textarea
                  value={petDetails.medications}
                  onChange={(e) => updatePetDetail('medications', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition resize-none"
                  placeholder="Any regular medications or supplements..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Special care</label>
                <textarea
                  value={petDetails.special_care}
                  onChange={(e) => updatePetDetail('special_care', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition resize-none"
                  placeholder="Allergies, special needs, grooming schedule..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/60 mb-1 font-sans">Personality notes</label>
                <textarea
                  value={petDetails.personality_notes}
                  onChange={(e) => updatePetDetail('personality_notes', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-ink/20 bg-jet/50 text-ink text-sm font-sans placeholder-ink/30 focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition resize-none"
                  placeholder="Loves belly rubs, scared of thunder..."
                />
              </div>
            </div>
          )}

          {/* Estimated value — items only */}
          {itemType !== 'pet' && <div>
            <label htmlFor="estimated_value" className="block text-sm font-medium text-ink mb-1.5 font-sans">
              Estimated value <span className="text-ink/40 font-normal">(optional, USD)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 font-sans text-sm">$</span>
              <input
                id="estimated_value"
                name="estimated_value"
                type="number"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-ink/20 bg-jet text-ink placeholder-ink/35 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-ink/40 font-sans mt-1.5">Used only for the Personal Property Memorandum. Not shared externally.</p>
          </div>}

          {error && (
            <div className="bg-vault-red/10 border border-vault-red/20 rounded-xl px-4 py-3">
              <p className="text-vault-red text-sm font-sans">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 text-center bg-jungle text-ink/60 border border-ink/15 font-sans font-medium py-3 px-6 rounded-xl hover:bg-ink/5 transition text-sm min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saveState === 'saving' || saveState === 'success'}
              className={`flex-1 font-sans font-medium py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-cream transition text-sm min-h-[44px] flex items-center justify-center gap-2 ${
                saveState === 'success'
                  ? 'bg-emerald-600 text-white'
                  : saveState === 'saving'
                    ? 'bg-teal/60 text-cream cursor-not-allowed'
                    : 'bg-teal text-cream hover:bg-teal/90'
              } disabled:cursor-not-allowed`}
            >
              {saveState === 'saving' && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              {saveState === 'success' && (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.5 9L7.5 13L14.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {saveState === 'saving' ? 'Saving...' : saveState === 'success' ? 'Saved' : 'Save item'}
            </button>
          </div>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
