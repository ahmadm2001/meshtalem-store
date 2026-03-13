'use client';

export type DoorTypeId = 'all' | 'single' | 'single_half' | 'double';

interface Props {
  active: DoorTypeId;
  onChange: (id: DoorTypeId) => void;
}

const DOOR_TYPES: { id: DoorTypeId; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'single', label: 'דלת' },
  { id: 'single_half', label: 'דלת וחצי' },
  { id: 'double', label: 'דלת כפולה' },
];

export default function DoorTypeBar({ active, onChange }: Props) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 py-2">
          {DOOR_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onChange(type.id)}
              className={`px-5 py-2 text-sm font-semibold border transition-all rounded-sm ${
                active === type.id
                  ? 'bg-white border-gray-900 text-gray-900 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
