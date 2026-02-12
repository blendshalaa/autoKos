import React from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Layout } from '../components/layout/Layout';
import { useCompareStore } from '../store/compareStore';
import { formatPrice, formatNumber, getImageUrl } from '../utils/format';
import { Button } from '../components/common/Button';

export const ComparePage: React.FC = () => {
    const { items, removeItem, clear } = useCompareStore();

    if (items.length === 0) {
        return (
            <Layout>
                <div className="container-narrow py-20 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuk keni zgjedhur asnjë veturë për krahasim</h2>
                    <p className="text-gray-600 mb-8">Shtoni deri në 3 vetura për t'i krahasuar ato.</p>
                    <Link to="/">
                        <Button>Shiko Shpalljet</Button>
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Krahasimi i Veturave</h1>
                    <Button variant="outline" onClick={clear}>Pastro Krahasimin</Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 text-left w-1/4 min-w-[200px]">Specifikat</th>
                                {items.map(item => (
                                    <th key={item.id} className="p-4 w-1/4 min-w-[250px] relative">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                            title="Hiq nga krahasimi"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                        <Link to={`/listings/${item.id}`}>
                                            <div className="aspect-w-16 aspect-h-9 mb-3 rounded overflow-hidden bg-gray-200">
                                                {item.images && item.images.length > 0 ? (
                                                    <img
                                                        src={getImageUrl(item.images[0].thumbnailUrl)}
                                                        alt={item.make}
                                                        className="w-full h-32 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-32 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                                )}
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">{item.make} {item.model}</div>
                                            <div className="text-blue-600 font-bold">{formatPrice(item.price)}</div>
                                        </Link>
                                    </th>
                                ))}
                                {/* Fill empty columns if less than 3 */}
                                {[...Array(3 - items.length)].map((_, i) => (
                                    <th key={`empty-${i}`} className="p-4 w-1/4 min-w-[250px] bg-gray-50/50">
                                        <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-8">
                                            <span className="text-gray-400 text-sm">Bosh</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Rows for specs */}
                            {[
                                { label: 'Viti', key: 'year' },
                                { label: 'Kilometrazha', key: 'mileage', format: (val: number) => `${formatNumber(val)} km` },
                                { label: 'Karburanti', key: 'fuelType' },
                                { label: 'Transmisioni', key: 'transmission' },
                                { label: 'Tipi i Trupit', key: 'bodyType' },
                                { label: 'Ngjyra', key: 'color' },
                                { label: 'Lokacioni', key: 'location' },
                                { label: 'Statusi', key: 'status', format: (val: string) => val === 'ACTIVE' ? 'Aktive' : val === 'RESERVED' ? 'E Rezervuar' : 'E Shitur' },
                            ].map((row) => (
                                <tr key={row.key} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50/50">{row.label}</td>
                                    {items.map(item => (
                                        <td key={`${item.id}-${row.key}`} className="p-4 text-center text-gray-900">
                                            {/* @ts-ignore dynamic access */}
                                            {(row as any).format ? (row as any).format((item as any)[row.key]) : (item as any)[row.key]}
                                        </td>
                                    ))}
                                    {[...Array(3 - items.length)].map((_, i) => <td key={`empty-cell-${i}`} className="p-4"></td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};
