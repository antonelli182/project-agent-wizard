'use client';

import { useState, useEffect } from 'react';
import { Check, Search, Key, Activity, Database, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useWatch } from 'react-hook-form';

const sports = [
  { id: 'football', name: 'American Football', emoji: '🏈' },
  { id: 'soccer', name: 'Football (Soccer)', emoji: '⚽' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀' },
  { id: 'baseball', name: 'Baseball', emoji: '⚾' },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐' },
  { id: 'handball', name: 'Handball', emoji: '🤾' },
  { id: 'mma', name: 'MMA', emoji: '🥊' },
  { id: 'formula1', name: 'Formula 1', emoji: '🏎️' },
  { id: 'hockey', name: 'Hockey', emoji: '🏑' },
  { id: 'rugby', name: 'Rugby', emoji: '🏉' },
] as const;

type SportId = typeof sports[number]['id'];

interface SportSelectionState {
  'machina-core': SportId[];
  'sportradar': SportId[];
}

const dataSources = [
  {
    id: 'machina-core',
    name: 'Machina Core',
    description: 'Machina Sports Built-in sports data',
    icon: Database,
    status: 'active',
  },
  {
    id: 'sportradar',
    name: 'Sportradar',
    description: 'Advanced sports data and statistics',
    icon: Database,
    status: 'inactive',
  },
] as const;

export default function ProjectForm({ form }: { form: any }) {
  const [openModals, setOpenModals] = useState<{ [key: string]: boolean }>({});
  const [currentDataSource, setCurrentDataSource] = useState<string | null>(null);
  const [tempSelectedSports, setTempSelectedSports] = useState<SportId[]>([]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [sportradarConnected, setSportradarConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const watchDataSources = useWatch({ control: form.control, name: 'dataSources' }) || [];
  const watchSportSelections = useWatch({ control: form.control, name: 'sportSelections' }) || {};

  const ensureAtLeastOneDataSource = (dataSources: string[]) => {
    if (dataSources.length === 0) {
      return ['machina-core'];
    }
    return dataSources;
  };

  const handleDataSourceChange = (sourceId: string) => {
    if (sourceId === 'sportradar' && !sportradarConnected) {
      return; // Prevent selection if not authenticated
    }

    const currentDataSources = form.getValues('dataSources') || [];
    let newDataSources;

    if (currentDataSources.includes(sourceId)) {
      newDataSources = currentDataSources.filter((id: string) => id !== sourceId);
    } else {
      newDataSources = [...currentDataSources, sourceId];

    form.setValue('dataSources', ensureAtLeastOneDataSource(newDataSources));
  };

  const handleDialogOpen = (open: boolean, dataSourceId?: string) => {
    if (open && dataSourceId) {
      setCurrentDataSource(dataSourceId);
      setTempSelectedSports(watchSportSelections[dataSourceId] || []);
    }
    setOpenModals((prev) => ({ ...prev, [dataSourceId || '']: open }));
  };

  const handleSportSelect = (sportId: SportId) => {
    setTempSelectedSports(current => {
      if (current.includes(sportId)) {
        return current.filter(id => id !== sportId);
      }
      return [...current, sportId];
    });
  };

  const handleConfirm = () => {
    if (currentDataSource) {
      const currentSelections = { ...watchSportSelections };
      currentSelections[currentDataSource] = tempSelectedSports;
      form.setValue('sportSelections', currentSelections);
    }
    setOpenModals((prev) => ({ ...prev, [currentDataSource || '']: false }));
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setSportradarConnected(true);
      const newDataSources = [...watchDataSources, 'sportradar'];
      form.setValue('dataSources', ensureAtLeastOneDataSource(newDataSources));
      setIsApiKeyModalOpen(false);
      toast({
        title: 'Sportradar Connected',
        description: 'Your API key has been saved successfully.',
      });
    }
  };

  // Form validation to ensure sports are selected for each data source
  useEffect(() => {
    let hasError = false;

    watchDataSources.forEach((sourceId: string) => {
      const selectedSports = watchSportSelections[sourceId] || [];
      if (selectedSports.length === 0) {
        hasError = true;
      }
    });

    if (hasError) {
      form.setError('dataSources', { type: 'manual', message: 'Please select sports for all selected data sources.' });
    } else {
      form.clearErrors('dataSources');
    }
  }, [watchDataSources, watchSportSelections, form]);

  const renderSportsSelection = (dataSourceId: string) => {
    const selectedSports = watchSportSelections[dataSourceId] || [];

    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-start gap-4">
          <Dialog open={openModals[dataSourceId]} onOpenChange={(open) => handleDialogOpen(open, dataSourceId)}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                <Search className="h-4 w-4 mr-2" />
                Choose Sports
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <DialogHeader>
                <DialogTitle>Select Sports for {dataSourceId === 'machina-core' ? 'Machina Core' : 'Sportradar'}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {sports.filter(sport =>
                      sport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      sport.id.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((sport) => {
                      const isSelected = tempSelectedSports.includes(sport.id);
                      return (
                        <div
                          key={sport.id}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-md cursor-pointer',
                            isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                          )}
                          onClick={() => handleSportSelect(sport.id)}
                        >
                          <div className={cn(
                            'w-4 h-4 rounded-sm border flex items-center justify-center',
                            isSelected ? 'bg-primary border-primary' : 'border-input'
                          )}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <span className="w-6">{sport.emoji}</span>
                          <span className="flex-1">{sport.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <Separator />

                <DialogFooter>
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      onClick={() => setOpenModals((prev) => ({ ...prev, [dataSourceId]: false }))}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={tempSelectedSports.length === 0}
                    >
                      Confirm Selection
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <p className="text-sm text-muted-foreground">
            Choose the sports you want to include for {dataSourceId === 'machina-core' ? 'Machina Core' : 'Sportradar'}.
          </p>
        </div>

        {selectedSports.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedSports.map((sportId: SportId) => {
              const sport = sports.find((s) => s.id === sportId);
              return (
                <Badge
                  key={sportId}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    const newSelections = { ...watchSportSelections };
                    newSelections[dataSourceId] = selectedSports.filter(id => id !== sportId);
                    form.setValue('sportSelections', newSelections);
                  }}
                >
                  <span className="mr-1">{sport?.emoji}</span>
                  {sport?.name}
                  <span className="sr-only">Remove</span>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="projectName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter project name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dataSources"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Sports Data Sources</FormLabel>
            </div>

            <div className="space-y-4">
              {dataSources.map((source) => {
                const isActive = source.id === 'machina-core' || sportradarConnected;
                const isSelected = field.value?.includes(source.id);
                const selectedSports = watchSportSelections[source.id] || [];
                const isConnected = isSelected && isActive && selectedSports.length > 0;
                const needsSportsSelection = isSelected && isActive && selectedSports.length === 0;

                return (
                  <div key={source.id} className="space-y-4">
                    <Card
                      className={cn(
                        'transition-colors relative',
                        isConnected
                          ? 'border-green-500 bg-green-50'
                          : isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background',
                        isActive ? 'hover:shadow-lg cursor-pointer' : 'cursor-default'
                      )}
                      onClick={isActive ? () => handleDataSourceChange(source.id) : undefined}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <source.icon className="h-5 w-5 mt-1 text-muted-foreground" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{source.name}</h4>

                              {source.id === 'sportradar' && !sportradarConnected && (
                                <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="bg-blue-500 text-white hover:bg-blue-600"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Key className="h-4 w-4 mr-2" />
                                      Add API Key
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent onClick={(e) => e.stopPropagation()}>
                                    <DialogHeader>
                                      <DialogTitle>Connect Sportradar</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <FormItem>
                                        <FormLabel>API Key</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Enter your Sportradar API key"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          You can find your API key in the Sportradar dashboard
                                        </FormDescription>
                                      </FormItem>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setIsApiKeyModalOpen(false)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleApiKeySubmit} disabled={!apiKey.trim()}>
                                        Connect
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                              {isConnected && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="success">
                                    <Activity className="h-4 w-4 mr-1" />
                                    Connected
                                  </Badge>
                                </div>
                              )}
                              {needsSportsSelection && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Select Sports
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {source.description}
                            </p>
                          </div>
                        </div>

                        {isSelected && isActive && (
                          <div className="mt-4">
                            {renderSportsSelection(source.id)}
                          </div>
                        )}

                        {/* Overlay for inactive data sources (excluding the "Add API Key" button) */}
                        {!isActive && (
                          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-70 cursor-not-allowed pointer-events-none"></div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
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