import { Hero } from './components/Hero';
import { Results } from './components/Results';
import { Footer } from './components/Footer';
import { useAppStore } from './store/useAppStore';

function App() {
  const { appState, githubData, bullets } = useAppStore();
  
  const showResults = appState === 'success' && githubData && bullets.length > 0;

  return (
    <div className="min-h-screen gradient-bg">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Hero />
        
        {showResults && (
          <Results />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
