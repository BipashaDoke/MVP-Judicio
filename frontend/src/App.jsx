import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// API Base URL - update for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Language options
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

function App() {
  const { t, i18n } = useTranslation();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploadedFile = e.dataTransfer.files[0];
      if (uploadedFile.type === 'application/pdf') {
        setFile(uploadedFile);
        setError('');
      } else {
        setError(t('invalidFileType'));
      }
    }
  }, [t]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      if (uploadedFile.type === 'application/pdf') {
        setFile(uploadedFile);
        setError('');
      } else {
        setError(t('invalidFileType'));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setLoadingMessage(t('analyzingDocument'));
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoadingMessage(t('extractingText'));
      
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000
      });

      setLoadingMessage(t('processingAI'));
      
      setTimeout(() => {
        setResult(response.data);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setLoading(false);
      if (err.response) {
        setError(err.response.data.detail || t('processError'));
      } else if (err.request) {
        setError('Network error. Please check if the backend is running.');
      } else {
        setError(err.message || t('processError'));
      }
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  const getRiskColor = (risk) => {
    const riskLower = risk?.toLowerCase() || '';
    if (riskLower.includes('high') || riskLower.includes('उच्च') || riskLower.includes('जास्त')) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (riskLower.includes('medium') || riskLower.includes('मध्यम') || riskLower.includes('मध्यम')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (riskLower.includes('low') || riskLower.includes('कमी')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // helper to display multilingual fields returned from backend
  const getLocalizedText = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field; // already a string
    // field is expected to be an object like { english: '...', hindi: '...', marathi: '...' }
    // i18n.language may be 'en','hi','mr' so map to keys
    const langMap = { en: 'english', hi: 'hindi', mr: 'marathi' };
    const key = langMap[i18n.language] || i18n.language;
    return field[key] || field.english || Object.values(field)[0] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{t('appName')}</h1>
                <p className="text-xs text-slate-500">{t('appTagline')}</p>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{t('uploadTitle')}</h2>
              <p className="text-slate-600">{t('uploadDescription')}</p>
            </div>

            {/* Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-300 hover:border-blue-400 bg-white'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-slate-700">
                    {file ? file.name : t('dragDropText')}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{t('supportedFormats')}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                {error}
              </div>
            )}

            {/* Upload Button */}
            {file && !loading && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleUpload}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  {t('analyzingDocument').replace('...', '')}
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-slate-700 font-medium">{loadingMessage}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">{t('analysisComplete')}</h2>
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {t('newAnalysis')}
              </button>
            </div>

            {/* Language Summary Tabs */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Case Details Card */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('caseNumber')}</h3>
                  <p className="text-2xl font-bold text-blue-600">{result.case_number || result.caseNumber || 'N/A'}</p>
                </div>

                {/* Parties Card */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('parties')}</h3>
                  <div className="space-y-2">
                    {result.parties?.petitioner && (
                      <p className="text-slate-600"><span className="font-medium">Petitioner:</span> {result.parties.petitioner}</p>
                    )}
                    {result.parties?.respondent && (
                      <p className="text-slate-600"><span className="font-medium">Respondent:</span> {result.parties.respondent}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Judgment & Risk Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Judgment Outcome */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('judgmentOutcome')}</h3>
                <p className="text-slate-600">{getLocalizedText(result.judgment_outcome) || getLocalizedText(result.judgmentOutcome) || 'N/A'}</p>
              </div>

              {/* Risk Tags */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('riskTags')}</h3>
                <div className="flex flex-wrap gap-2">
                  {result.risk_tags?.map((tag, index) => {
                    // tag may be string or object with language keys
                    const display = typeof tag === 'object' ? getLocalizedText(tag) : tag;
                    return (
                      <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(display)}`}>
                        {display}
                      </span>
                    );
                  })}
                  {(!result.risk_tags || result.risk_tags.length === 0) && (
                    <span className="text-slate-400">No risk tags detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Important Dates - Timeline */}
            {result.important_dates && result.important_dates.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('timeline')}</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                  <div className="space-y-6">
                    {result.important_dates.map((dateItem, index) => (
                      <div key={index} className="relative pl-10">
                        <div className="absolute left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-medium text-slate-800">{dateItem.date}</p>
                          <p className="text-slate-600 text-sm">{getLocalizedText(dateItem.description)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Legal Directions */}
            {result.legal_directions && result.legal_directions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('legalDirections')}</h3>
                <ul className="space-y-3">
                  {result.legal_directions.map((direction, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      {/* direction may be multilingual object */}
                      <span>{getLocalizedText(direction)}</span>
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Professional Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('professionalSummary')}</h3>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed">
                  {getLocalizedText(result.professional_summary) || getLocalizedText(result.professionalSummary) || 'No summary available'}
                </p>
              </div>
            </div>

            {/* Citizen Explanation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('citizenExplanation')}</h3>
              <p className="text-slate-600 leading-relaxed">
                {getLocalizedText(result.citizen_explanation) || getLocalizedText(result.citizenExplanation) || 'No explanation available'}
              </p>
            </div>

            {/* JSON Response (Debug) */}
            <details className="bg-slate-800 rounded-lg p-4">
              <summary className="text-white cursor-pointer font-medium">View Raw JSON Response</summary>
              <pre className="mt-4 text-green-400 text-xs overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
            <p>{t('aboutJudicio')} © 2024</p>
            <p>{t('version')} 1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
