'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, Database, Bot } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ProjectForm from './wizard/ProjectForm';
import AgentForm from './wizard/AgentForm';

const formSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters'),
  dataSources: z.array(z.string()).min(1, 'Select at least one data source'),
  sportSelections: z.record(z.array(z.string())).default({}),
  agentType: z.enum(['chat', 'content']).optional(),
  tools: z.array(z.string()).default([]),
  outputFormat: z.enum(['text', 'json', 'chat']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const fadeAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};

interface Agent {
  id: string;
  type: string;
  tools: string[];
  outputFormat: string;
  createdAt: Date;
}

const sportEmojis: { [key: string]: string } = {
  'football': '🏈',
  'soccer': '⚽',
  'rugby': '🏉',
  'basketball': '🏀',
  'baseball': '⚾',
  'formula1': '🏎️',
  'handball': '🤾',
  'hockey': '🏑',
  'mma': '🥊',
  'volleyball': '🏐'
};

const formatToolName = (tool: string) => {
  const names: { [key: string]: string } = {
    crm: 'CRM Integration',
    search: 'Web Search',
    memory: 'Memory',
    sentiment: 'Fan Sentiment Analysis',
    custom: 'Custom Data Upload',
  };
  return names[tool] || tool;
};

const formatOutputType = (type: string) => {
  const types: { [key: string]: string } = {
    text: 'TEXT',
    json: 'JSON',
    chat: 'CHAT',
  };
  return types[type] || type.toUpperCase();
};

export default function ProjectWizard() {
  const [projectCreated, setProjectCreated] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'completed'>('syncing');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      dataSources: ['machina-core'],
      sportSelections: {},
      tools: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!projectCreated) {
        toast({
          title: 'Project created successfully!',
          description: 'Data synchronization has started.',
        });
        setProjectCreated(true);
        // Simulate data sync
        setTimeout(() => {
          setSyncStatus('completed');
          toast({
            title: 'Data synchronization completed',
            description: 'Your project is ready to use.',
          });
        }, 3000);
      } else if (data.agentType && data.outputFormat) {
        const newAgent: Agent = {
          id: `agent-${agents.length + 1}`,
          type: data.agentType,
          tools: data.tools,
          outputFormat: data.outputFormat,
          createdAt: new Date(),
        };
        setAgents([...agents, newAgent]);
        toast({
          title: 'Agent created successfully!',
          description: 'Your agent has been configured and is ready to use.',
        });
        setIsCreatingAgent(false);
        form.reset({
          ...form.getValues(),
          agentType: undefined,
          tools: [],
          outputFormat: undefined,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAllSelectedSports = () => {
    const sportSelections = form.getValues('sportSelections');
    const allSports = new Set<string>();
    Object.values(sportSelections).forEach(sports => {
      sports.forEach(sport => allSports.add(sport));
    });
    return Array.from(allSports);
  };

  if (!projectCreated) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground">
            Set up your project and configure your data sources.
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <ProjectForm form={form} />
              <div className="pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || Object.values(form.getValues('sportSelections')).every(sports => sports.length === 0)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Project Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your project and create AI agents.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Project Overview Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{form.getValues('projectName')}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {syncStatus === 'syncing' ? 'Synchronizing data...' : 'Data synchronized'}
                  </p>
                </div>
                <Badge variant={syncStatus === 'syncing' ? 'secondary' : 'default'}>
                  {syncStatus === 'syncing' ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Syncing
                    </>
                  ) : (
                    'Ready'
                  )}
                </Badge>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Data Sources</h3>
                  <div className="flex gap-2">
                    {form.getValues('dataSources').map((source) => (
                      <div key={source} className="flex items-center gap-1.5">
                        <Database className="h-4 w-4" />
                        <span className="text-sm capitalize">{source.replace('-', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Sports</h3>
                  <div className="flex gap-2 flex-wrap">
                    {getAllSelectedSports().map((sport) => (
                      <Badge key={sport} variant="secondary" className="flex items-center gap-1">
                        <span>{sportEmojis[sport]}</span>
                        <span>{sport.charAt(0).toUpperCase() + sport.slice(1)}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agents Section */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Agents</h3>
                <Button onClick={() => setIsCreatingAgent(true)} disabled={syncStatus === 'syncing'}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Agent
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {isCreatingAgent ? (
                  <motion.div
                    key="agent-form"
                    {...fadeAnimation}
                  >
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-2 mb-6">
                          <h2 className="text-xl font-semibold">Create New Agent</h2>
                          <p className="text-sm text-muted-foreground">
                            Configure your AI agent's capabilities and behavior.
                          </p>
                        </div>
                        <AgentForm form={form} />
                        <div className="flex justify-between pt-6 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreatingAgent(false)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Agent...
                              </>
                            ) : (
                              'Create Agent'
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="agent-list"
                    {...fadeAnimation}
                    className="space-y-4"
                  >
                    {agents.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No agents created yet.</p>
                        <p className="text-sm">Create your first AI agent to get started.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {agents.map((agent) => (
                          <Card key={agent.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Bot className="h-4 w-4" />
                                    <h4 className="font-medium">
                                      {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent
                                    </h4>
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    {agent.tools.map((tool) => (
                                      <Badge key={tool} variant="outline">
                                        {formatToolName(tool)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <Badge>
                                  {formatOutputType(agent.outputFormat)}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}