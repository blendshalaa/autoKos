import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="container-narrow py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">AutoKos</h3>
                        <p className="text-gray-400 text-sm">
                            Tregu më i madh i automjeteve në Kosovë. Gjeni makinën tuaj të ëndrrave ose shisni makinën tuaj shpejt.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Linqe të shpejta</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-white">Ballina</Link></li>
                            <li><Link to="/listings/new" className="hover:text-white">Shto Makinë</Link></li>
                            <li><Link to="/login" className="hover:text-white">Kyçu</Link></li>
                            <li><Link to="/register" className="hover:text-white">Regjistrohu</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Kontakt</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>info@autokos.com</li>
                            <li>+383 44 123 456</li>
                            <li>Prishtinë, Kosovë</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} AutoKos. Të gjitha të drejtat e rezervuara.
                </div>
            </div>
        </footer>
    );
};
