import React, { useState } from 'react';
import { ChevronDown, Check, Sparkles, Brain, Zap } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  features: string[];
  streaming?: boolean;
  recommended?: boolean;
  maxTokens?: number;
}

interface ModelSelectorProps {
  models: Record<string, AIModel>;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ models, selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel = models[selectedModel];

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'Cerebras AI':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'PromptMention':
        return <Brain className="w-4 h-4 text-purple-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case 'Cerebras AI':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PromptMention':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <div className="flex items-center space-x-3">
          {currentModel && getProviderIcon(currentModel.provider)}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {currentModel?.name || 'Select Model'}
              </span>
              {currentModel?.recommended && (
                <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getProviderBadgeColor(currentModel?.provider || '')}`}>
                {currentModel?.provider}
              </span>
              {currentModel?.streaming && (
                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  Streaming
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            {Object.values(models).map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-3 text-left rounded-lg hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                  selectedModel === model.id ? 'bg-purple-50 border-purple-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getProviderIcon(model.provider)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {model.name}
                        </span>
                        {model.recommended && (
                          <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                            Recommended
                          </span>
                        )}
                        {selectedModel === model.id && (
                          <Check className="w-4 h-4 text-purple-600" />
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getProviderBadgeColor(model.provider)}`}>
                          {model.provider}
                        </span>
                        {model.streaming && (
                          <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                            Streaming
                          </span>
                        )}
                        {model.maxTokens && (
                          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                            {model.maxTokens.toLocaleString()} tokens
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        {model.description}
                      </p>

                      {model.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {model.features.map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Cerebras AI Branding Section */}
          {models['cerebras-gpt-oss-120b'] && (
            <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-orange-50 to-purple-50">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-semibold text-gray-900">Powered by Cerebras AI</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Experience next-generation AI performance with Cerebras's cutting-edge inference technology.
                GPT-OSS-120B delivers lightning-fast responses with advanced reasoning capabilities.
              </p>
              <div className="mt-2">
                <a
                  href="https://cerebras.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                >
                  Learn more about Cerebras AI →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Model provider info component
export function ModelProviderInfo({ model }: { model: AIModel }) {
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'Cerebras AI':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'PromptMention':
        return <Brain className="w-4 h-4 text-purple-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'Cerebras AI':
        return 'text-orange-600 bg-orange-50';
      case 'PromptMention':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getProviderColor(model.provider)}`}>
      {getProviderIcon(model.provider)}
      <span>{model.provider}</span>
      {model.streaming && (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
          Live
        </span>
      )}
    </div>
  );
}