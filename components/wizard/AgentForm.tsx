'use client';

import { MessageSquare, Bot, Database, Search, BarChart, Upload, Type, FileJson, MessageCircle, Sparkles } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const agentTypes = [
  {
    id: 'chat',
    name: 'Chat Completion',
    description: 'Interactive conversational AI for real-time user engagement',
    icon: MessageSquare,
    examplePrompt: 'Welcome to the Sports Chat! Feel free to ask about live scores, player stats, or upcoming matches. How can I assist you today?',
  },
  {
    id: 'content',
    name: 'Content Generation',
    description: 'Automated content generation and management',
    icon: Bot,
    examplePrompt: 'Create a detailed match report for the recent football game between Team A and Team B, highlighting key moments, player performances, and final scores.',
  },
] as const;

const tools = [

  {
    id: 'search',
    label: 'Web Search',
    description: 'Enable web search capabilities',
    icon: Search,
    disabled: false,
  },
  {
    id: 'custom',
    label: 'Custom Data Upload',
    description: 'Upload and use custom data sources',
    icon: Upload,
    disabled: true,
  },
  {
    id: 'sentiment',
    label: 'Fan Sentiment Analysis',
    description: 'Analyze and understand fan reactions and sentiment',
    icon: BarChart,
    disabled: true,
  },
  {
    id: 'crm',
    label: 'CRM Integration',
    description: 'Connect with customer relationship management systems',
    icon: Database,
    disabled: true,
  },
  {
    id: 'memory',
    label: 'Memory',
    description: 'Maintain conversation context and history',
    icon: Database,
    disabled: true,
  }
] as const;

const outputFormats = [
  {
    id: 'text',
    name: 'Raw Text',
    description: 'Plain text responses',
    icon: Type,
    disabled: false,
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Structured data format',
    icon: FileJson,
    disabled: false,
  },
  {
    id: 'chat',
    name: 'Chat Widget',
    description: 'Interactive chat interface',
    icon: MessageCircle,
    disabled: true,
  },
] as const;

type ToolId = typeof tools[number]['id'];

export default function AgentForm({ form }: { form: any }) {
  const [currentStep, setCurrentStep] = useState(1);
  const selectedTools = form.watch('tools') || [];
  const selectedAgentType = form.watch('agentType');

  const nextStep = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent form submission
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent form submission
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const steps = ['Type', 'Tools', 'Output'];

  return (
    <div className="space-y-6">
      <div className="flex justify-center items-center mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-full',
                currentStep === index + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              )}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-1 bg-gray-300 mx-2"></div>
            )}
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <FormField
          control={form.control}
          name="agentType"
          render={({ field }) => (
            <FormItem>
              <div className="grid gap-4 pt-2">
                {agentTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = field.value === type.id;
                  return (
                    <div key={type.id}>
                      <Card
                        className={cn(
                          'cursor-pointer transition-colors hover:bg-muted/50',
                          isSelected && 'border-primary'
                        )}
                        onClick={() => field.onChange(type.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Icon className="h-5 w-5 mt-1 text-muted-foreground" />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{type.name}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      {isSelected && (
                        <div className="mt-4">
                          <FormLabel>System Prompt</FormLabel>
                          <textarea
                            className="w-full p-2 border rounded-md text-sm text-gray-600"
                            placeholder="Enter your system prompt here..."
                            defaultValue={type.examplePrompt}
                          />
                          <Button 
                            className="mt-2 flex items-center gap-2 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md"
                            onClick={(event) => event.preventDefault()} // Prevent form submission
                          >
                            <Sparkles className="h-4 w-4" />
                            Enhance Prompt
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {currentStep === 2 && (
        <FormField
          control={form.control}
          name="tools"
          render={({ field }) => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Tools</FormLabel>
                <FormDescription>
                  Select the tools your agent will have access to
                </FormDescription>
              </div>
              <div className="grid gap-4">
                {tools.map((tool) => {
                  const isSelected = selectedTools.includes(tool.id);
                  return (
                    <Card
                      key={tool.id}
                      className={cn(
                        'transition-colors',
                        tool.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50',
                        isSelected && !tool.disabled && 'border-primary'
                      )}
                      onClick={() => {
                        if (!tool.disabled) {
                          const newValue = isSelected
                            ? selectedTools.filter((id: ToolId) => id !== tool.id)
                            : [...selectedTools, tool.id];
                          field.onChange(newValue);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <tool.icon className="h-5 w-5 mt-1 text-muted-foreground" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{tool.label}</h4>
                              {tool.disabled && (
                                <Badge variant="outline">Coming Soon</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                          {!tool.disabled && (
                            <div className={cn(
                              "w-4 h-4 rounded-sm border border-primary",
                              isSelected && "bg-primary"
                            )} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </FormItem>
          )}
        />
      )}

      {currentStep === 3 && (
        <FormField
          control={form.control}
          name="outputFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Output Format</FormLabel>
              <div className="grid gap-4">
                {outputFormats.map((format) => {
                  const Icon = format.icon;
                  const isSelected = field.value === format.id;
                  return (
                    <div key={format.id}>
                      <Card
                        className={cn(
                          'transition-colors',
                          format.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50',
                          isSelected && !format.disabled && 'border-primary'
                        )}
                        onClick={() => {
                          if (!format.disabled) {
                            field.onChange(format.id);
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Icon className="h-5 w-5 mt-1 text-muted-foreground" />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{format.name}</h4>
                                {format.disabled && (
                                  <Badge variant="outline">Coming Soon</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format.description}
                              </p>
                            </div>
                            {!format.disabled && (
                              <div className={cn(
                                "w-4 h-4 rounded-full border border-primary",
                                isSelected && "bg-primary"
                              )} />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      {isSelected && format.id === 'json' && (
                        <div className="mt-4">
                          <FormLabel>JSON Schema</FormLabel>
                          <textarea
                            className="w-full p-2 border rounded-md text-sm text-gray-600 h-48"
                            placeholder="Enter your JSON schema here..."
                            defaultValue={`{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "number" }
  },
  "required": ["name", "age"]
}`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="flex justify-between mt-4">
        {currentStep > 1 && (
          <Button onClick={prevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-700">
            Previous
          </Button>
        )}
        {currentStep < 3 && (
          <Button onClick={nextStep} className="bg-primary hover:bg-primary-dark text-white">
            Next
          </Button>
        )}
      </div>
    </div>
  );
}