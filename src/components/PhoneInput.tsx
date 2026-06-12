'use client';

import { useState } from 'react';

function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function PhoneInput() {
  const [value, setValue] = useState('');

  return (
    <input
      name="phone"
      type="tel"
      value={value}
      onChange={(e) => setValue(applyMask(e.target.value))}
      maxLength={16}
      minLength={14}
      required
      placeholder="(11) 99999-9999"
      inputMode="numeric"
    />
  );
}
