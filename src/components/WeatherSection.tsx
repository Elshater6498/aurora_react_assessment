import React, { useState, useEffect } from "react";
import axios from "axios";
import { Cloud, Droplet, Thermometer, Wind, Sun, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: { date: string; temp: number; condition: string }[];
}

interface WeatherSectionProps {
  darkMode: boolean;
}

const WeatherSection: React.FC<WeatherSectionProps> = ({ darkMode }) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCity, setSelectedCity] = useState<WeatherData | null>(null);
  const [searchCity, setSearchCity] = useState("");

  const cities = ["London", "New York", "Tokyo", "Sydney", "Paris"];

  useEffect(() => {
    fetchWeatherData(cities);
  }, []);

  const fetchWeatherData = async (citiesToFetch: string[]) => {
    setLoading(true);
    try {
      const apiKey = "923caf2db822fe7c75a4808398e53614"; // API key
      const requests = citiesToFetch.map((city) =>
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        )
      );
      const responses = await Promise.all(requests);
      const data = responses.map((response) => ({
        city: response.data.city.name,
        temperature: Math.round(response.data.list[0].main.temp),
        condition: response.data.list[0].weather[0].main,
        humidity: response.data.list[0].main.humidity,
        windSpeed: response.data.list[0].wind.speed,
        forecast: response.data.list.slice(1, 6).map((item: any) => ({
          date: new Date(item.dt * 1000).toLocaleDateString(),
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
        })),
      }));
      setWeatherData((prevData) => {
        const newData = [...prevData];
        data.forEach((city) => {
          const index = newData.findIndex((item) => item.city === city.city);
          if (index !== -1) {
            newData[index] = city;
          } else {
            newData.push(city);
          }
        });
        return newData;
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch weather data");
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchCity.trim() !== "") {
      await fetchWeatherData([searchCity]);
      setSearchCity("");
    }
  };

  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Weather Information</h2>
      <div className="mb-4 flex">
        <Input
          type="text"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          placeholder="Enter city name"
          className="flex-grow p-2 rounded-l-lg bg-background text-foreground border border-foreground"
        />
        <Button
          onClick={handleSearch}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-r-lg hover:bg-primary/90 transition-colors duration-200 flex items-center"
        >
          <Search size={20} className="mr-2" /> Search
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array(5)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="shadow-lg">
                  <CardHeader>
                    <CardTitle>
                      <Skeleton className="h-6 w-24" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))
          : weatherData.map((city) => (
              <Card
                key={city.city}
                className="shadow-lg cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => setSelectedCity(city)}
              >
                <CardHeader>
                  <CardTitle>{city.city}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2">
                    <Thermometer className="mr-2" size={20} />
                    <span>{city.temperature}°C</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Cloud className="mr-2" size={20} />
                    <span>{city.condition}</span>
                  </div>
                  <div className="flex items-center">
                    <Droplet className="mr-2" size={20} />
                    <span>{city.humidity}% Humidity</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {selectedCity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>{selectedCity.city} - Detailed Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="flex items-center">
                    <Thermometer className="mr-2" size={20} /> Temperature:{" "}
                    {selectedCity.temperature}°C
                  </p>
                  <p className="flex items-center">
                    <Cloud className="mr-2" size={20} /> Condition:{" "}
                    {selectedCity.condition}
                  </p>
                  <p className="flex items-center">
                    <Droplet className="mr-2" size={20} /> Humidity:{" "}
                    {selectedCity.humidity}%
                  </p>
                  <p className="flex items-center">
                    <Wind className="mr-2" size={20} /> Wind Speed:{" "}
                    {selectedCity.windSpeed} m/s
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">5-Day Forecast:</h4>
                  {selectedCity.forecast.map((day, index) => (
                    <p key={index} className="flex items-center">
                      <Sun className="mr-2" size={16} /> {day.date}: {day.temp}
                      °C, {day.condition}
                    </p>
                  ))}
                </div>
              </div>
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors duration-200"
                onClick={() => setSelectedCity(null)}
              >
                Close
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WeatherSection;
