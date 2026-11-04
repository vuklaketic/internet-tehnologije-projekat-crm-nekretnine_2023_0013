'use client';

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./property-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500">
      Učitavanje interaktivne mape...
    </div>
  ),
});

export function PropertyMapWrapper(props: {
  address: string;
  city: string;
  initialLat?: string | null;
  initialLng?: string | null;
  title: string;
}) {
  return <DynamicMap {...props} />;
}
