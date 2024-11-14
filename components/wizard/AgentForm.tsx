'use client';

import { MessageSquare, Bot, Database, Search, BarChart, Upload, Type, FileJson, MessageCircle } from 'lucide-react';
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

const agentTypes = [
  {
    id: 'chat',
    name: 'Chat Completion',
    description: 'Interactive conversational AI for real-time user engagement',
    icon: MessageSquare,
  },
  {
    id: 'content',
    name: 'Content Generation',
    description: 'Automated content generation and management',
    icon: Bot,
  },
] as const;

const tools = [
  {
    id: 'crm',
    label: 'CRM Integration',
    description: 'Connect with customer relationship management systems',
    icon: Database,
    disabled: true,
  },
  {
    id: 'search',
    label: 'Web Search',
    description: 'Enable web search capabilities',
    icon: Search,
    disabled: false,
  },
  {
    id: 'memory',
    label: 'Memory',
    description: 'Maintain conversation context and history',
    icon: Database,
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
    id: 'custom',
    label: 'Custom Data Upload',
    description: 'Upload and use custom data sources',
    icon: Upload,
    disabled: true,
  },
] as const;

const outputFormats = [
  {
    id: 'text',
    name: 'Text',
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
  const selectedTools = form.watch('tools') || [];

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="agentType"
        render={({ field }) => (
          <FormItem>
            <div className="grid gap-4 pt-2">
              {agentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-muted/50',
                      field.value === type.id && 'border-primary'
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
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

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
                  <Card
                    key={format.id}
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
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}