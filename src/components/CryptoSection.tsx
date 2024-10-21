import { useState, useEffect } from "react";
import axios from "axios";
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
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
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface CryptoSectionProps {
  darkMode: boolean;
}

const CryptoSection: React.FC<CryptoSectionProps> = ({ darkMode }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [conversionAmount, setConversionAmount] = useState<number>(1);
  const [conversionCurrency, setConversionCurrency] = useState<string>("USD");

  useEffect(() => {
    fetchCryptoData();
  }, []);

  useEffect(() => {
    if (selectedCrypto) {
      fetchChartData(selectedCrypto);
    }
  }, [selectedCrypto]);

  const fetchCryptoData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
      );
      setCryptoData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch cryptocurrency data");
      setLoading(false);
    }
  };

  const fetchChartData = async (id: string) => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`
      );
      const prices = response.data.prices.map((price: number[]) => ({
        x: new Date(price[0]).toLocaleDateString(),
        y: price[1],
      }));

      setChartData({
        labels: prices.map((price: any) => price.x),
        datasets: [
          {
            label: "Price (USD)",
            data: prices.map((price: any) => price.y),
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      });
    } catch (err) {
      console.error("Failed to fetch chart data", err);
    }
  };

  const handleConversion = (crypto: CryptoData) => {
    if (conversionCurrency === "USD") {
      return (conversionAmount * crypto.current_price).toFixed(2);
    } else {
      // For simplicity, we're using a fixed exchange rate. In a real app, you'd fetch this from an API.
      const exchangeRates: { [key: string]: number } = {
        EUR: 0.84,
        GBP: 0.72,
        JPY: 110.14,
      };
      return (
        conversionAmount *
        crypto.current_price *
        exchangeRates[conversionCurrency]
      ).toFixed(2);
    }
  };

  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Cryptocurrency Prices</h2>
      <div className="mb-4 flex items-center justify-between">
        <Button
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 flex items-center transition-colors duration-200"
          onClick={fetchCryptoData}
        >
          <RefreshCw className="mr-2" size={20} /> Refresh Data
        </Button>
        <div className="flex items-center">
          <Label className="mr-2">Convert:</Label>
          <Input
            type="number"
            value={conversionAmount}
            onChange={(e) => setConversionAmount(Number(e.target.value))}
            className="border rounded px-2 py-1 mr-2 bg-background text-foreground"
          />
          <Select
            value={conversionCurrency}
            onValueChange={(value) => setConversionCurrency(value)}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="cur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="JPY">JPY</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {loading
          ? Array(10)
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
          : cryptoData.map((crypto) => (
              <Card
                key={crypto.id}
                className="shadow-lg cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => setSelectedCrypto(crypto.id)}
              >
                <CardHeader>
                  <CardTitle>
                    {crypto.name} ({crypto.symbol.toUpperCase()})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2">
                    <DollarSign className="mr-2" size={20} />
                    <span>${crypto.current_price.toFixed(2)}</span>
                  </div>
                  <div
                    className={`flex items-center ${
                      crypto.price_change_percentage_24h > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {crypto.price_change_percentage_24h > 0 ? (
                      <TrendingUp className="mr-2" size={20} />
                    ) : (
                      <TrendingDown className="mr-2" size={20} />
                    )}
                    <span>
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="font-semibold">
                      {conversionAmount} {crypto.symbol.toUpperCase()} ={" "}
                    </span>
                    <span>
                      {handleConversion(crypto)} {conversionCurrency}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
      {selectedCrypto && chartData && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>7-Day Price Chart</CardTitle>
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

export default CryptoSection;
