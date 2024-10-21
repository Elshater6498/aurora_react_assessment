import { useState } from "react";
import WeatherSection from "./components/WeatherSection";
import CryptoSection from "./components/CryptoSection";
import CovidSection from "./components/CovidSection";
import { Sun, Bitcoin, Activity, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTheme } from "./components/ThemeProvider";
import { Button } from "./components/ui/button";

function App() {
  const [activeTab, setActiveTab] = useState("weather");
  const { theme, setTheme } = useTheme();

  return (
    <div className={`min-h-screen`}>
      <header className="bg-primary-foreground text-primary p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">React Assessment App</h1>
        <Button
          size={"icon"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-primary/90 hover:text-primary-foreground transition-colors duration-200"
        >
          {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
        </Button>
      </header>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-center">
          <TabsTrigger value="weather" className="flex items-center">
            <Sun className="mr-2" size={20} />
            Weather
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex items-center">
            <Bitcoin className="mr-2" size={20} />
            Crypto
          </TabsTrigger>
          <TabsTrigger value="covid" className="flex items-center">
            <Activity className="mr-2" size={20} />
            COVID-19
          </TabsTrigger>
        </TabsList>
        <main className="container max-w-4xl mx-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="weather">
                <WeatherSection darkMode={theme === "dark"} />
              </TabsContent>
              <TabsContent value="crypto">
                <CryptoSection darkMode={theme === "dark"} />
              </TabsContent>
              <TabsContent value="covid">
                <CovidSection darkMode={theme === "dark"} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </main>
      </Tabs>
    </div>
  );
}

export default App;
