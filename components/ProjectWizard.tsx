'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, Database, Bot, CheckCircle, XCircle, Trash } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import ProjectForm, { ProjectFormData, projectFormSchema } from './wizard/ProjectForm';
import AgentForm from './wizard/AgentForm';
import { format } from 'date-fns';

const agentFormSchema = z.object({
  agentType: z.enum(['chat', 'content']),
  tools: z.array(z.string()).default([]),
  outputFormat: z.enum(['text', 'json', 'chat']),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const fadeAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 },
};

interface Agent {
  id: string;
  type: string;
  tools: string[];
  outputFormat: string;
  createdAt: Date;
  active: boolean;
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
  'volleyball': '🏐',
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

const generateEndpointURL = (projectName: string, agentId: string) => {
  const formattedProjectName = projectName.toLowerCase().replace(/\s+/g, '-');
  return `https://api.example.com/projects/${formattedProjectName}/agents/${agentId}`;
};

export default function ProjectWizard() {
  const [projectCreated, setProjectCreated] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'completed'>('syncing');
  const { toast } = useToast();

  // Separate form instances
  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: '',
      dataSources: ['machina-core'],
      sportSelections: {},
    },
  });

  const agentForm = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      agentType: undefined,
      tools: [],
      outputFormat: undefined,
    },
  });

  const onSubmitProject = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
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

  const onSubmitAgent = async (data: AgentFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const newAgent: Agent = {
        id: `agent-${agents.length + 1}`,
        type: data.agentType,
        tools: data.tools,
        outputFormat: data.outputFormat,
        createdAt: new Date(),
        active: true,
      };
      setAgents([...agents, newAgent]);
      toast({
        title: 'Agent created successfully!',
        description: 'Your agent has been configured and is ready to use.',
      });
      setIsCreatingAgent(false);
      agentForm.reset();
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
    const sportSelections = projectForm.getValues('sportSelections') ?? {};
    const allSports = new Set<string>();
    Object.values(sportSelections).forEach((sports) => {
      sports.forEach((sport) => allSports.add(sport));
    });
    return Array.from(allSports);
  };

  const toggleAgentStatus = (agentId: string) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent.id === agentId ? { ...agent, active: !agent.active } : agent
      )
    );
  };

  const deleteAgent = (agentId: string) => {
    setAgents((prevAgents) => prevAgents.filter((agent) => agent.id !== agentId));
    toast({
      title: 'Agent deleted',
      description: 'The agent has been successfully removed.',
    });
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
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(onSubmitProject)} className="space-y-8">
              <ProjectForm form={projectForm} />
              <div className="pt-6 border-t">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    Object.values(projectForm.getValues('sportSelections')).every(
                      (sports) => sports.length === 0
                    )
                  }
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
                  <h2 className="text-2xl font-semibold">
                    {projectForm.getValues('projectName')}
                  </h2>
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
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Sport Data Sources
                  </h3>
                  <div className="flex gap-2">
                    {projectForm.getValues('dataSources').map((source) => (
                      <div key={source} className="flex items-center gap-1.5">
                        <Database className="h-4 w-4" />
                        <span className="text-sm capitalize">
                          {source.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Sports Synchronized
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {getAllSelectedSports().map((sport) => (
                      <Badge
                        key={sport}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
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
                <Button
                  onClick={() => setIsCreatingAgent(true)}
                  disabled={syncStatus === 'syncing'}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Agent
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {isCreatingAgent ? (
                  <motion.div key="agent-form" {...fadeAnimation}>
                    <Form {...agentForm}>
                      <form
                        onSubmit={agentForm.handleSubmit(onSubmitAgent)}
                        className="space-y-8"
                      >
                        <div className="space-y-2 mb-6">
                          <h2 className="text-xl font-semibold">Create New Agent</h2>
                          <p className="text-sm text-muted-foreground">
                            Configure your AI agent's capabilities and behavior.
                          </p>
                        </div>
                        <AgentForm form={agentForm} />
                        <div className="flex justify-between pt-6 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreatingAgent(false)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              isSubmitting ||
                              !agentForm.getValues('agentType') ||
                              !agentForm.getValues('outputFormat')
                            }
                          >
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
                  <motion.div key="agent-list" {...fadeAnimation} className="space-y-4">
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
                                      {agent.type.charAt(0).toUpperCase() +
                                        agent.type.slice(1)}{' '}
                                      Agent
                                    </h4>
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    <Badge variant="outline">
                                      {formatOutputType(agent.outputFormat)}
                                    </Badge>
                                    {agent.tools.map((tool) => (
                                      <Badge key={tool} variant="outline">
                                        {formatToolName(tool)}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <p>Created: {format(agent.createdAt, 'MMMM dd, yyyy')}</p>
                                    <p>
                                      Endpoint:{' '}
                                      <span
                                        className="text-blue-500 cursor-pointer"
                                        onClick={() =>
                                          navigator.clipboard.writeText(
                                            generateEndpointURL(
                                              projectForm.getValues('projectName'),
                                              agent.id
                                            )
                                          )
                                        }
                                      >
                                        {generateEndpointURL(
                                          projectForm.getValues('projectName'),
                                          agent.id
                                        )}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={agent.active}
                                    onChange={() => toggleAgentStatus(agent.id)}
                                  />
                                  {agent.active ? (
                                    <CheckCircle className="text-green-500 h-4 w-4" />
                                  ) : (
                                    <XCircle className="text-red-500 h-4 w-4" />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteAgent(agent.id)}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
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