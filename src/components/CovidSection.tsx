import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, UserMinus, UserCheck, Search } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CovidData {
  country: string;
  cases: number;
  deaths: number;
  recovered: number;
}

interface CovidSectionProps {
  darkMode: boolean;
}

const CovidSection: React.FC<CovidSectionProps> = ({ darkMode }) => {
  const [covidData, setCovidData] = useState<CovidData[]>([]);
  const [globalData, setGlobalData] = useState<CovidData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState<any>(null);
  const [searchCountry, setSearchCountry] = useState("");

  useEffect(() => {
    fetchCovidData();
  }, []);

  const fetchCovidData = async () => {
    setLoading(true);
    try {
      const [countriesResponse, globalResponse] = await Promise.all([
        axios.get("https://disease.sh/v3/covid-19/countries?sort=cases"),
        axios.get("https://disease.sh/v3/covid-19/all"),
      ]);
      setCovidData(countriesResponse.data.slice(0, 10)); // Get top 10 countries by cases
      setGlobalData(globalResponse.data);
      setLoading(false);
      fetchHistoricalData();
    } catch (err) {
      setError("Failed to fetch COVID-19 data");
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(
        "https://disease.sh/v3/covid-19/historical/all?lastdays=30"
      );
      const { cases } = response.data;

      const chartData = {
        labels: Object.keys(cases),
        datasets: [
          {
            label: "Global Cases",
            data: Object.values(cases),
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      };

      setChartData(chartData);
    } catch (err) {
      console.error("Failed to fetch historical data", err);
    }
  };

  const handleSearch = async () => {
    if (searchCountry.trim() !== "") {
      try {
        const response = await axios.get(
          `https://disease.sh/v3/covid-19/countries/${searchCountry}`
        );
        const newCountry = {
          country: response.data.country,
          cases: response.data.cases,
          deaths: response.data.deaths,
          recovered: response.data.recovered,
        };
        setCovidData((prevData) => [newCountry, ...prevData.slice(0, 9)]);
        setSearchCountry("");
      } catch (err) {
        setError("Failed to fetch data for the specified country");
      }
    }
  };

  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">COVID-19 Statistics</h2>

      <div className="mb-4 flex">
        <input
          type="text"
          value={searchCountry}
          onChange={(e) => setSearchCountry(e.target.value)}
          placeholder="Enter country name"
          className="flex-grow p-2 rounded-l-lg bg-background text-foreground"
        />
        <button
          onClick={handleSearch}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-r-lg hover:bg-primary/90 transition-colors duration-200 flex items-center"
        >
          <Search size={20} className="mr-2" /> Search
        </button>
      </div>

      {loading ? (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : (
        globalData && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Global Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Users className="mr-2" size={20} />
                  <span>Total Cases: {globalData.cases.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <UserMinus className="mr-2" size={20} />
                  <span>
                    Total Deaths: {globalData.deaths.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <UserCheck className="mr-2" size={20} />
                  <span>
                    Total Recovered: {globalData.recovered.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Country</th>
                  <th className="px-4 py-2 text-left">Total Cases</th>
                  <th className="px-4 py-2 text-left">Deaths</th>
                  <th className="px-4 py-2 text-left">Recovered</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(10)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-4 py-2">
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="px-4 py-2">
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="px-4 py-2">
                            <Skeleton className="h-4 w-16" />
                          </td>
                        </tr>
                      ))
                  : covidData.map((country) => (
                      <tr key={country.country} className="border-b">
                        <td className="px-4 py-2">{country.country}</td>
                        <td className="px-4 py-2">
                          {country.cases.toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          {country.deaths.toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          {country.recovered.toLocaleString()}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {chartData && (
        <Card>
          <CardHeader>
            <CardTitle>Global Cases Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: "calc(100vh - 300px)" }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        color: darkMode ? "white" : "black",
                      },
                    },
                    y: {
                      ticks: {
                        color: darkMode ? "white" : "black",
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: darkMode ? "white" : "black",
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CovidSection;
