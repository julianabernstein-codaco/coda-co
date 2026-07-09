interface FilterCheckProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export function FilterCheck({ label, checked, onChange }: FilterCheckProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer mb-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-tr w-[13px] h-[13px]"
      />
      <span className="text-[14px] text-ink">{label}</span>
    </label>
  );
}
