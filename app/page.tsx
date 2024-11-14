import ProjectWizard from '@/components/ProjectWizard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-10">
      <div className="container max-w-5xl mx-auto px-4">
        <ProjectWizard />
      </div>
    </main>
  );
}