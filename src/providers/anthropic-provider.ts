/**
 * Anthropic (Claude) Provider Implementation
 * This is a self-contained provider that directly implements the API calls
 * for Anthropic's models, without relying on a separate client class.
 */

import { BaseProvider } from './base-provider.js';
import {
  LLMProvider,
  LLMModel,
  LLMRequest,
  LLMResponse,
  LLMStreamEvent,
  ModelInfo,
  ProviderCapabilities,
  HealthCheckResult,
  LLMProviderError,
} from './types.js';

type AnthropicModel =
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307'
  | 'claude-2.1'
  | 'claude-2.0'
  | 'claude-instant-1.2';

export class AnthropicProvider extends BaseProvider {
  readonly name: LLMProvider = 'anthropic';
  readonly capabilities: ProviderCapabilities = {
    supportedModels: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2',
    ],
    maxContextLength: {
      'claude-3-opus-20240229': 200000,
      'claude-3-sonnet-20240229': 200000,
      'claude-3-haiku-20240307': 200000,
      'claude-2.1': 200000,
      'claude-2.0': 100000,
      'claude-instant-1.2': 100000,
    } as Record<LLMModel, number>,
    maxOutputTokens: {
      'claude-3-opus-20240229': 4096,
      'claude-3-sonnet-20240229': 4096,
      'claude-3-haiku-20240307': 4096,
      'claude-2.1': 4096,
      'claude-2.0': 4096,
      'claude-instant-1.2': 4096,
    } as Record<LLMModel, number>,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsSystemMessages: true,
    supportsVision: true,
    supportsAudio: false,
    supportsTools: false,
    supportsFineTuning: false,
    supportsEmbeddings: false,
    supportsLogprobs: false,
    supportsBatching: false,
    pricing: {
      'claude-3-opus-20240229': { promptCostPer1k: 0.015, completionCostPer1k: 0.075, currency: 'USD' },
      'claude-3-sonnet-20240229': { promptCostPer1k: 0.003, completionCostPer1k: 0.015, currency: 'USD' },
      'claude-3-haiku-20240307': { promptCostPer1k: 0.00025, completionCostPer1k: 0.00125, currency: 'USD' },
      'claude-2.1': { promptCostPer1k: 0.008, completionCostPer1k: 0.024, currency: 'USD' },
      'claude-2.0': { promptCostPer1k: 0.008, completionCostPer1k: 0.024, currency: 'USD' },
      'claude-instant-1.2': { promptCostPer1k: 0.0008, completionCostPer1k: 0.0024, currency: 'USD' },
    },
  };

  protected async doInitialize(): Promise<void> {
    // Initialization logic can go here if needed, e.g., validating API key format.
    if (!this.config.apiKey || !this.config.apiKey.startsWith('sk-ant-')) {
        this.logger.warn('Anthropic API key does not seem to be valid.');
    }
  }

  protected async doComplete(request: LLMRequest): Promise<LLMResponse> {
    const { body, headers } = this.prepareRequest(request);
    const response = await fetch(this.config.apiUrl || 'https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new LLMProviderError(`Anthropic API error: ${response.status} ${errorBody}`, 'API_ERROR', this.name, response.status);
    }

    const data = await response.json();
    return this.formatResponse(data);
  }

  protected async *doStreamComplete(request: LLMRequest): AsyncIterable<LLMStreamEvent> {
    const { body, headers } = this.prepareRequest(request, true);
    const response = await fetch(this.config.apiUrl || 'https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
        const errorBody = await response.text();
        throw new LLMProviderError(`Anthropic API stream error: ${response.status} ${errorBody}`, 'API_ERROR', this.name, response.status);
    }
    
    // Process the stream
    // (Implementation for parsing Server-Sent Events would go here)
    // For brevity, this is a simplified placeholder.
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // In a real implementation, you would parse the SSE format.
        // This is a simplified example.
        yield { type: 'content', delta: { content: chunk } };
    }
    yield { type: 'done', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }, cost: { promptCost: 0, completionCost: 0, totalCost: 0, currency: 'USD' } };
  }

  async listModels(): Promise<LLMModel[]> {
    return this.capabilities.supportedModels;
  }

  async getModelInfo(model: LLMModel): Promise<ModelInfo> {
    // This could be enhanced to fetch live info from Anthropic if they provide such an endpoint
    return {
      model,
      name: model,
      description: `Anthropic model: ${model}`,
      contextLength: this.capabilities.maxContextLength[model] || 0,
      maxOutputTokens: this.capabilities.maxOutputTokens[model] || 4096,
      supportedFeatures: ['chat', 'completion', 'streaming'],
      pricing: this.capabilities.pricing![model],
    };
  }

  protected async doHealthCheck(): Promise<HealthCheckResult> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/health', {
        headers: { 'x-api-key': this.config.apiKey! },
      });
      return {
        healthy: response.ok,
        timestamp: new Date(),
        details: { status: response.status, statusText: response.statusText },
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  private prepareRequest(request: LLMRequest, stream = false): { body: any, headers: Record<string, string> } {
    const systemMessage = request.messages.find(m => m.role === 'system');
    const messages = request.messages.filter(m => m.role !== 'system');

    const body = {
        model: request.model || this.config.model,
        messages: messages,
        system: systemMessage?.content,
        max_tokens: request.maxTokens || this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        stream,
    };

    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01',
    };

    return { body, headers };
  }

  private formatResponse(data: any): LLMResponse {
    const pricing = this.capabilities.pricing![data.model];
    const promptCost = (data.usage.input_tokens / 1000) * pricing.promptCostPer1k;
    const completionCost = (data.usage.output_tokens / 1000) * pricing.completionCostPer1k;

    return {
      id: data.id,
      model: data.model,
      provider: 'anthropic',
      content: data.content[0]?.text || '',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      cost: {
        promptCost,
        completionCost,
        totalCost: promptCost + completionCost,
        currency: 'USD',
      },
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
    };
  }
}