import React from 'react';
import { handleAuthClick, handleSignoutClick } from '../services/googleDriveService';
import { GoogleDriveIcon } from './icons';

interface GoogleAuthProps {
  isSignedIn: boolean;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ isSignedIn }) => {
  // FIX: Per API guidelines, assume environment variables are set and do not render conditional UI.
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600">Conectado ao Google Drive</p>
          <button
              onClick={handleSignoutClick}
              className="px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-red-500"
          >
              Desconectar
          </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAuthClick}
      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500"
    >
      <GoogleDriveIcon />
      <span className="ml-2">Conectar ao Google Drive</span>
    </button>
  );
};

export default GoogleAuth;